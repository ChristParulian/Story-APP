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
      <li><span class="user-greeting">Hi, ${userName}</span></li>
      <li><button id="logoutBtn" class="logout-button">Logout</button></li>
    `;
  }