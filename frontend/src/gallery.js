import { fetchPaintings, fetchArtists, getJpegUrl } from './api.js';
import { router } from './router.js';

export async function renderGallery(params) {
  const app = document.querySelector('#app');

  // Show loading state
  app.innerHTML = `
    <div class="container">
      <header>
        <h1>Mist and Clarity</h1>
        <p class="subtitle">Paintings by Fei Cheng-wu and Chang Chien-ying</p>
      </header>
      <div class="loading">Loading paintings...</div>
    </div>
  `;

  try {
    // Fetch artists for filter
    const artists = await fetchArtists();

    // Get filter from URL params
    const filters = {};
    if (params.get('artist_id')) {
      filters.artist_id = params.get('artist_id');
    }
    if (params.get('theme')) {
      filters.theme = params.get('theme');
    }

    // Fetch paintings
    const paintings = await fetchPaintings(filters);

    // Get unique themes for filter
    const themes = [...new Set(paintings.map(p => p.theme).filter(Boolean))].sort();

    // Render gallery
    app.innerHTML = `
      <div class="container">
        <header>
          <h1>Mist and Clarity</h1>
          <p class="subtitle">Paintings by Fei Cheng-wu and Chang Chien-ying</p>
          <div class="artist-links">
            <a href="/artist/fei-cheng-wu" data-link>About Fei Cheng-wu</a>
            <span class="separator">|</span>
            <a href="/artist/chang-chien-ying" data-link>About Chang Chien-ying</a>
          </div>
        </header>

        <div class="filters">
          <div class="filter-group">
            <label for="artist-filter">Artist:</label>
            <select id="artist-filter">
              <option value="">All Artists</option>
              ${artists.map(artist => `
                <option value="${artist.id}" ${filters.artist_id == artist.id ? 'selected' : ''}>
                  ${artist.name_preferred}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="filter-group">
            <label for="theme-filter">Theme:</label>
            <select id="theme-filter">
              <option value="">All Themes</option>
              ${themes.map(theme => `
                <option value="${theme}" ${filters.theme === theme ? 'selected' : ''}>
                  ${theme}
                </option>
              `).join('')}
            </select>
          </div>

          <button id="clear-filters">Clear Filters</button>
        </div>

        <div class="gallery-info">
          <p>Showing ${paintings.length} paintings</p>
        </div>

        <div class="gallery-grid">
          ${paintings.map(painting => `
            <div class="painting-card" data-id="${painting.id}">
              <a href="/painting/${painting.id}" data-link>
                <div class="painting-image">
                  <img
                    src="${getJpegUrl(painting.catalog_number)}"
                    alt="${painting.descriptive_title || painting.artists_title || 'Untitled'}"
                    loading="lazy"
                  />
                </div>
                <div class="painting-info">
                  <h3>${painting.descriptive_title || painting.artists_title || 'Untitled'}</h3>
                  <p class="artist">${painting.artist_name || 'Unknown Artist'}</p>
                  ${painting.theme ? `<p class="theme">${painting.theme}</p>` : ''}
                  ${painting.dimensions_h && painting.dimensions_w ?
                    `<p class="dimensions">${painting.dimensions_h} × ${painting.dimensions_w} cm</p>`
                    : ''}
                </div>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add filter event listeners
    document.getElementById('artist-filter').addEventListener('change', (e) => {
      const params = new URLSearchParams();
      if (e.target.value) params.set('artist_id', e.target.value);
      if (document.getElementById('theme-filter').value) {
        params.set('theme', document.getElementById('theme-filter').value);
      }
      router.navigate('/gallery?' + params.toString());
    });

    document.getElementById('theme-filter').addEventListener('change', (e) => {
      const params = new URLSearchParams();
      if (document.getElementById('artist-filter').value) {
        params.set('artist_id', document.getElementById('artist-filter').value);
      }
      if (e.target.value) params.set('theme', e.target.value);
      router.navigate('/gallery?' + params.toString());
    });

    document.getElementById('clear-filters').addEventListener('click', () => {
      router.navigate('/gallery');
    });

  } catch (error) {
    console.error('Error loading gallery:', error);
    app.innerHTML = `
      <div class="container">
        <header>
          <h1>Mist and Clarity</h1>
        </header>
        <div class="error">
          <p>Error loading paintings. Please make sure the backend server is running.</p>
          <p class="error-detail">${error.message}</p>
        </div>
      </div>
    `;
  }
}
