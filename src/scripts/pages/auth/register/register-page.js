import RegisterPresenter from "./register-presenter";

class RegisterPage {
  constructor() {
    this.presenter = new RegisterPresenter(this);
  }

  async render() {
    return `
      <div class="auth-container">
        <h2 class="auth-title">Buat Akun</h2>
        <form id="registerForm" class="auth-form">
          <div class="form-group">
            <label for="name">Nama:</label>
            <input type="text" id="name" class="form-input" placeholder="Masukkan Nama Anda" required minlength="3">
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" class="form-input" placeholder="Masukkan Email Anda" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" class="form-input" placeholder="Masukkan Password Anda" required minlength="8">
          </div>
          <button type="submit" class="auth-button" id="submitBtn">
            <span id="buttonText">Daftar</span>
            <div id="loadingSpinner" class="loading-spinner hidden"></div>
          </button>
        </form>
        <div class="auth-link">
          Sudah punya akun? <a href="#/login">Login disini</a>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById("registerForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      await this.presenter.handleRegister(name, email, password);
    });
  }

  showLoading() {
    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    document.getElementById("buttonText").textContent = "Loading...";
    document.getElementById("loadingSpinner").classList.remove("hidden");
  }

  hideLoading() {
    const btn = document.getElementById("submitBtn");
    btn.disabled = false;
    document.getElementById("buttonText").textContent = "Daftar";
    document.getElementById("loadingSpinner").classList.add("hidden");
  }

  showError(message) {
    const form = document.getElementById("registerForm");
    const existingError = form.querySelector(".error-message");
    if (existingError) existingError.remove();

    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.innerHTML = message;
    form.prepend(errorElement);

    setTimeout(() => {
      errorElement.classList.add("fade-out");
      setTimeout(() => errorElement.remove(), 300);
    }, 5000);
  }

  redirectTo(path) {
    window.location.hash = path;
  }
}

export default RegisterPage;
