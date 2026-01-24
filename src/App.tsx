import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { EditorPage } from './pages/EditorPage';
import { TrashPageWrapper } from './pages/TrashPageWrapper';
import { FeedPage } from './pages/FeedPage';
import { RequireAuth } from './components/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          {/* 1. Index Route (Home) */}
          <Route index element={<EditorPage />} />
          
          {/* 2. Feed & Trash */}
          <Route path="feed" element={<FeedPage />} />
          <Route path="trash" element={<TrashPageWrapper />} />

          {/* 3. CRITICAL FIX: The Dynamic Page Route */}
          {/* This tells React Router that /:pageId is a valid path! */}
          <Route path=":pageId" element={<EditorPage />} />
          
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}