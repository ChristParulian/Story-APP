export function generateMainNavigationListTemplate() {
  return `
    <li><a href="#/">Beranda</a></li>
    <li><a href="#/new">Tambah Story</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a id="login-button" href="#/login">Login</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate(userName) {
  return `
    <li class="user-menu">
      <div class="user-greeting">Hi, ${userName}</div>
      <button id="logoutBtn" class="logout-button">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </li>
  `;
}

export function generateLoadingIndicatorTemplate() {
  return `
    <div class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p class="loading-text">Memuat...</p>
      </div>
    </div>
  `;
}
