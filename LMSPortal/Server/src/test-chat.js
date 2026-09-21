import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import Message from './models/Message.js';
import { initSocket, isUserOnline } from './socket/socketHandler.js';
import chatService from './services/chatService.js';

let mongoServer;
let httpServer;
let ioServer;
let port;
const JWT_SECRET = 'lms_super_secret_jwt_key_2026_xyz!@#';
process.env.JWT_SECRET = JWT_SECRET;

async function runChatTests() {
  console.log('🧪 Starting LMS Real-Time Chat & Socket.IO Test Suite (PROMPT 12)...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // 1. Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('  📦 Connected to in-memory test database.');

    // 2. Setup Express & Socket.IO server on dynamic port
    const app = express();
    httpServer = http.createServer(app);
    ioServer = new Server(httpServer, {
      cors: { origin: '*' },
    });
    initSocket(ioServer);

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        console.log(`  🚀 Test Socket.IO server running on port ${port}.\n`);
        resolve();
      });
    });

    // 3. Create Student and Instructor users
    const student = await User.create({
      name: 'Elena Rostova',
      email: 'elena.student@lms.com',
      password: 'Password123!',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-student',
    });

    const instructor = await User.create({
      name: 'Prof. Marcus Bell',
      email: 'marcus.instructor@lms.com',
      password: 'Password123!',
      role: 'instructor',
      headline: 'Lead Neural Networks Researcher',
      avatar: 'https://images.unsplash.com/photo-instructor',
    });

    const course = await Course.create({
      title: 'Advanced Neural Architectures',
      description: 'Deep dive into transformers and state-space models.',
      category: 'Computer Science',
      level: 'Advanced',
      price: 99,
      published: true,
      instructor: instructor._id,
    });

    await Enrollment.create({
      student: student._id,
      course: course._id,
    });

    const studentToken = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '1d' });
    const instructorToken = jwt.sign({ id: instructor._id }, JWT_SECRET, { expiresIn: '1d' });

    // ==========================================
    // TEST GROUP 1: Authentication & Security
    // ==========================================
    console.log('🔹 Test Group 1: Socket.IO Authentication & Anti-Impersonation');

    // 1.1 Connection without token -> rejected
    let unauthenticatedRejected = false;
    await new Promise((resolve) => {
      const client = Client(`http://localhost:${port}`, {
        reconnection: false,
        timeout: 1000,
      });
      client.on('connect_error', (err) => {
        if (err.message.includes('Authentication error')) {
          unauthenticatedRejected = true;
        }
        client.disconnect();
        resolve();
      });
    });
    assert(unauthenticatedRejected, 'Unauthorized connection without JWT token is rejected');

    // 1.2 Connection with invalid token -> rejected
    let invalidTokenRejected = false;
    await new Promise((resolve) => {
      const client = Client(`http://localhost:${port}`, {
        auth: { token: 'invalid.jwt.token' },
        reconnection: false,
        timeout: 1000,
      });
      client.on('connect_error', (err) => {
        if (err.message.includes('Authentication error')) {
          invalidTokenRejected = true;
        }
        client.disconnect();
        resolve();
      });
    });
    assert(invalidTokenRejected, 'Connection with invalid JWT token is rejected');

    // 1.3 Connection with valid student token -> authenticated
    const studentSocket = Client(`http://localhost:${port}`, {
      auth: { token: studentToken },
      reconnection: false,
    });

    await new Promise((resolve) => {
      studentSocket.on('connect', () => {
        assert(studentSocket.connected, 'Student authenticated & connected successfully with valid JWT');
        resolve();
      });
    });

    // 1.4 Connection with valid instructor token -> authenticated
    const instructorSocket = Client(`http://localhost:${port}`, {
      auth: { token: instructorToken },
      reconnection: false,
    });

    await new Promise((resolve) => {
      instructorSocket.on('connect', () => {
        assert(instructorSocket.connected, 'Instructor authenticated & connected successfully with valid JWT');
        resolve();
      });
    });

    // ==========================================
    // TEST GROUP 2: Presence & Online/Offline Tracking
    // ==========================================
    console.log('\n🔹 Test Group 2: Real-Time Presence (Online/Offline Tracking)');

    assert(isUserOnline(student._id), 'isUserOnline reports Student is online');
    assert(isUserOnline(instructor._id), 'isUserOnline reports Instructor is online');

    // Verify online users list event
    let onlineUsersListReceived = false;
    await new Promise((resolve) => {
      const tempClient = Client(`http://localhost:${port}`, {
        auth: { token: studentToken },
      });
      tempClient.on('online_users', (list) => {
        if (list.includes(student._id.toString()) && list.includes(instructor._id.toString())) {
          onlineUsersListReceived = true;
        }
        tempClient.disconnect();
        resolve();
      });
    });
    assert(onlineUsersListReceived, 'Server emits active online users list to connected sockets');

    // ==========================================
    // TEST GROUP 3: Direct Student ↔ Instructor Messaging
    // ==========================================
    console.log('\n🔹 Test Group 3: Real-Time Direct Messaging');

    let messageReceivedByInstructor = null;
    const messagePromise = new Promise((resolve) => {
      instructorSocket.on('direct_message', (msg) => {
        messageReceivedByInstructor = msg;
        resolve();
      });
    });

    // Student sends message to Instructor (and attempts to send spoofed senderId)
    studentSocket.emit('send_direct_message', {
      recipientId: instructor._id.toString(),
      text: 'Hello Professor! I had a question regarding attention heads in Lecture 3.',
      senderId: 'spoofed_impersonated_id', // Should be IGNORED by backend!
    });

    await messagePromise;

    assert(messageReceivedByInstructor !== null, 'Instructor received direct message in real-time');
    assert(
      messageReceivedByInstructor.message ===
        'Hello Professor! I had a question regarding attention heads in Lecture 3.',
      'Message text matches student transmission'
    );
    assert(
      messageReceivedByInstructor.sender._id.toString() === student._id.toString(),
      'Anti-Impersonation: Sender is strictly verified as the authenticated student'
    );
    assert(messageReceivedByInstructor.read === false, 'New direct message starts with read: false');
    assert(messageReceivedByInstructor.timestamp !== undefined, 'Message includes timestamp');

    // Check persistence in MongoDB
    const persistedMsg = await Message.findById(messageReceivedByInstructor._id);
    assert(persistedMsg !== null, 'Message successfully persisted in MongoDB Message collection');

    // ==========================================
    // TEST GROUP 4: Read Receipts (Read Status & Real-time Update)
    // ==========================================
    console.log('\n🔹 Test Group 4: Read Status & Read Receipts');

    let readReceiptReceivedByStudent = false;
    const readReceiptPromise = new Promise((resolve) => {
      studentSocket.on('messages_read', (data) => {
        if (data.readerId === instructor._id.toString()) {
          readReceiptReceivedByStudent = true;
        }
        resolve();
      });
    });

    // Instructor marks student messages as read
    instructorSocket.emit('mark_messages_read', {
      senderId: student._id.toString(),
    });

    await readReceiptPromise;

    assert(readReceiptReceivedByStudent, 'Student received real-time read receipt event (messages_read)');

    // Verify in MongoDB
    const updatedMsg = await Message.findById(persistedMsg._id);
    assert(updatedMsg.read === true, 'Message read status updated to true in MongoDB');
    assert(
      updatedMsg.readBy.some((id) => id.toString() === instructor._id.toString()),
      'Reader ID appended to readBy array in MongoDB'
    );

    // ==========================================
    // TEST GROUP 5: Typing Indicators
    // ==========================================
    console.log('\n🔹 Test Group 5: Typing Indicators');

    let instructorSawTyping = false;
    const typingPromise = new Promise((resolve) => {
      instructorSocket.on('typing_status', (data) => {
        if (data.senderId === student._id.toString() && data.isTyping === true) {
          instructorSawTyping = true;
        }
        resolve();
      });
    });

    studentSocket.emit('typing_direct', { recipientId: instructor._id.toString() });
    await typingPromise;
    assert(instructorSawTyping, 'Instructor received typing status (isTyping: true) from student');

    let instructorSawStopTyping = false;
    const stopTypingPromise = new Promise((resolve) => {
      instructorSocket.on('typing_status', (data) => {
        if (data.senderId === student._id.toString() && data.isTyping === false) {
          instructorSawStopTyping = true;
        }
        resolve();
      });
    });

    studentSocket.emit('stop_typing_direct', { recipientId: instructor._id.toString() });
    await stopTypingPromise;
    assert(instructorSawStopTyping, 'Instructor received stop typing status (isTyping: false)');

    // ==========================================
    // TEST GROUP 6: REST API Services & Offline Messaging
    // ==========================================
    console.log('\n🔹 Test Group 6: REST API Services (Conversations, Contacts, Offline Handling)');

    // Instructor disconnects to become offline
    let studentSawInstructorOffline = false;
    const offlinePromise = new Promise((resolve) => {
      studentSocket.on('user_status', (data) => {
        if (data.userId === instructor._id.toString() && data.status === 'offline') {
          studentSawInstructorOffline = true;
        }
        resolve();
      });
    });

    instructorSocket.disconnect();
    await offlinePromise;
    assert(studentSawInstructorOffline, 'Student notified in real-time when Instructor went offline');
    assert(!isUserOnline(instructor._id), 'isUserOnline reports Instructor is offline');

    // Student sends another message to offline instructor
    studentSocket.emit('send_direct_message', {
      recipientId: instructor._id.toString(),
      text: 'Thanks for reviewing, Professor! See you tomorrow.',
    });

    // Wait a brief moment for database write
    await new Promise((r) => setTimeout(r, 100));

    // REST: Fetch conversations for Instructor
    const instructorConversations = await chatService.getConversations(instructor._id.toString());
    assert(instructorConversations.length === 1, 'Instructor has 1 conversation thread with Student');
    assert(instructorConversations[0].unreadCount === 1, 'Offline message correctly counted as 1 unread message');
    assert(
      instructorConversations[0].lastMessage.text ===
        'Thanks for reviewing, Professor! See you tomorrow.',
      'Last message snippet matches latest transmission'
    );

    // REST: Fetch direct message history
    const directMessages = await chatService.getDirectMessages(
      instructor._id.toString(),
      student._id.toString()
    );
    assert(directMessages.length === 2, 'History contains 2 messages between student and instructor');
    const freshlyReadMsg = await Message.findById(directMessages[1]._id);
    assert(freshlyReadMsg.read === true, 'getDirectMessages auto-marked incoming unread messages as read');

    // REST: Fetch Contacts (Student ↔ Instructor discovery)
    const studentContacts = await chatService.getContacts(student);
    assert(
      studentContacts.some((c) => c._id.toString() === instructor._id.toString()),
      'Student can discover their course instructor in contacts'
    );

    const instructorContacts = await chatService.getContacts(instructor);
    assert(
      instructorContacts.some((c) => c._id.toString() === student._id.toString()),
      'Instructor can discover enrolled student in contacts'
    );

    // Clean up
    studentSocket.disconnect();

    console.log(`\n========================================`);
    console.log(`🏁 Chat Test Suite Finished: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Unhandled error in chat tests:', err);
    process.exit(1);
  } finally {
    if (httpServer) httpServer.close();
    if (ioServer) ioServer.close();
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  }
}

runChatTests();
