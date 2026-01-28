import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AdminPage } from './pages/AdminPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { EditorPage } from './pages/EditorPage';
import { TrashPageWrapper } from './pages/TrashPageWrapper';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { UserProfilePage } from './pages/UserProfilePage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { TemplateDetailPage } from './pages/TemplateDetailPage';
import { InboxPage } from './pages/InboxPage';
import { RequireAuth } from './components/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        {/* Legacy auth routes for backward compatibility */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<EditorPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="feed/blog/:id" element={<BlogDetailPage />} />
          <Route path="feed/template/:id" element={<TemplateDetailPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="user/:userId" element={<UserProfilePage />} />
          <Route path="trash" element={<TrashPageWrapper />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}