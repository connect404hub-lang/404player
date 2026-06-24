process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lyrics ID parameter is required' }, { status: 400 });
    }

    const url = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&ctx=web6dot0&api_version=4&_format=json&_marker=0&lyrics_id=${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Lyrics fetch failed');
    const data = await res.json();

    if (!data || !data.lyrics) {
      return NextResponse.json({ lyrics: '[SYSTEM INFO] No scrollable lyrics compile target found for this module.' });
    }

    const cleanLyrics = data.lyrics
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'");

    return NextResponse.json({ lyrics: cleanLyrics });
  } catch (error) {
    console.error('Lyrics API proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
