import HomePage from "../pages/home/home-page";
import NewPage from "../pages/newpage/new-page";
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";
import StoryDetailPage from "../pages/story/story-detail-page";
import { isLoggedIn } from "../utils/auth";

const getRoutes = () => ({
  "/": isLoggedIn() ? new HomePage() : null,
  "/login": !isLoggedIn() ? new LoginPage() : { redirect: "/" },
  "/register": !isLoggedIn() ? new RegisterPage() : { redirect: "/" },
  "/new": isLoggedIn() ? new NewPage() : { redirect: "/" },
  "/stories/:id": isLoggedIn() ? new StoryDetailPage() : { redirect: "/login" },
});

export default getRoutes;
