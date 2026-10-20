import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import "./App.css";

// Import context
import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import SiteNav from "./components/SiteNav";
import { theme } from "./theme";

// Import pages
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import CuisinePage from "./pages/CuisinePage/CuisinePage";
import RecipeDetailPage from "./pages/RecipeDetailPage/RecipeDetailPage";

import StatusPage from "./pages/StatusPage";
import AllRecipesPage from "./pages/AllRecipesPage/AllRecipesPage";
import TrendingRecipesPage from "./pages/TrendingRecipesPage/TrendingRecipesPage";
import CommunityPage from "./pages/CommunityPage/CommunityPage";
import UserProfilePage from "./pages/UserProfilePage/UserProfilePage";
import CreatePostPage from "./pages/CreatePostPage/CreatePostPage";
import PostDetailPage from "./pages/PostDetailPage/PostDetailPage";
import CallbackPage from "./pages/CallbackPage";

function App() {
  // Add Bootstrap Icons in head
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

    return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <UserProvider>
    <ToastProvider>
      <Router>
        <SiteNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/cuisine/:cuisineId" element={<CuisinePage />} />
          <Route path="/recipe/:recipeId" element={<RecipeDetailPage />} />
            {/* API status page is a developer tool, so it only exists in local dev */}
            {import.meta.env.DEV && <Route path="/status" element={<StatusPage />} />}
            <Route path="/all-recipes" element={<AllRecipesPage />} />
            <Route path="/trending-recipes" element={<TrendingRecipesPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
        </Routes>
      </Router>
    </ToastProvider>
    </UserProvider>
    </ThemeProvider>
  );
}

export default App;