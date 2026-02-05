// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to convert Dropbox preview link to raw image URL (legacy)
export function getImageUrl(dropboxLink) {
  if (!dropboxLink || dropboxLink.toLowerCase() === 'no') {
    return '/placeholder.jpg'; // We'll create a placeholder later
  }

  // Convert Dropbox preview URL to direct image URL
  // Change ?dl=0 to ?raw=1
  return dropboxLink.replace('?dl=0', '?raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
}

// Helper function to get local JPEG image URL from catalog number
export function getJpegUrl(catalogNumber) {
  if (!catalogNumber) {
    return '/placeholder.jpg';
  }

  // Pad catalog number to 4 digits (e.g., 3 -> "0003")
  const padded = String(catalogNumber).padStart(4, '0');
  return `/images/${padded}-a.jpg`;
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

// Fetch the active exhibition (single - legacy)
export async function fetchActiveExhibition() {
  const response = await fetch(`${API_BASE_URL}/collections/active`);
  if (!response.ok) {
    throw new Error('Failed to fetch active exhibition');
  }

  return response.json();
}

// Fetch all active exhibitions
export async function fetchActiveExhibitions() {
  const response = await fetch(`${API_BASE_URL}/collections`);
  if (!response.ok) {
    throw new Error('Failed to fetch active exhibitions');
  }

  const collections = await response.json();

  // Filter for active collections and fetch painting count for each
  const activeCollections = collections.filter(c => c.is_active);

  // Fetch painting count for each active collection
  const collectionsWithCounts = await Promise.all(
    activeCollections.map(async (collection) => {
      try {
        const collectionResponse = await fetch(`${API_BASE_URL}/collections/${collection.id}`);
        if (collectionResponse.ok) {
          const data = await collectionResponse.json();
          return { ...collection, painting_count: data.paintings?.length || 0 };
        }
      } catch (err) {
        console.error(`Error fetching paintings for collection ${collection.id}:`, err);
      }
      return { ...collection, painting_count: 0 };
    })
  );

  return collectionsWithCounts;
}

// Create a new collection/exhibition
export async function createCollection(name, description) {
  const response = await fetch(`${API_BASE_URL}/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description })
  });
  if (!response.ok) {
    throw new Error('Failed to create collection');
  }

  return response.json();
}

// Add painting to a collection/exhibition
export async function addToExhibition(collectionId, paintingId) {
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/paintings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ painting_id: paintingId })
  });
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Painting already in exhibition');
    }
    throw new Error('Failed to add painting to exhibition');
  }

  return response.json();
}

// Remove painting from a collection/exhibition
export async function removeFromExhibition(collectionId, paintingId) {
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/paintings/${paintingId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to remove painting from exhibition');
  }

  return response.json();
}

// Reorder paintings in a collection/exhibition
export async function reorderExhibition(collectionId, paintingIds) {
  const painting_orders = paintingIds.map((id, index) => ({
    painting_id: id,
    display_order: index
  }));

  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ painting_orders })
  });
  if (!response.ok) {
    throw new Error('Failed to reorder exhibition');
  }

  return response.json();
}

// Activate a collection as the current exhibition
export async function activateExhibition(collectionId) {
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/activate`, {
    method: 'PUT'
  });
  if (!response.ok) {
    throw new Error('Failed to activate exhibition');
  }

  return response.json();
}

// Update collection details
export async function updateCollection(collectionId, data) {
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Failed to update collection');
  }

  return response.json();
}

// Delete collection
export async function deleteCollection(collectionId) {
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete collection');
  }

  return response.json();
}
