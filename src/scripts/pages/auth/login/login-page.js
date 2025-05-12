import LoginPresenter from "./login-presenter";

class LoginPage {
  constructor() {
    this.presenter = new LoginPresenter(this);
  }

  async render() {
    return `
      <div class="login-container">
        <h2 class="login-title">Masuk ke Dicoding Story</h2>
        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" class="form-input" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-input" required minlength="8">
          </div>
          <button type="submit" class="login-button" id="submitBtn">
            <span id="buttonText">Masuk</span>
            <div id="loadingSpinner" class="loading-spinner hidden"></div>
          </button>
        </form>
        <div class="auth-link">
          Belum punya akun? <a href="#/register">Daftar disini</a>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById("loginForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      await this.presenter.handleLogin(email, password);
    });
  }

  showLoading() {
    const submitBtn = document.getElementById("submitBtn");
    const buttonText = document.getElementById("buttonText");
    const spinner = document.getElementById("loadingSpinner");

    submitBtn.disabled = true;
    buttonText.textContent = "Memproses...";
    spinner.classList.remove("hidden");
  }

  hideLoading() {
    const submitBtn = document.getElementById("submitBtn");
    const buttonText = document.getElementById("buttonText");
    const spinner = document.getElementById("loadingSpinner");

    submitBtn.disabled = false;
    buttonText.textContent = "Masuk";
    spinner.classList.add("hidden");
  }

  redirectTo(path) {
    window.location.hash = path;
  }

  showError(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    document.getElementById("loginForm").prepend(errorElement);

    setTimeout(() => {
      errorElement.remove();
    }, 3000);
  }
}

export default LoginPage;
