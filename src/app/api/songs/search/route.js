import { NextResponse } from "next/server";
import { formatSong, formatAlbum, formatPlaylist } from "@/lib/formatter";

// Normalize spelling of common Hindi/Indian words, standardize vowels, and strip special characters
function normalizeSpelling(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/hain/g, "hai")
    .replace(/voh/g, "woh")
    .replace(/vo/g, "woh")
    .replace(/ye/g, "yeh")
    .replace(/aa/g, "a")
    .replace(/ee/g, "i")
    .replace(/oo/g, "o")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Detect if a song is non-original or derivative based on keywords
function isNonOriginal(title, album, query) {
  const penaltyTerms = [
    "remix", "lo-fi", "lofi", "slowed", "reverb", "cover", "instrumental",
    "karaoke", "tribute", "mashup", "dj", "8d", "acoustic", "unplugged",
    "recreation", "ringtone", "acapella", "instrument", "female version",
    "male version", "sad version", "speed up", "speedup", "slowed down",
    "cover version"
  ];
  const lowercaseTitle = title.toLowerCase();
  const lowercaseAlbum = album ? album.toLowerCase() : "";
  const lowercaseQuery = query.toLowerCase();

  for (const term of penaltyTerms) {
    const inTitle = lowercaseTitle.includes(term);
    const inAlbum = lowercaseAlbum.includes(term);
    const inQuery = lowercaseQuery.includes(term);

    // Apply penalty if the term is present in song title or album, but wasn't searched for by the user
    if ((inTitle || inAlbum) && !inQuery) {
      return true;
    }
  }
  return false;
}

// Detect if an album name implies it is a themed/compilation release rather than the original release
function isCompilationAlbum(album) {
  if (!album) return false;
  const lowercaseAlbum = album.toLowerCase();
  const compilationTerms = [
    "chansons tristes", "feeling like royalty", "temptation island", 
    "rupture amoureuse", "kaminabend", "soirée", "soiree", "romantique", 
    "sad songs", "love songs", "romantic", "hits", "best of", "collection", 
    "various", "monsoon", "monsoons", "compilation", "playlist", "workout", 
    "gym", "chill", "party", "summer", "top 100", "top 50", "top 10", 
    "hits of", "golden hits", "greatest hits", "essential", "essentials", 
    "tribute", "classics", "singles collection", "monsoon hits"
  ];
  for (const term of compilationTerms) {
    if (lowercaseAlbum.includes(term)) {
      return true;
    }
  }
  return false;
}

// Compute a relevance and popularity score for ranking
function scoreSong(song, query) {
  const title = song.title || "";
  const album = song.album || "";
  const playCount = parseInt(song.playCount || 0, 10) || 0;

  let score = 0;

  // 1. Popularity Base Score (log-scaled boost acting as a tie-breaker within relevance tiers)
  const popularityBoost = playCount > 0 ? Math.log10(playCount + 1) * 100 : 0;
  score += popularityBoost;

  // 2. Core Match Bonus
  // Strip metadata in parentheses/brackets for clean core name match
  const cleanedTitle = title.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "");
  const normalizedTitle = normalizeSpelling(cleanedTitle);
  const normalizedQuery = normalizeSpelling(query);

  const spacelessTitle = normalizedTitle.replace(/\s+/g, "");
  const spacelessQuery = normalizedQuery.replace(/\s+/g, "");

  if (spacelessTitle === spacelessQuery) {
    score += 5000; // Exact match (with or without spaces/transliterations)
  } else if (spacelessTitle.startsWith(spacelessQuery)) {
    score += 2500; // Prefix match
  } else if (normalizedTitle.includes(normalizedQuery) || spacelessTitle.includes(spacelessQuery)) {
    score += 1000; // Substring match
  } else {
    // Word overlap bonus
    const queryWords = normalizedQuery.split(" ").filter(Boolean);
    const titleWords = normalizedTitle.split(" ").filter(Boolean);
    let overlapCount = 0;
    for (const w of queryWords) {
      if (titleWords.includes(w)) {
        overlapCount++;
      }
    }
    const overlapRatio = queryWords.length > 0 ? overlapCount / queryWords.length : 0;
    score += overlapRatio * 500;
  }

  // 3. Originality Penalty (very large negative to drop below all original matching tracks)
  if (isNonOriginal(title, album, query)) {
    score -= 10000;
  }

  // 4. Compilation Album Penalty (forces theme compilations down below the official album/singles)
  if (isCompilationAlbum(album)) {
    score -= 500;
  }

  return score;
}

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
