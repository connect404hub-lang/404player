process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { NextResponse } from "next/server";
import { formatSong, formatAlbum, formatPlaylist } from "@/lib/formatter";
import { scoreSong } from "@/lib/scoring";


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type") || "global";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 },
      );
    }

    const encodedQuery = encodeURIComponent(query);

    if (type === "songs") {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&api_version=4&ctx=web6dot0&q=${encodedQuery}&n=30`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const songs = (data.results || []).map(formatSong).filter(Boolean);
      
      // Sort songs by score descending (highest relevance & original & popular first)
      songs.sort((a, b) => scoreSong(b, query) - scoreSong(a, query));
      
      return NextResponse.json({ songs });
    }

    if (type === "albums") {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getAlbumResults&_format=json&_marker=0&cc=in&api_version=4&ctx=web6dot0&q=${encodedQuery}&n=20`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const albums = (data.results || []).map(formatAlbum).filter(Boolean);
      return NextResponse.json({ albums });
    }

    if (type === "playlists") {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getPlaylistResults&_format=json&_marker=0&cc=in&api_version=4&ctx=web6dot0&q=${encodedQuery}&n=20`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const playlists = (data.results || [])
        .map(formatPlaylist)
        .filter(Boolean);
      return NextResponse.json({ playlists });
    }

    // Fetch comprehensive matches from dedicated song, album, and playlist search APIs concurrently
    const [songsData, albumsData, playlistsData] = await Promise.all([
      fetch(
        `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&api_version=4&ctx=web6dot0&q=${encodedQuery}&n=30`,
      )
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
      fetch(
        `https://www.jiosaavn.com/api.php?__call=search.getAlbumResults&_format=json&_marker=0&cc=in&api_version=4&ctx=web6dot0&q=${encodedQuery}&n=6`,
      )
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
      fetch(
        `https://www.jiosaavn.com/api.php?__call=search.getPlaylistResults&_format=json&_marker=0&cc=in&api_version=4&ctx=web6dot0&q=${encodedQuery}&n=6`,
      )
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]);

    const songs = (songsData?.results || []).map(formatSong).filter(Boolean);
    const albums = (albumsData?.results || []).map(formatAlbum).filter(Boolean);
    const playlists = (playlistsData?.results || [])
      .map(formatPlaylist)
      .filter(Boolean);

    // Sort global search songs by score descending
    songs.sort((a, b) => scoreSong(b, query) - scoreSong(a, query));

    // Keep play_count array synchronized with the sorted songs array
    const play_count = songs.map((song) => parseInt(song.playCount || 0, 10));

    return NextResponse.json({
      songs,
      albums,
      playlists,
      play_count,
    });
  } catch (error) {
    console.error("Search API proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
