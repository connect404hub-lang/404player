process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { NextResponse } from "next/server";
import { formatSong } from "@/lib/formatter";
import { scoreSong } from "@/lib/scoring";

function cleanHtml(str) {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const language = searchParams.get("language") || "english,tamil";

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        topquery: [],
        songs: [],
        artists: [],
        albums: [],
        playlists: []
      });
    }

    const encodedQuery = encodeURIComponent(query);

    // Concurrently fetch autocomplete and search results for songs to ensure consistency
    const [autocompleteRes, searchSongsRes] = await Promise.all([
      fetch(`https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&api_version=4&ctx=web6dot0&query=${encodedQuery}&languages=${language}`, {
        headers: {
          'Cookie': `L=${encodeURIComponent(language)}`
        }
      })
        .then(res => res.ok ? res.json() : null)
        .catch(() => null),
      fetch(`https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&api_version=4&ctx=web6dot0&q=${encodedQuery}&n=10&languages=${language}`, {
        headers: {
          'Cookie': `L=${encodeURIComponent(language)}`
        }
      })
        .then(res => res.ok ? res.json() : null)
        .catch(() => null),
    ]);

    const data = autocompleteRes || {};
    const rawTopQuery = data.topquery?.data || [];
    const rawArtists = data.artists?.data || [];
    const rawAlbums = data.albums?.data || [];
    const rawPlaylists = data.playlists?.data || [];

    // Universal mapper for suggestions (except songs resolved from search API)
    const mapItem = (item) => ({
      id: item.id,
      title: item.title ? cleanHtml(item.title) : "",
      subtitle: item.subtitle ? cleanHtml(item.subtitle) : "",
      description: item.description ? cleanHtml(item.description) : "",
      type: item.type || "song",
      image: item.image || "",
      artist: item.more_info?.singers || item.more_info?.primary_artists || item.more_info?.music || "",
    });

    // Process songs: prefer search results if available to ensure same output and format
    let songs = [];
    if (searchSongsRes && searchSongsRes.results && searchSongsRes.results.length > 0) {
      const formattedSongs = searchSongsRes.results.map(formatSong).filter(Boolean);
      // Sort using the same ranking algorithm
      formattedSongs.sort((a, b) => scoreSong(b, query) - scoreSong(a, query));
      // Map to suggestion item format while retaining URL and other properties
      songs = formattedSongs.map(song => ({
        ...song,
        type: "song",
        description: song.album || song.subtitle || "",
      }));
    } else {
      // Fallback to autocomplete songs if search results are not available
      const rawSongs = data.songs?.data || [];
      songs = rawSongs.map(mapItem);
    }

    const topquery = rawTopQuery.map(mapItem);
    const artists = rawArtists.map(mapItem);
    const albums = rawAlbums.map(mapItem);
    const playlists = rawPlaylists.map(mapItem);

    return NextResponse.json({
      topquery: topquery.slice(0, 1),
      songs: songs.slice(0, 5),
      artists: artists.slice(0, 3),
      albums: albums.slice(0, 3),
      playlists: playlists.slice(0, 3),
    });
  } catch (error) {
    console.error("Autocomplete API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
