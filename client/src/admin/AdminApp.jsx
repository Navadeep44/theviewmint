import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Megaphone, FileVideo,
  Building2, CreditCard, FileText, LogOut, Shield, Bell
} from 'lucide-react';

const AdminDashboard   = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers       = lazy(() => import('./pages/AdminUsers'));
const AdminCampaigns   = lazy(() => import('./pages/AdminCampaigns'));
const AdminSubmissions = lazy(() => import('./pages/AdminSubmissions'));
const AdminBrands      = lazy(() => import('./pages/AdminBrands'));
const AdminPayouts     = lazy(() => import('./pages/AdminPayouts'));
const AdminLogs        = lazy(() => import('./pages/AdminLogs'));

const navItems = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/users',       icon: Users,           label: 'Creators' },
  { to: '/admin/campaigns',   icon: Megaphone,       label: 'Campaigns' },
  { to: '/admin/submissions', icon: FileVideo,       label: 'Submissions' },
  { to: '/admin/brands',      icon: Building2,       label: 'Brands' },
  { to: '/admin/payouts',     icon: CreditCard,      label: 'Payouts' },
  { to: '/admin/logs',        icon: FileText,        label: 'Audit Logs' },
];

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function AdminApp() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-[#0f0f13] text-white overflow-hidden">

      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-[#161620] border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">TheViewMint</p>
              <p className="text-[10px] text-violet-400 font-medium uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              {(user.name || 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/"             element={<AdminDashboard />} />
            <Route path="/users"        element={<AdminUsers />} />
            <Route path="/campaigns"    element={<AdminCampaigns />} />
            <Route path="/submissions"  element={<AdminSubmissions />} />
            <Route path="/brands"       element={<AdminBrands />} />
            <Route path="/payouts"      element={<AdminPayouts />} />
            <Route path="/logs"         element={<AdminLogs />} />
            <Route path="*"             element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
