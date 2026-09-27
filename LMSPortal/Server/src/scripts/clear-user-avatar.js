import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function clearAvatars() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to Mongo...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const result = await User.updateMany(
      {},
      { $set: { profileImage: '', avatar: '' } }
    );
    console.log('Successfully cleared avatars for users:', result);
    process.exit(0);
  } catch (err) {
    console.error('Failed to clear avatars:', err);
    process.exit(1);
  }
}

clearAvatars();
