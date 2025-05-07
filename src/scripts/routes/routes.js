import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login/login-page';
import { isLoggedIn } from '../utils/auth';

const getRoutes = () => ({
  '/': isLoggedIn() ? new HomePage() : null,
  '/login': !isLoggedIn() ? new LoginPage() : { redirect: '/' },
  '/about': isLoggedIn() ? new AboutPage() : null
});

export default getRoutes;