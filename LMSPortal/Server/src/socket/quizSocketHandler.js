/**
 * Real-Time Quiz Socket Handler
 * Powers Live Multiplayer Quiz Sessions, Synchronized Leaderboards,
 * Live Peer Progress, Instant Scoring, Floating Reactions, and Proctoring Telemetry.
 */

import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';

// In-memory active live quiz rooms: roomId -> RoomState
const activeQuizRooms = new Map();

/**
 * Helper to get or initialize an active quiz room
 */
const getOrCreateRoom = (roomId, quizId = null, title = 'Cyber-Academic Assessment') => {
  if (!activeQuizRooms.has(roomId)) {
    activeQuizRooms.set(roomId, {
      roomId,
      quizId,
      title,
      createdAt: new Date(),
      status: 'active', // 'waiting' | 'active' | 'finished'
      participants: new Map(), // userId -> ParticipantObject
      proctorAlerts: [],
      recentReactions: [],
    });
  }
  return activeQuizRooms.get(roomId);
};

/**
 * Format leaderboard from room participants
 */
const getRoomLeaderboard = (room) => {
  const list = Array.from(room.participants.values());
  // Sort by score descending, then by fastest completion or highest answered count
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return (a.totalTimeSpent || 9999) - (b.totalTimeSpent || 9999);
  });

  return list.map((p, index) => ({
    rank: index + 1,
    userId: p.userId,
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    streak: p.streak || 0,
    currentQuestion: p.currentQuestion || 0,
    answeredCount: p.answeredCount || 0,
    totalQuestions: p.totalQuestions || 10,
    accuracy: p.accuracy || 100,
    finished: !!p.finished,
    isOnline: !!p.isOnline,
  }));
};

/**
 * Register Quiz Real-Time Events on Socket
 */
export const registerQuizHandlers = (io, socket) => {
  const userId = socket.userId;
  const user = socket.user || { _id: userId, name: 'Anonymous Scholar', role: 'student' };

  // 1. Join Real-Time Quiz Room
  socket.on('quiz:join', ({ quizId, roomId: customRoomId, totalQuestions = 10, quizTitle }, callback) => {
    try {
      const roomId = customRoomId || `quiz_${quizId || 'default'}`;
      socket.join(roomId);
      socket.currentQuizRoom = roomId;

      const room = getOrCreateRoom(roomId, quizId, quizTitle);

      // Check if participant already exists in room or create fresh
      let participant = room.participants.get(userId);
      if (!participant) {
        // Calculate starting mock baseline for realistic cyber-classroom atmosphere if room is fresh
        participant = {
          userId,
          name: user.name || 'Scholar',
          avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name || 'Scholar'}`,
          role: user.role || 'student',
          socketId: socket.id,
          score: 0,
          streak: 0,
          currentQuestion: 0,
          answeredCount: 0,
          totalQuestions,
          accuracy: 100,
          totalTimeSpent: 0,
          finished: false,
          isOnline: true,
          joinedAt: new Date(),
        };
        room.participants.set(userId, participant);

        // Seed companion live participants if room is new (simulating live classroom active cohort)
        if (room.participants.size === 1) {
          const simulatedPeers = [
            {
              userId: 'peer_alex_01',
              name: 'Dr. Alex Vance',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: 'student',
              score: 70,
              streak: 3,
              currentQuestion: 4,
              answeredCount: 4,
              totalQuestions,
              accuracy: 92,
              totalTimeSpent: 65,
              finished: false,
              isOnline: true,
            },
            {
              userId: 'peer_elena_02',
              name: 'Elena Rostova',
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
              role: 'student',
              score: 60,
              streak: 2,
              currentQuestion: 3,
              answeredCount: 3,
              totalQuestions,
              accuracy: 88,
              totalTimeSpent: 72,
              finished: false,
              isOnline: true,
            },
          ];
          simulatedPeers.forEach((p) => room.participants.set(p.userId, p));
        }
      } else {
        participant.isOnline = true;
        participant.socketId = socket.id;
      }

      const leaderboard = getRoomLeaderboard(room);
      const participantList = Array.from(room.participants.values()).map((p) => ({
        userId: p.userId,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        streak: p.streak,
        currentQuestion: p.currentQuestion,
        isOnline: p.isOnline,
      }));

      // Acknowledge joiner with current state
      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId,
          quizId,
          participantsCount: room.participants.size,
          participant,
          leaderboard,
          participants: participantList,
        });
      }

      // Broadcast to entire room that a new peer joined
      io.to(roomId).emit('quiz:peer_joined', {
        userId,
        name: participant.name,
        avatar: participant.avatar,
        participantsCount: room.participants.size,
        leaderboard,
      });
    } catch (err) {
      console.error('[QuizSocket] Error on quiz:join:', err);
      if (typeof callback === 'function') callback({ error: 'Failed to join quiz room' });
    }
  });

  // 2. Real-Time Answer Submit & Score Live Update
  socket.on('quiz:submit_answer', ({ roomId: customRoomId, quizId, questionIndex, isCorrect, points = 10, timeSpentSeconds = 5 }, callback) => {
    try {
      const roomId = customRoomId || socket.currentQuizRoom || `quiz_${quizId || 'default'}`;
      const room = activeQuizRooms.get(roomId);
      if (!room) return;

      const participant = room.participants.get(userId);
      if (participant) {
        participant.answeredCount = Math.max(participant.answeredCount, (questionIndex || 0) + 1);
        participant.currentQuestion = (questionIndex || 0) + 1;
        participant.totalTimeSpent = (participant.totalTimeSpent || 0) + (timeSpentSeconds || 5);

        if (isCorrect) {
          participant.streak = (participant.streak || 0) + 1;
          // Streak bonus: +2 extra points if streak >= 2, +5 if streak >= 3
          const streakBonus = participant.streak >= 3 ? 5 : participant.streak >= 2 ? 2 : 0;
          participant.score = (participant.score || 0) + points + streakBonus;
        } else {
          participant.streak = 0;
        }

        // Update accuracy
        if (participant.answeredCount > 0) {
          const estimatedCorrect = Math.round(participant.score / 10);
          participant.accuracy = Math.min(100, Math.round((estimatedCorrect / participant.answeredCount) * 100));
        }

        const leaderboard = getRoomLeaderboard(room);

        // Send confirmation back to answering client
        if (typeof callback === 'function') {
          callback({
            success: true,
            score: participant.score,
            streak: participant.streak,
            rank: leaderboard.findIndex((p) => p.userId === userId) + 1,
            leaderboard,
          });
        }

        // Broadcast real-time score and leaderboard update to everyone in room
        io.to(roomId).emit('quiz:leaderboard_update', {
          roomId,
          leaderboard,
          event: {
            userId,
            name: participant.name,
            questionIndex,
            isCorrect,
            pointsEarned: isCorrect ? points : 0,
            streak: participant.streak,
          },
        });

        // Broadcast peer progress
        io.to(roomId).emit('quiz:peer_progress', {
          userId,
          name: participant.name,
          currentQuestion: participant.currentQuestion,
          answeredCount: participant.answeredCount,
          score: participant.score,
        });
      }
    } catch (err) {
      console.error('[QuizSocket] Error on quiz:submit_answer:', err);
    }
  });

  // 3. Real-Time Floating Emojis / Reactions
  socket.on('quiz:reaction', ({ roomId: customRoomId, emoji = '🔥' }) => {
    try {
      const roomId = customRoomId || socket.currentQuizRoom || 'quiz_default';
      const reactionPayload = {
        id: `react_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId,
        senderName: user.name || 'Scholar',
        emoji,
        timestamp: new Date(),
      };

      // Broadcast reaction to everyone in the room
      io.to(roomId).emit('quiz:new_reaction', reactionPayload);
    } catch (err) {
      console.error('[QuizSocket] Error on quiz:reaction:', err);
    }
  });

  // 4. Real-Time Proctoring & Integrity Telemetry
  socket.on('quiz:proctor_alert', ({ roomId: customRoomId, eventType = 'tab_switch', details = '' }) => {
    try {
      const roomId = customRoomId || socket.currentQuizRoom || 'quiz_default';
      const room = activeQuizRooms.get(roomId);
      const alertItem = {
        userId,
        name: user.name || 'Scholar',
        eventType, // 'tab_switch' | 'window_blur' | 'fullscreen_exit'
        details,
        timestamp: new Date(),
      };

      if (room) {
        room.proctorAlerts.push(alertItem);
        const participant = room.participants.get(userId);
        if (participant) {
          participant.proctorAlerts = (participant.proctorAlerts || 0) + 1;
        }
      }

      // Notify proctor/instructor listeners in the room
      io.to(roomId).emit('quiz:proctor_event_broadcast', alertItem);
    } catch (err) {
      console.error('[QuizSocket] Error on quiz:proctor_alert:', err);
    }
  });

  // 5. Final Assessment Completion & Live Victory Podium
  socket.on('quiz:finish', async ({ roomId: customRoomId, quizId, finalScore, totalPoints, percentage, passed, timeSpent }, callback) => {
    try {
      const roomId = customRoomId || socket.currentQuizRoom || `quiz_${quizId || 'default'}`;
      const room = activeQuizRooms.get(roomId);

      if (room) {
        const participant = room.participants.get(userId);
        if (participant) {
          participant.finished = true;
          participant.score = finalScore || participant.score;
          participant.totalTimeSpent = timeSpent || participant.totalTimeSpent;
          participant.completedAt = new Date();
        }

        const leaderboard = getRoomLeaderboard(room);
        const podium = leaderboard.slice(0, 3);

        io.to(roomId).emit('quiz:podium_update', {
          roomId,
          podium,
          leaderboard,
          finisher: {
            userId,
            name: user.name || 'Scholar',
            score: finalScore,
            percentage,
            passed,
          },
        });

        if (typeof callback === 'function') {
          callback({
            success: true,
            podium,
            leaderboard,
            rank: leaderboard.findIndex((p) => p.userId === userId) + 1,
          });
        }
      }
    } catch (err) {
      console.error('[QuizSocket] Error on quiz:finish:', err);
    }
  });

  // 6. Graceful Leave / Disconnect
  const handleLeave = () => {
    const roomId = socket.currentQuizRoom;
    if (!roomId) return;

    const room = activeQuizRooms.get(roomId);
    if (room && room.participants.has(userId)) {
      const participant = room.participants.get(userId);
      participant.isOnline = false;

      const leaderboard = getRoomLeaderboard(room);
      io.to(roomId).emit('quiz:peer_left', {
        userId,
        name: participant.name,
        participantsCount: Array.from(room.participants.values()).filter((p) => p.isOnline).length,
        leaderboard,
      });
    }
  };

  socket.on('quiz:leave', handleLeave);
  socket.on('disconnect', handleLeave);
};

export default {
  registerQuizHandlers,
};
