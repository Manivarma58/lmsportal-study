import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

dotenv.config();

const COURSE_IMAGES = {
  'neural-networks-quantum-computing': {
    thumbnail: '/assets/course-quantum.jpg',
    avatar: '/assets/instructor-elena.jpg',
  },
  'cyber-defense-cryptographic-security': {
    thumbnail: '/assets/course-cyber.jpg',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  'cloud-architecture-kubernetes-clusters': {
    thumbnail: '/assets/course-cloud.jpg',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  'zero-knowledge-proofs-rust': {
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  'autonomous-vector-databases-rag': {
    thumbnail: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  'deep-reinforcement-learning-robotics': {
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  },
  'distributed-systems-consensus': {
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  'applied-homomorphic-encryption': {
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  'gpu-kernel-dev-triton-cuda': {
    thumbnail: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  'ebpf-linux-observability-telemetry': {
    thumbnail: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  'llm-fine-tuning-lora-awq': {
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  'zero-trust-identity-spiffe-spire': {
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
};

const run = async () => {
  try {
    await connectDB();
    console.log('[UpdateThumbnails] Database connected.');

    const courses = await Course.find();
    console.log(`[UpdateThumbnails] Found ${courses.length} courses in DB.`);

    let updatedCount = 0;
    for (const c of courses) {
      const match = COURSE_IMAGES[c.slug];
      if (match) {
        c.thumbnail = match.thumbnail;
        c.instructorAvatar = match.avatar;
        await c.save();
        updatedCount++;
        console.log(`  ✓ Updated course: ${c.title} -> ${match.thumbnail.slice(0, 45)}...`);
      } else if (c.thumbnail && c.thumbnail.includes('googleusercontent.com')) {
        c.thumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
        await c.save();
        updatedCount++;
        console.log(`  ✓ Fallback updated course: ${c.title}`);
      }
    }

    // Also update User avatars if they contain googleusercontent.com
    const users = await User.find({ avatar: /googleusercontent\.com/i });
    console.log(`[UpdateThumbnails] Found ${users.length} users with googleusercontent avatars.`);
    for (const u of users) {
      if (u.name && u.name.includes('Elena')) {
        u.avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';
      } else {
        u.avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
      }
      await u.save();
      console.log(`  ✓ Updated user avatar: ${u.name}`);
    }

    console.log(`[UpdateThumbnails] Successfully updated ${updatedCount} courses.`);
  } catch (err) {
    console.error('[UpdateThumbnails] Error:', err);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

run();
