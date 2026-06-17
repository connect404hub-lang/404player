import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import History from '@/models/History';
import Favorite from '@/models/Favorite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cyber_security_key_12345';

async function getUserId(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    await dbConnect();

    if (type === 'favorite') {
      const favorites = await Favorite.find({ user: userId }).sort({ createdAt: -1 });
      const formatted = favorites.map(f => ({
        id: f.songId,
        title: f.title,
        artist: f.artist,
        image: f.image,
        duration: f.duration,
        createdAt: f.createdAt,
      }));
      return NextResponse.json({ favorites: formatted });
    }

    const history = await History.find({ user: userId }).sort({ playedAt: -1 }).limit(50);
    const formatted = history.map(h => ({
      id: h.songId,
      title: h.title,
      artist: h.artist,
      image: h.image,
      duration: h.duration,
      playedAt: h.playedAt,
    }));
    return NextResponse.json({ history: formatted });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();

    await dbConnect();

    if (type === 'favorite') {
      const { song, action } = body;
      if (action === 'add') {
        const fav = await Favorite.findOneAndUpdate(
          { user: userId, songId: song.id },
          {
            user: userId,
            songId: song.id,
            title: song.title,
            artist: song.artist,
            image: song.image,
            duration: song.duration,
          },
          { upsert: true, new: true }
        );
        return NextResponse.json({ favorite: fav });
      } else {
        const songId = song?.id || body.songId;
        await Favorite.deleteOne({ user: userId, songId });
        return NextResponse.json({ message: 'Removed from favorites' });
      }
    }

    const song = body;
    await History.deleteOne({ user: userId, songId: song.id });
    
    const hist = await History.create({
      user: userId,
      songId: song.id,
      title: song.title,
      artist: song.artist,
      image: song.image,
      duration: song.duration,
    });

    return NextResponse.json({ history: hist }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
