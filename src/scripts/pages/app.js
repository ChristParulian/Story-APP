import getRoutes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { isLoggedIn, logout } from '../utils/auth';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._init();
    this._setupAuthListener();
  }

  _init() {
    this._setupDrawer();
    this._setupLogout();
  }

  _setupAuthListener() {
    window.addEventListener('auth-change', (event) => {
      this._handleAuthChange(event.detail.isAuthenticated);
    });
  }

  _handleAuthChange(isAuthenticated) {
    const currentPath = window.location.hash.replace('#', '') || '/';
    
    if (isAuthenticated && currentPath === '/login') {
      window.location.hash = '#/';
    }
    
    this.renderPage();
  }

  _setupDrawer() {
    // Kode drawer tetap sama
  }

  _setupLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      logout();
      window.dispatchEvent(new CustomEvent('auth-change', {
        detail: { isAuthenticated: false }
      }));
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const routes = getRoutes();
    const page = routes[url];
    
    if (!page) {
      window.location.hash = isLoggedIn() ? '#/' : '#/login';
      return;
    }

    if (page.redirect) {
      window.location.hash = page.redirect;
      return;
    }

    this.#content.innerHTML = await page.render();
    await page.afterRender();
  }
}

export default App;