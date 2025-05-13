import { registerUser, loginUser } from "../../../utils/auth";

class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleRegister(name, email, password) {
    try {
      this.view.showLoading();

      await registerUser({ name, email, password });

      await loginUser(email, password);

      window.dispatchEvent(
        new CustomEvent("auth-change", {
          detail: { isAuthenticated: true },
        }),
      );

      //Redirect to home
      this.view.redirectTo("/");
    } catch (error) {
      this.view.hideLoading();

      // Handle cases
      let errorMessage = error.message;
      if (error.message.includes("unique")) {
        errorMessage =
          'Email sudah terdaftar. <a href="#/login">Login disini</a>';
      } else if (error.message.includes("password")) {
        errorMessage = "Password minimal 8 karakter";
      }

      this.view.showError(errorMessage);
    }
  }
}

export default RegisterPresenter;
