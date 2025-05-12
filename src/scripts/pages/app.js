import getRoutes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { isLoggedIn, logout, getUsername } from "../utils/auth";
import {
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateAuthenticatedNavigationListTemplate,
  generateLoadingIndicatorTemplate
} from "../templates";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #loadingTimeout = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    // Add fallback class if View Transitions not supported
    if (!document.startViewTransition) {
      document.documentElement.classList.add('no-view-transitions');
    }

    this._init();
    this._setupAuthListener();
    this._setupNavigation();
    this._setupSkipLink();
  }

  _init() {
    this._setupDrawer();
    this._setupLogout();
  }

  _setupSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.setAttribute('tabindex', '-1');
          mainContent.focus();
          window.location.hash = '';
          window.location.hash = '#main-content';
        }
      });
    }
  }

  _setupAuthListener() {
    window.addEventListener("auth-change", (event) => {
      this._handleAuthChange(event.detail.isAuthenticated);
    });
  }

  _setupNavigation() {
    const navList = document.getElementById("nav-list");
    if (!navList) return;

    const mainNavItems = generateMainNavigationListTemplate();
    let authNavItems = "";

    if (isLoggedIn()) {
      const userName = getUsername() || "Pengguna";
      authNavItems = generateAuthenticatedNavigationListTemplate(userName);
    } else {
      authNavItems = generateUnauthenticatedNavigationListTemplate();
    }

    navList.innerHTML = mainNavItems + authNavItems;
    this._setupLogout();
  }

  _setupDrawer() {
    this.#drawerButton?.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    // Close drawer when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !this.#navigationDrawer.contains(e.target) &&
        e.target !== this.#drawerButton
      ) {
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  _setupLogout() {
    document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Yakin ingin logout?")) {
        logout();
        window.dispatchEvent(
          new CustomEvent("auth-change", {
            detail: { isAuthenticated: false },
          }),
        );
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  _handleAuthChange(isAuthenticated) {
    const currentPath = window.location.hash.replace("#", "") || "/";

    if (isAuthenticated && currentPath === "/login") {
      window.location.hash = "#/";
    }

    this._setupNavigation();
    this.renderPage();
  }

  async renderPage() {
    const url = getActiveRoute();
    const routes = getRoutes();
    const page = routes[url];

    if (!page) {
      window.location.hash = isLoggedIn() ? "#/" : "#/login";
      return;
    }

    if (page.redirect) {
      window.location.hash = page.redirect;
      return;
    }

    // Clear any existing timeout
    if (this.#loadingTimeout) {
      clearTimeout(this.#loadingTimeout);
    }

    // Show loading with slight delay
    this.#content.innerHTML = generateLoadingIndicatorTemplate();
    const loadingElement = document.querySelector('.loading-overlay');
    
    // Only show loading if it takes more than 300ms
    this.#loadingTimeout = setTimeout(() => {
      loadingElement.classList.add('active');
    }, 300);

    try {
      if (document.startViewTransition) {
        const transition = document.startViewTransition(async () => {
          await this._renderPageContent(page);
        });
        await transition.finished;
      } else {
        await this._renderPageContent(page);
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      this.#content.innerHTML = `<div class="error-message">Gagal memuat halaman</div>`;
    } finally {
      // Hide loading immediately
      clearTimeout(this.#loadingTimeout);
      const loadingElement = document.querySelector('.loading-overlay');
      if (loadingElement) {
        loadingElement.classList.remove('active');
        // Remove after animation completes
        setTimeout(() => {
          loadingElement.remove();
        }, 300);
      }
      this.#navigationDrawer.classList.remove("open");
    }
  }

  async _renderPageContent(page) {
    try {
      const content = await page.render();
      this.#content.innerHTML = content;
      await page.afterRender();
    } catch (error) {
      console.error('Error rendering page content:', error);
      throw error;
    }
  }
}

export default App;