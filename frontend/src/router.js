// Simple vanilla JS router
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.beforeNavigateCallbacks = [];

    // Listen for browser back/forward
    window.addEventListener('popstate', () => this.handleRoute());

    // Listen for link clicks - handle nested elements within data-link anchors
    document.addEventListener('click', (e) => {
      // Skip if clicking on a lightbox trigger image
      if (e.target.hasAttribute && e.target.hasAttribute('data-lightbox-trigger')) {
        return;
      }

      // Find the closest ancestor with data-link attribute
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.href);
      }
    });
  }

  // Register a callback to run before navigation
  onBeforeNavigate(callback) {
    this.beforeNavigateCallbacks.push(callback);
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigate(url) {
    history.pushState(null, null, url);
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Run beforeNavigate callbacks
    this.beforeNavigateCallbacks.forEach(callback => callback(path, params));

    // Match routes
    if (path === '/' || path === '/index.html') {
      this.currentRoute = this.routes['/'];
      if (this.currentRoute) this.currentRoute(params);
    } else if (path === '/intro') {
      this.currentRoute = this.routes['/intro'];
      if (this.currentRoute) this.currentRoute(params);
    } else if (path === '/collection') {
      this.currentRoute = this.routes['/collection'];
      if (this.currentRoute) this.currentRoute(params);
    } else if (path === '/gallery') {
      this.currentRoute = this.routes['/gallery'];
      if (this.currentRoute) this.currentRoute(params);
    } else if (path.startsWith('/painting/')) {
      const id = path.split('/')[2];
      this.currentRoute = this.routes['/painting/:id'];
      if (this.currentRoute) this.currentRoute(id, params);
    } else if (path.startsWith('/artist/')) {
      const slug = path.split('/')[2];
      this.currentRoute = this.routes['/artist/:slug'];
      if (this.currentRoute) this.currentRoute(slug, params);
    } else if (path.startsWith('/exhibition/')) {
      const id = path.split('/')[2];
      this.currentRoute = this.routes['/exhibition/:id'];
      if (this.currentRoute) this.currentRoute(id, params);
    } else if (path.startsWith('/collection/')) {
      const id = path.split('/')[2];
      this.currentRoute = this.routes['/collection/:id'];
      if (this.currentRoute) this.currentRoute(id, params);
    } else {
      // 404
      document.querySelector('#app').innerHTML = '<h1>404 - Page Not Found</h1>';
    }
  }

  start() {
    this.handleRoute();
  }
}

export const router = new Router();
