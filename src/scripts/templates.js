export function generateMainNavigationListTemplate() {
  return `
    <li><a href="#/">Beranda</a></li>
    <li><a href="#/about">Tentang</a></li>
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