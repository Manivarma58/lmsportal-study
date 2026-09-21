import mongoose from 'mongoose';
import dns from 'dns';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_portal';

  // Fix for querySrv ECONNREFUSED on MongoDB Atlas SRV lookups
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    } catch (dnsErr) {
      console.warn('[MongoDB] Custom DNS server notice:', dnsErr.message);
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB] Connected to external instance: ${conn.connection.host}`);
  } catch (err) {
    console.log(`[MongoDB] External MongoDB unavailable (${err.message}). Starting In-Memory MongoDB Server...`);

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] In-Memory MongoDB connected successfully: ${conn.connection.host}`);
    } catch (memErr) {
      console.error(`[MongoDB] Failed to start In-Memory MongoDB:`, memErr);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
