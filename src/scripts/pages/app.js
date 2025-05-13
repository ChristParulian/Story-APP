import getRoutes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { isLoggedIn, logout, getUsername } from "../utils/auth";
import {
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateAuthenticatedNavigationListTemplate,
  generateLoadingIndicatorTemplate,
} from "../templates";
import Swal from "sweetalert2";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #loadingTimeout = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    if (!document.startViewTransition) {
      document.documentElement.classList.add("no-view-transitions");
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
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
          mainContent.setAttribute("tabindex", "-1");
          mainContent.focus();
          window.location.hash = "";
          window.location.hash = "#main-content";
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
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
          title: "Yakin Ingin Logout?",
          text: "Sesi kamu akan berakhir.",
          icon: "warning",
          confirmButtonColor: "#493628",
          cancelButtonColor: "#AB886D",
          showCancelButton: true,
          confirmButtonText: "Logout",
          cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
          Swal.fire({
            title: "Sedang logout...",
            text: "Harap tunggu sebentar",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          setTimeout(() => {
            logout();
            Swal.close();
            window.dispatchEvent(
              new CustomEvent("auth-change", {
                detail: { isAuthenticated: false },
              }),
            );
            this.#navigationDrawer.classList.remove("open");
          }, 1000);
        }
      });
    }
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

    if (this.#loadingTimeout) {
      clearTimeout(this.#loadingTimeout);
    }

    this.#content.innerHTML = generateLoadingIndicatorTemplate();
    const loadingElement = document.querySelector(".loading-overlay");

    this.#loadingTimeout = setTimeout(() => {
      loadingElement.classList.add("active");
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
      console.error("Error rendering page:", error);
      this.#content.innerHTML = `<div class="error-message">Gagal memuat halaman</div>`;
    } finally {
      clearTimeout(this.#loadingTimeout);
      const loadingElement = document.querySelector(".loading-overlay");
      if (loadingElement) {
        loadingElement.classList.remove("active");
        setTimeout(() => loadingElement.remove(), 300);
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
      console.error("Error rendering page content:", error);
      throw error;
    }
  }
}

export default App;
