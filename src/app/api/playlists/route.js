import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Playlist from '@/models/Playlist';
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
    const playlists = await Playlist.find({ owner: userId }).sort({ createdAt: -1 });
    return NextResponse.json({ playlists });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });

    await dbConnect();
    const playlist = await Playlist.create({
      name,
      description,
      owner: userId,
      songs: [],
    });

    return NextResponse.json({ playlist }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('id');

    if (!playlistId) return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });

    await dbConnect();
    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
    if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });

    const body = await request.json();
    const { song, songId, action } = body;

    if (action === 'add') {
      if (!song) return NextResponse.json({ error: 'Song details required' }, { status: 400 });
      if (playlist.songs.some(s => s.songId === song.id)) {
        return NextResponse.json({ playlist });
      }
      playlist.songs.push({
        songId: song.id,
        title: song.title,
        artist: song.artist,
        image: song.image,
        duration: song.duration,
      });
    } else if (action === 'remove') {
      if (!songId) return NextResponse.json({ error: 'Song ID required' }, { status: 400 });
      playlist.songs = playlist.songs.filter(s => s.songId !== songId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await playlist.save();
    return NextResponse.json({ playlist });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('id');

    if (!playlistId) return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });

    await dbConnect();
    const result = await Playlist.deleteOne({ _id: playlistId, owner: userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
