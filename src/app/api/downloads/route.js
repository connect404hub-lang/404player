import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Download from '@/models/Download';
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

    await dbConnect();
    const downloads = await Download.find({ user: userId }).sort({ downloadedAt: -1 });
    const formatted = downloads.map(d => ({
      id: d.songId,
      title: d.title,
      artist: d.artist,
      image: d.image,
      duration: d.duration,
      downloadedAt: d.downloadedAt,
    }));
    return NextResponse.json({ downloads: formatted });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const song = await request.json();
    if (!song || !song.id) return NextResponse.json({ error: 'Song details required' }, { status: 400 });

    await dbConnect();
    const existing = await Download.findOne({ user: userId, songId: song.id });
    if (existing) {
      return NextResponse.json({ download: existing });
    }

    const dl = await Download.create({
      user: userId,
      songId: song.id,
      title: song.title,
      artist: song.artist,
      image: song.image,
      duration: song.duration,
    });

    return NextResponse.json({ download: dl }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
