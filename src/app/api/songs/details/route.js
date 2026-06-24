process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { NextResponse } from 'next/server';
import { formatSong, formatAlbum, formatPlaylist } from '@/lib/formatter';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'song';

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    if (type === 'song') {
      const url = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0&_format=json&pids=${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch song details');
      const data = await res.json();
      
      const songRaw = data[id];
      if (!songRaw) {
        return NextResponse.json({ error: 'Song not found' }, { status: 404 });
      }
      
      const song = formatSong(songRaw);
      return NextResponse.json({ song });
    }

    if (type === 'album') {
      const url = `https://www.jiosaavn.com/api.php?__call=content.getAlbumDetails&_format=json&cc=in&_marker=0&albumid=${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch album details');
      const data = await res.json();
      const album = formatAlbum(data);
      return NextResponse.json({ album });
    }

    if (type === 'playlist') {
      const url = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&cc=in&_marker=0&listid=${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch playlist details');
      const data = await res.json();
      const playlist = formatPlaylist(data);
      return NextResponse.json({ playlist });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Details API proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
