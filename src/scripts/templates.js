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

export function generateAuthenticatedNavigationListTemplate(userName, isSubscribed = false) {
  return `
    <li class="user-menu">
      <div class="user-greeting">Hi, ${userName}</div>
      ${isSubscribed ? generateUnsubscribeNotifButton() : generateSubscribeNotifButton()}
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

export function generateSubscribeNotifButton() {
  return `
    <button id="subscribeNotifBtn" class="notif-button">
      <i class="fas fa-bell"></i> Subscribe
    </button>
  `;
}

export function generateUnsubscribeNotifButton() {
  return `
    <button id="unsubscribeNotifBtn" class="notif-button">
      <i class="fas fa-bell-slash"></i> Unsubscribe
    </button>
  `;
}
