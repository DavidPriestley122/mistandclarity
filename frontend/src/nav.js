import { isAdminMode, adminLink } from './admin.js';

/**
 * Generates the site-wide navigation HTML
 * Preserves admin mode state across navigation
 */
export function renderNavigation() {
  const adminMode = isAdminMode();
  const currentPath = window.location.pathname;

  // Helper function to check if a path is active
  const isActive = (path) => {
    if (path === '/about') {
      return currentPath === '/about';
    }
    if (path === '/intro') {
      return currentPath === '/intro';
    }
    if (path === '/gallery') {
      return currentPath === '/gallery';
    }
    if (path.startsWith('/artist/')) {
      return currentPath === path;
    }
    return false;
  };

  return `
    <header class="site-header">
      <!-- Navigation -->
      <nav class="header-nav">
        <div class="site-branding">
          <a href="${adminLink('/')}" data-link class="site-title">Vermillion Pavilion</a>
        </div>
        <div class="nav-links">
          <a href="${adminLink('/about')}" data-link class="${isActive('/about') ? 'active' : ''}">About</a>
          <a href="${adminLink('/intro')}" data-link class="${isActive('/intro') ? 'active' : ''}">Introduction</a>
          <a href="${adminLink('/gallery')}" data-link class="${isActive('/gallery') ? 'active' : ''}">Gallery</a>
          <a href="${adminLink('/artist/chang-chien-ying')}" data-link class="${isActive('/artist/chang-chien-ying') ? 'active' : ''}">Chang Chien-ying</a>
          <a href="${adminLink('/artist/fei-cheng-wu')}" data-link class="${isActive('/artist/fei-cheng-wu') ? 'active' : ''}">Fei Cheng-wu</a>
        </div>
        <div class="nav-actions">
          <button class="translate-btn" onclick="alert('Translation feature coming soon')">中文</button>
        </div>
      </nav>
    </header>
  `;
}
