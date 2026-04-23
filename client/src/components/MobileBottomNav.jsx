import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Search, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MobileBottomNav() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const NAV_ITEMS = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Campaigns', path: '/campaigns', icon: Search },
    { name: 'Dashboard', path: '/creator-dashboard', icon: LayoutDashboard },
    { name: user ? 'Account' : 'Login', path: user ? '/profile' : '/login', icon: User }
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-2 py-2 flex justify-between items-center pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/creator-dashboard' && location.pathname.includes('/creator-dashboard'));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-full transition-all duration-300 relative ${
                isActive ? 'text-white bg-primary scale-105 shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-white' : ''}`} />
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
