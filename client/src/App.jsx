import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import WhatsAppPopup from './components/WhatsAppPopup';
import WhatsAppFloating from './components/WhatsAppFloating';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ScrollToTop from './components/ScrollToTop';

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


const ProtectedRoute = ({ children, allowedRole }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!userStr || !token) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  const userRole = user.role || 'creator'; // Default to creator for older test accounts

  // Temporarily bypass role checks since all users are currently creators
  // if (allowedRole && userRole !== allowedRole) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

// Prevent authenticated users from visiting Login/Register pages
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    return <Navigate to="/creator-dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              
              <Route 
                path="/creator-dashboard" 
                element={
                  <ProtectedRoute allowedRole="creator">
                    <DashboardCreator />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRole="creator">
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/edit-profile" 
                element={
                  <ProtectedRoute allowedRole="creator">
                    <EditProfile />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/payment-methods" 
                element={
                  <ProtectedRoute allowedRole="creator">
                    <PaymentMethods />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute allowedRole="creator">
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaign/:id" element={<CampaignDetails />} />
              <Route path="/for-creators" element={<ForCreators />} />
              <Route path="/learn" element={<Learn />} />
            </Routes>
          </Suspense>
          <WhatsAppPopup />
          <WhatsAppFloating />
          <MobileBottomNav />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
