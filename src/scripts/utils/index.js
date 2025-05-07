import '../styles/styles.css';
import App from './pages/app';
import { isLoggedIn } from './utils/auth';

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi app
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer')
  });

  // Render pertama kali
  app.renderPage();

  // Handle hash change
  window.addEventListener('hashchange', () => {
    app.renderPage();
  });
});