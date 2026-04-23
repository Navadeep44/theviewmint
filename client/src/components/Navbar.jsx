import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);

  // Update navbar state on route change
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const getDashboardLink = () => {
    return '/creator-dashboard';
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Sparkles className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl tracking-tight">TheViewMint</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/campaigns" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Campaigns</Link>
            <Link to="/learn" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">How it Works</Link>
            <Link to="/for-creators" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Creators</Link>
            <a href="mailto:admin@theviewmint.in" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Contact</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md">
                  Start Earning
                </Link>
              </>
            ) : (
              <>
                <Link to={getDashboardLink()} className="text-gray-600 hover:text-primary flex items-center gap-1 transition-colors text-sm font-medium">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={handleLogout} className="text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors text-sm font-medium">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden invisible">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
