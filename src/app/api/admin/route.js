import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Playlist from '@/models/Playlist';
import Favorite from '@/models/Favorite';
import History from '@/models/History';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cyber_security_key_12345';

async function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return null;
    return decoded.id;
  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    await dbConnect();
    const users = await User.find({}, '-password').sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments({});
    const totalPlaylists = await Playlist.countDocuments({});
    const totalFavorites = await Favorite.countDocuments({});
    const totalHistory = await History.countDocuments({});

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        totalPlaylists,
        totalFavorites,
        totalHistory,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { targetUserId, action } = await request.json();
    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await dbConnect();
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Cannot modify other admin roles' }, { status: 400 });
    }

    if (action === 'ban') {
      targetUser.isBanned = true;
    } else if (action === 'unban') {
      targetUser.isBanned = false;
    } else if (action === 'delete') {
      await User.deleteOne({ _id: targetUserId });
      return NextResponse.json({ message: 'User deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await targetUser.save();
    return NextResponse.json({
      message: `User ${targetUser.username} has been ${action}ned successfully`,
      user: {
        id: targetUser._id,
        username: targetUser.username,
        isBanned: targetUser.isBanned,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
