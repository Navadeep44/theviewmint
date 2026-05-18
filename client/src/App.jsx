import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import WhatsAppPopup from './components/WhatsAppPopup';
import WhatsAppFloating from './components/WhatsAppFloating';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ScrollToTop from './components/ScrollToTop';
import { SocketProvider } from './context/SocketContext';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const DashboardCreator = lazy(() => import('./pages/DashboardCreator'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const ForCreators = lazy(() => import('./pages/ForCreators'));
const Learn = lazy(() => import('./pages/Learn'));
const CampaignDetails = lazy(() => import('./pages/CampaignDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const PaymentMethods = lazy(() => import('./pages/PaymentMethods'));
const Notifications = lazy(() => import('./pages/Notifications'));

// Admin App
const AdminApp = lazy(() => import('./admin/AdminApp'));

const ProtectedRoute = ({ children, allowedRole }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!userStr || !token) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  const userRole = user.role || 'creator';

  if (allowedRole === 'admin' && userRole !== 'admin' && userRole !== 'superadmin') {
    return <Navigate to="/creator-dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    const user = JSON.parse(userStr);
    if (user.role === 'admin' || user.role === 'superadmin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/creator-dashboard" replace />;
  }
  
  return children;
};

// Layout wrapper for user-facing pages
const UserLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
    <WhatsAppPopup />
    <WhatsAppFloating />
    <MobileBottomNav />
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <SocketProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#0f0f13]"><div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            {/* Admin Routes (No User Layout) */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRole="admin">
                <AdminApp />
              </ProtectedRoute>
            } />

            {/* Public Auth Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* User Facing Routes with Layout */}
            <Route path="/*" element={
              <UserLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/campaign/:id" element={<CampaignDetails />} />
                  <Route path="/for-creators" element={<ForCreators />} />
                  <Route path="/learn" element={<Learn />} />
                  
                  {/* Protected Creator Routes */}
                  <Route path="/creator-dashboard" element={<ProtectedRoute allowedRole="creator"><DashboardCreator /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute allowedRole="creator"><Profile /></ProtectedRoute>} />
                  <Route path="/edit-profile" element={<ProtectedRoute allowedRole="creator"><EditProfile /></ProtectedRoute>} />
                  <Route path="/payment-methods" element={<ProtectedRoute allowedRole="creator"><PaymentMethods /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute allowedRole="creator"><Notifications /></ProtectedRoute>} />
                </Routes>
              </UserLayout>
            } />
          </Routes>
        </Suspense>
      </SocketProvider>
    </Router>
  );
}

export default App;
