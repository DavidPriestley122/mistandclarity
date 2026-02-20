// Admin mode state management

export function isAdminParamPresent() {
  return new URLSearchParams(window.location.search).get('admin') === 'true';
}

export function getAdminToken() {
  return sessionStorage.getItem('adminToken');
}

export function setAdminToken(token) {
  sessionStorage.setItem('adminToken', token);
}

export function clearAdminToken() {
  sessionStorage.removeItem('adminToken');
}

// Admin mode requires both the ?admin=true param AND a valid token
export function isAdminMode() {
  return isAdminParamPresent() && !!getAdminToken();
}

// Preserve admin mode when navigating - returns path with admin param if needed
export function adminLink(path) {
  if (!isAdminParamPresent()) {
    return path;
  }

  // Handle paths that already have query params
  if (path.includes('?')) {
    return path + '&admin=true';
  }
  return path + '?admin=true';
}

// Get URL search params preserving admin mode
export function getSearchParams() {
  const params = new URLSearchParams(window.location.search);
  return params;
}

// Build URL with filters and admin mode
export function buildGalleryUrl(filters = {}) {
  const params = new URLSearchParams();

  if (filters.artist_id) params.set('artist_id', filters.artist_id);
  if (filters.theme) params.set('theme', filters.theme);
  if (isAdminParamPresent()) params.set('admin', 'true');

  const query = params.toString();
  return '/gallery' + (query ? '?' + query : '');
}
