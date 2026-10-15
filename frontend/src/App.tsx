import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PublicQrMenuPage } from './pages/PublicQrMenuPage';
import { PublicOrderStatusPage } from './pages/PublicOrderStatusPage';

// Dashboard Pages
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { MenuStudioPage } from './pages/dashboard/MenuStudioPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { ReviewsPage } from './pages/dashboard/ReviewsPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { WastePage } from './pages/dashboard/WastePage';
import { ActionsPage } from './pages/dashboard/ActionsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Marketing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public Customer Digital QR Menu & Tracking */}
          <Route path="/m/:slug" element={<PublicQrMenuPage />} />
          <Route path="/m/:slug/order-status/:orderNumber" element={<PublicOrderStatusPage />} />

          {/* Authenticated Restaurant Workspace Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverviewPage />} />
            <Route path="menu" element={<MenuStudioPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="waste" element={<WastePage />} />
            <Route path="actions" element={<ActionsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
