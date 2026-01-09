// Simple vanilla JS router
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;

    // Listen for browser back/forward
    window.addEventListener('popstate', () => this.handleRoute());

    // Listen for link clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        this.navigate(e.target.href);
      }
    });
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

    // Match routes
    if (path === '/' || path === '/index.html') {
      this.currentRoute = this.routes['/'];
      if (this.currentRoute) this.currentRoute(params);
    } else if (path.startsWith('/painting/')) {
      const id = path.split('/')[2];
      this.currentRoute = this.routes['/painting/:id'];
      if (this.currentRoute) this.currentRoute(id, params);
    } else if (path.startsWith('/artist/')) {
      const slug = path.split('/')[2];
      this.currentRoute = this.routes['/artist/:slug'];
      if (this.currentRoute) this.currentRoute(slug, params);
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
