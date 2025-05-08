import { registerUser, loginUser } from '../../../utils/auth';

class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleRegister(name, email, password) {
    try {
      this.view.showLoading();
      
      // 1. Register process
      await registerUser({ name, email, password });
      
      // 2. Auto-login after successful registration
      await loginUser(email, password);
      
      // 3. Update UI state
      window.dispatchEvent(new CustomEvent('auth-change', {
        detail: { isAuthenticated: true }
      }));

      // 4. Redirect to home
      this.view.redirectTo('/');
      
    } catch (error) {
      this.view.hideLoading();
      
      // Handle specific error cases
      let errorMessage = error.message;
      if (error.message.includes('unique')) {
        errorMessage = 'Email sudah terdaftar. <a href="#/login">Login disini</a>';
      } else if (error.message.includes('password')) {
        errorMessage = 'Password minimal 8 karakter';
      }
      
      this.view.showError(errorMessage);
    }
  }
}

export default RegisterPresenter;