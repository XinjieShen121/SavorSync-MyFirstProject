import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import "./App.css";

// Import context
import { UserProvider } from "./context/UserContext";
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
import ImageUploadDemo from "./pages/ImageUploadDemo/ImageUploadDemo";
import TrendingRecipesPage from "./pages/TrendingRecipesPage/TrendingRecipesPage";
import CommunityPage from "./pages/CommunityPage/CommunityPage";
import UserProfilePage from "./pages/UserProfilePage/UserProfilePage";
import ProfileImageUploadDemo from "./pages/ProfileImageUploadDemo/ProfileImageUploadDemo";
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

    // Add Google Fonts
    const fontsLink = document.createElement('link');
    fontsLink.rel = 'stylesheet';
    fontsLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontsLink);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontsLink);
    };
  }, []);

    return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/cuisine/:cuisineId" element={<CuisinePage />} />
          <Route path="/recipe/:recipeId" element={<RecipeDetailPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/all-recipes" element={<AllRecipesPage />} />
            <Route path="/upload-demo" element={<ImageUploadDemo />} />
            <Route path="/trending-recipes" element={<TrendingRecipesPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="/profile-upload-demo" element={<ProfileImageUploadDemo />} />
        </Routes>
      </Router>
    </UserProvider>
    </ThemeProvider>
  );
}

export default App;