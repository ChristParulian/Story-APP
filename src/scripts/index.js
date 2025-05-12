import "../styles/styles.css";
import App from "./pages/app.js";
import { isLoggedIn } from "./utils/auth";

document.addEventListener("DOMContentLoaded", () => {
  // Tambahkan skip link secara dinamis
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to Content';
  document.body.insertBefore(skipLink, document.body.firstChild);



  // Force initial redirect if needed
  if (!isLoggedIn() && window.location.hash !== "#/login") {
    window.location.hash = "#/login";
  } else if (isLoggedIn() && window.location.hash === "#/login") {
    window.location.hash = "#/";
  }

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  app.renderPage();

  window.addEventListener("hashchange", () => {
    app.renderPage();
  });
});
