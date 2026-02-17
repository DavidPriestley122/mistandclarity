import { isAdminMode, adminLink } from './admin.js';
import { t, getLang, setLanguage } from './i18n.js';
import { rerenderCurrentRoute } from './router.js';

/**
 * Generates the site-wide navigation HTML
 * Preserves admin mode state across navigation
 */
export function renderNavigation() {
  const adminMode = isAdminMode();
  const currentPath = window.location.pathname;

  // Helper function to check if a path is active
  const isActive = (path) => {
    if (path === '/collection') {
      return currentPath === '/collection';
    }
    if (path === '/intro') {
      return currentPath === '/intro';
    }
    if (path === '/gallery') {
      return currentPath === '/gallery';
    }
    if (path === '/contact') {
      return currentPath === '/contact';
    }
    if (path === '/artists') {
      return currentPath === '/artists' || currentPath.startsWith('/artist/');
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
          <a href="${adminLink('/')}" data-link class="site-title">${t('nav.site')}</a>
        </div>
        <div class="nav-links">
          <a href="${adminLink('/gallery')}" data-link class="${isActive('/gallery') ? 'active' : ''}">${t('nav.gallery')}</a>
          <a href="${adminLink('/artists')}" data-link class="${isActive('/artists') ? 'active' : ''}">${t('nav.artists')}</a>
          <a href="${adminLink('/intro')}" data-link class="${isActive('/intro') ? 'active' : ''}">${t('nav.story')}</a>
          <a href="${adminLink('/collection')}" data-link class="${isActive('/collection') ? 'active' : ''}">${t('nav.about')}</a>
          <a href="${adminLink('/contact')}" data-link class="${isActive('/contact') ? 'active' : ''}">${t('nav.contact')}</a>
        </div>
        <div class="nav-actions">
          <button class="translate-btn" id="lang-toggle-btn">${t('nav.langToggle')}</button>
        </div>
      </nav>
    </header>
  `;
}

// Attach language toggle listener after nav is rendered into the DOM
export function attachLangToggle() {
  const btn = document.getElementById('lang-toggle-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    setLanguage(getLang() === 'en' ? 'zh' : 'en');
    rerenderCurrentRoute();
  });
}
