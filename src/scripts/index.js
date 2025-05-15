import "../styles/styles.css";
import App from "./pages/app.js";
import { isLoggedIn } from "./utils/auth";

document.addEventListener("DOMContentLoaded", () => {
  // Create skip link
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.className = "skip-link";
  skipLink.textContent = "Skip to Content";
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Handle initial auth state
  if (!isLoggedIn() && window.location.hash !== "#/login") {
    window.location.hash = "#/login";
  } else if (isLoggedIn() && window.location.hash === "#/login") {
    window.location.hash = "#/";
  }

  // Initialize app
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  const renderApp = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        app.renderPage();
      });
    } else {
      app.renderPage();
    }
  };

  renderApp();

  window.addEventListener("hashchange", () => {
    renderApp();
  });
});