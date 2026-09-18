import ChatMessage from '../models/ChatMessage.js';
import Course from '../models/Course.js';

export const getMessagesByRoom = async (req, res, next) => {
  try {
    const { room } = req.params;
    const { limit = 50 } = req.query;

    const messages = await ChatMessage.find({ room })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { room, text, courseId, recipientId, attachments } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const message = await ChatMessage.create({
      sender: req.user.id,
      room: room || 'general',
      course: courseId || undefined,
      recipient: recipientId || undefined,
      text: text.trim(),
      attachments: attachments || [],
      readBy: [req.user.id],
    });

    const populated = await ChatMessage.findById(message._id).populate(
      'sender',
      'name avatar role'
    );

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const getChannels = async (req, res, next) => {
  try {
    const channels = [
      {
        id: 'general',
        title: '🌐 General Discussion',
        description: 'Community-wide channel for all LMS members',
        type: 'general',
      },
    ];

    const courses = await Course.find({ isPublished: true }).select('title thumbnail');
    courses.forEach((c) => {
      channels.push({
        id: `course_${c._id}`,
        courseId: c._id,
        title: `📚 ${c.title}`,
        description: 'Course study group and Q&A',
        type: 'course',
      });
    });

    res.status(200).json({
      success: true,
      channels,
    });
  } catch (err) {
    next(err);
  }
};
