// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

// Helper function to convert Dropbox preview link to raw image URL (legacy)
export function getImageUrl(dropboxLink) {
  if (!dropboxLink || dropboxLink.toLowerCase() === 'no') {
    return '/placeholder.jpg'; // We'll create a placeholder later
  }

  // Convert Dropbox preview URL to direct image URL
  // Change ?dl=0 to ?raw=1
  return dropboxLink.replace('?dl=0', '?raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
}

// Helper function to get JPEG image URL from backend
export function getJpegUrl(jpegPath) {
  if (!jpegPath) {
    return '/placeholder.jpg';
  }

  // jpegPath is like "/images/front/0001-a.jpg"
  return `${SERVER_BASE_URL}${jpegPath}`;
}

// Fetch all paintings with optional filters
export async function fetchPaintings(filters = {}) {
  const params = new URLSearchParams();

  if (filters.artist_id) params.append('artist_id', filters.artist_id);
  if (filters.theme) params.append('theme', filters.theme);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const url = `${API_BASE_URL}/paintings${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch paintings');
  }

  return response.json();
}

// Fetch single painting by ID
export async function fetchPainting(id) {
  const response = await fetch(`${API_BASE_URL}/paintings/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch painting');
  }

  return response.json();
}

// Fetch all artists
export async function fetchArtists() {
  const response = await fetch(`${API_BASE_URL}/artists`);
  if (!response.ok) {
    throw new Error('Failed to fetch artists');
  }

  return response.json();
}

// Fetch all collections
export async function fetchCollections() {
  const response = await fetch(`${API_BASE_URL}/collections`);
  if (!response.ok) {
    throw new Error('Failed to fetch collections');
  }

  return response.json();
}

// Fetch collection with paintings
export async function fetchCollection(id) {
  const response = await fetch(`${API_BASE_URL}/collections/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch collection');
  }

  return response.json();
}
