/**
 * App Component
 * Main application entry point with routing
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Layout, AuthLayout, HubLayout } from '@/components/layout';
import { LoadingOverlay } from '@/components/ui';

// Import i18n configuration
import '@/utils/i18n';

// Public pages — kept eager. These are the crawlable, SEO-relevant routes and
// are individually lightweight, so there's no page-speed reason to split them
// further; splitting would only add request-waterfall latency for pages that
// need to render immediately.
import Landing from '@/pages/Landing';

// Authenticated-only pages — lazy-loaded. None of these are crawlable (all
// already Disallow'd in robots.txt), and eagerly importing all 11 was the
// entire reason the JS bundle was 661KB/one chunk with nothing split out.
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Checkin = lazy(() => import('@/pages/Checkin'));
const Coach = lazy(() => import('@/pages/Coach'));
const Learning = lazy(() => import('@/pages/Learning'));
const Circles = lazy(() => import('@/pages/Circles'));
const CirclesAdmin = lazy(() => import('@/pages/CirclesAdmin'));
const Progress = lazy(() => import('@/pages/Progress'));
const Profile = lazy(() => import('@/pages/Profile'));
const Feedback = lazy(() => import('@/pages/Feedback'));
const Admin = lazy(() => import('@/pages/Admin'));
const Hub = lazy(() => import('@/pages/Hub'));

// Auth pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';

// Legal pages
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import TermsOfService from '@/pages/legal/TermsOfService';
import CookiePolicy from '@/pages/legal/CookiePolicy';

/**
 * Protected Route - Requires authentication
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Public Route - Redirects to dashboard if already authenticated
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay fullScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * App Routes
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Landing page - redirects to dashboard if authenticated */}
      <Route
        path="/"
        element={<Landing />}
      />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Legal routes (public) */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />

      {/* Hub admin - DISABLED: route commented out, /hub will 404 to dashboard */}
      {/* <Route element={<HubLayout />}>
        <Route path="/hub" element={<Suspense fallback={<LoadingOverlay fullScreen />}><Hub /></Suspense>} />
      </Route> */}

      {/* Check-in (fullscreen, no sidebar) */}
      <Route
        path="/checkin"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingOverlay fullScreen />}>
              <Checkin />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Protected app routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Suspense fallback={<LoadingOverlay fullScreen />}><Dashboard /></Suspense>} />
        <Route path="/coach" element={<Suspense fallback={<LoadingOverlay fullScreen />}><Coach /></Suspense>} />
        <Route path="/learning" element={<Suspense fallback={<LoadingOverlay fullScreen />}><Learning /></Suspense>} />
        <Route path="/circles" element={<Suspense fallback={<LoadingOverlay fullScreen />}><Circles /></Suspense>} />
        <Route path="/circles/admin" element={<Suspense fallback={<LoadingOverlay fullScreen />}><CirclesAdmin /></Suspense>} />
        <Route path="/progress" element={<Suspense fallback={<LoadingOverlay fullScreen />}><Progress /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<LoadingOverlay fullScreen />}><Profile /></Suspense>} />
        <Route path="/feedback" element={<Suspense fallback={<LoadingOverlay fullScreen />}><Feedback /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<LoadingOverlay fullScreen />}><Admin /></Suspense>} />
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
