import api from '../../../data/api';
import CONFIG from '../../../config';

class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleLogin(email, password) {
    try {
      this.view.showLoading();

      const response = await api.login(email, password);

      if (response.error) {
        throw new Error(response.message);
      }

      localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, response.loginResult.token);

      window.dispatchEvent(new CustomEvent('auth-change', {
        detail: { isAuthenticated: true }
      }));

      // Redirect langsung tanpa setTimeout
      this.view.redirectTo('/');

    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message);
    }
  }
}

export default LoginPresenter;