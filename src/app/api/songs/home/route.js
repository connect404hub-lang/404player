import { NextResponse } from 'next/server';
import { formatSong, formatAlbum, formatPlaylist } from '@/lib/formatter';

export async function GET(request) {
  try {
    const res = await fetch(
      'https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=web6dot0',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!res.ok) {
      throw new Error('JioSaavn API request failed');
    }
    
    const data = await res.json();
    
    const trending = (data.new_trending || []).map(item => {
      if (item.type === 'song') return { ...formatSong(item), type: 'song' };
      if (item.type === 'album') return { ...formatAlbum(item), type: 'album' };
      if (item.type === 'playlist') return { ...formatPlaylist(item), type: 'playlist' };
      return item;
    }).filter(Boolean);

    const newReleases = (data.new_albums || []).map(item => {
      if (item.type === 'song') {
        const songObj = formatSong(item);
        if (!songObj) return null;
        return {
          id: songObj.albumId || songObj.id,
          title: songObj.album || songObj.title,
          image: songObj.image,
          artist: songObj.artist,
          year: songObj.year,
          type: 'album',
          songCount: 1,
        };
      }
      return { ...formatAlbum(item), type: 'album' };
    }).filter(Boolean);

    const topPlaylists = (data.top_playlists || []).map(formatPlaylist).filter(Boolean);

    const charts = (data.charts || []).map(formatPlaylist).filter(Boolean);

    return NextResponse.json({
      trending,
      newReleases,
      topPlaylists,
      charts,
    });
  } catch (error) {
    console.error('Home API proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
