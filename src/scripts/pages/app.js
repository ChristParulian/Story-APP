import getRoutes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { isLoggedIn, logout, getUsername } from '../utils/auth';
import { 
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateAuthenticatedNavigationListTemplate
} from '../templates';

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
    this._setupNavigation();
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

  _setupNavigation() {
    const navList = document.getElementById('nav-list');
    if (!navList) return;

    const mainNavItems = generateMainNavigationListTemplate();
    let authNavItems = '';

    if (isLoggedIn()) {
      const userName = getUsername() || 'Pengguna';
      authNavItems = generateAuthenticatedNavigationListTemplate(userName);
    } else {
      authNavItems = generateUnauthenticatedNavigationListTemplate();
    }

    navList.innerHTML = mainNavItems + authNavItems;
    this._setupLogout();
  }

  _setupDrawer() {
    this.#drawerButton?.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.#navigationDrawer.contains(e.target) && 
          e.target !== this.#drawerButton) {
        this.#navigationDrawer.classList.remove('open');
      }
    });
  }

  _setupLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Yakin ingin logout?')) {
        logout();
        window.dispatchEvent(new CustomEvent('auth-change', {
          detail: { isAuthenticated: false }
        }));
        this.#navigationDrawer.classList.remove('open');
      }
    });
  }

  _handleAuthChange(isAuthenticated) {
    const currentPath = window.location.hash.replace('#', '') || '/';
    
    if (isAuthenticated && currentPath === '/login') {
      window.location.hash = '#/';
    }
    
    this._setupNavigation();
    this.renderPage();
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
    this.#navigationDrawer.classList.remove('open');
  }
}

export default App;