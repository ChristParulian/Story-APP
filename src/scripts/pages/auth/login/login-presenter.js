import api from "../../../data/api";
import CONFIG from "../../../config";
import { saveAuthData } from "../../../utils/auth";

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

      saveAuthData(response.loginResult.token, response.loginResult.name);

      window.dispatchEvent(
        new CustomEvent("auth-change", {
          detail: { isAuthenticated: true },
        }),
      );

      setTimeout(() => {
        this.view.redirectTo("/");
      }, 500);
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message);
    }
  }
}

export default LoginPresenter;
