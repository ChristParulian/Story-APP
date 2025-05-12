import "../styles/styles.css";
import App from "./pages/app.js";
import { isLoggedIn } from "./utils/auth";

document.addEventListener("DOMContentLoaded", () => {
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
