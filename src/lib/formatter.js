import { decryptMediaUrl } from './decrypt';

export function formatImage(imageUrl) {
  if (!imageUrl) return '';
  return imageUrl.replace('150x150', '500x500').replace('50x50', '500x500');
}

export function formatSong(song) {
  if (!song) return null;
  
  const moreInfo = song.more_info || {};
  
  // Resolve artist
  let artist = song.subtitle || '';
  if (moreInfo.artistMap && moreInfo.artistMap.primary_artists && moreInfo.artistMap.primary_artists.length > 0) {
    artist = moreInfo.artistMap.primary_artists.map(a => a.name).join(', ');
  } else if (moreInfo.artistMap && moreInfo.artistMap.artists && moreInfo.artistMap.artists.length > 0) {
    artist = moreInfo.artistMap.artists.map(a => a.name).join(', ');
  } else if (song.primary_artists) {
    artist = song.primary_artists;
  } else if (song.singers) {
    artist = song.singers;
  }
  
  // Resolve title
  const rawTitle = song.title || song.song || '';
  const title = rawTitle.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'");

  // Resolve subtitle
  const rawSubtitle = song.subtitle || song.description || '';
  const subtitle = rawSubtitle.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'");

  // Resolve album
  const rawAlbum = moreInfo.album || song.album || '';
  const album = rawAlbum.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'");

  // Resolve media URL
  const encryptedUrl = moreInfo.encrypted_media_url || song.encrypted_media_url || song.encrypted_drm_media_url || '';
  const url = encryptedUrl ? decryptMediaUrl(encryptedUrl) : '';

  // Resolve other fields
  const hasLyricsVal = moreInfo.has_lyrics || song.has_lyrics || false;
  const hasLyrics = hasLyricsVal === 'true' || hasLyricsVal === true;

  const explicitVal = song.explicit_content || 0;
  const explicit = explicitVal === '1' || explicitVal === 1;

  const duration = parseInt(moreInfo.duration || song.duration || 0, 10);

  return {
    id: song.id,
    title,
    subtitle,
    artist: artist ? artist.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'") : 'Unknown Artist',
    image: formatImage(song.image),
    album,
    albumId: moreInfo.album_id || song.albumid || '',
    duration,
    url,
    hasLyrics,
    explicit,
    year: song.year || moreInfo.release_date || '',
    playCount: song.play_count || '',
  };
}

export function formatAlbum(album) {
  if (!album) return null;
  return {
    id: album.id || album.albumid || '',
    title: album.title ? album.title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'") : '',
    image: formatImage(album.image),
    artist: album.subtitle || '',
    year: album.year || '',
    songCount: album.more_info?.song_count || album.songs?.length || 0,
    songs: album.songs ? album.songs.map(formatSong).filter(Boolean) : [],
  };
}

export function formatPlaylist(playlist) {
  if (!playlist) return null;
  return {
    id: playlist.id || playlist.listid,
    title: playlist.title || playlist.listname || playlist.name,
    image: formatImage(playlist.image),
    subtitle: playlist.subtitle || '',
    songCount: playlist.songs?.length || playlist.more_info?.song_count || 0,
    songs: playlist.songs ? playlist.songs.map(formatSong).filter(Boolean) : [],
  };
}
