import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardCreator from './pages/DashboardCreator';
import Campaigns from './pages/Campaigns';
import ForCreators from './pages/ForCreators';
import Learn from './pages/Learn';
import CampaignDetails from './pages/CampaignDetails';
import WhatsAppPopup from './components/WhatsAppPopup';
import WhatsAppFloating from './components/WhatsAppFloating';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import PaymentMethods from './pages/PaymentMethods';
import Notifications from './pages/Notifications';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute = ({ children, allowedRole }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!userStr || !token) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  const userRole = user.role || 'creator'; // Default to creator for older test accounts

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }

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
