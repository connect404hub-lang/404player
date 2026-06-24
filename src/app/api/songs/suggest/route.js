import { NextResponse } from "next/server";

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
function isNonOriginal(title, subtitle, query) {
  const penaltyTerms = [
    "remix", "lo-fi", "lofi", "slowed", "reverb", "cover", "instrumental",
    "karaoke", "tribute", "mashup", "dj", "8d", "acoustic", "unplugged",
    "recreation", "ringtone", "acapella", "instrument", "female version",
    "male version", "sad version", "speed up", "speedup", "slowed down",
    "cover version"
  ];
  const lowercaseTitle = title.toLowerCase();
  const lowercaseSubtitle = subtitle ? subtitle.toLowerCase() : "";
  const lowercaseQuery = query.toLowerCase();

  for (const term of penaltyTerms) {
    const inTitle = lowercaseTitle.includes(term);
    const inSubtitle = lowercaseSubtitle.includes(term);
    const inQuery = lowercaseQuery.includes(term);

    // Apply penalty if the term is present in song title or subtitle, but wasn't searched for by the user
    if ((inTitle || inSubtitle) && !inQuery) {
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

// Compute relevance score for suggestions
function scoreSuggestion(song, query) {
  const title = song.title || "";
  const subtitle = song.subtitle || "";
  const album = song.more_info?.album || subtitle || "";
  const scoreRaw = parseFloat(song.more_info?.score || 0);

  let score = 0;

  // 1. Base Score from JioSaavn Autocomplete Score
  score += scoreRaw / 100;

  // 2. Core Match Bonus
  const cleanedTitle = title.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "");
  const normalizedTitle = normalizeSpelling(cleanedTitle);
  const normalizedQuery = normalizeSpelling(query);

  const spacelessTitle = normalizedTitle.replace(/\s+/g, "");
  const spacelessQuery = normalizedQuery.replace(/\s+/g, "");

  if (spacelessTitle === spacelessQuery) {
    score += 5000;
  } else if (spacelessTitle.startsWith(spacelessQuery)) {
    score += 2500;
  } else if (normalizedTitle.includes(normalizedQuery) || spacelessTitle.includes(spacelessQuery)) {
    score += 1000;
  }

  // 3. Originality Penalty
  if (isNonOriginal(title, subtitle, query)) {
    score -= 10000;
  }

  // 4. Compilation Album Penalty
  if (isCompilationAlbum(album)) {
    score -= 500;
  }

  return score;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

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
    const url = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&api_version=4&ctx=web6dot0&query=${encodedQuery}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Autocomplete API request failed");
    
    const data = await res.json();
    const rawTopQuery = data?.topquery?.data || [];
    const rawSongs = data?.songs?.data || [];
    const rawArtists = data?.artists?.data || [];
    const rawAlbums = data?.albums?.data || [];
    const rawPlaylists = data?.playlists?.data || [];
    
    // Sort raw songs based on our tuned relevance scoring algorithm
    rawSongs.sort((a, b) => scoreSuggestion(b, query) - scoreSuggestion(a, query));

    // Universal mapper for suggestions
    const mapItem = (item) => ({
      id: item.id,
      title: item.title ? cleanHtml(item.title) : "",
      subtitle: item.subtitle ? cleanHtml(item.subtitle) : "",
      description: item.description ? cleanHtml(item.description) : "",
      type: item.type || "song",
      image: item.image || "",
      artist: item.more_info?.singers || item.more_info?.primary_artists || item.more_info?.music || "",
    });

    const topquery = rawTopQuery.map(mapItem);
    const songs = rawSongs.map(mapItem);
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
