// Header navigasi — glassmorphism, responsif, role-based
import { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type NavItem = { to: string; label: string; end?: boolean };

const ADMIN_LINKS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/employees', label: 'Karyawan' },
  { to: '/attendance', label: 'Absensi' },
];

const EMPLOYEE_LINKS: NavItem[] = [
  { to: '/', label: 'Absensi', end: true },
  { to: '/history', label: 'Riwayat' },
];

const getInitials = (name?: string) => {
  if (!name?.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
};

const roleLabel = (role?: string) =>
  role === 'admin' ? 'Admin HRD' : 'Karyawan';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    isActive
      ? 'bg-cyan-500/15 text-cyan-800 font-semibold shadow-sm'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
  ].join(' ');

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const homePath = user?.role === 'admin' ? '/dashboard' : '/';
  const links = user?.role === 'admin' ? ADMIN_LINKS : EMPLOYEE_LINKS;

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogout = async () => {
    if (logoutPending) return;
    setLogoutPending(true);
    closeMenu();
    logout();
    navigate('/login', { replace: true });
    setLogoutPending(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50">
      <nav
        className="border-b border-slate-200/70 bg-white/75 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
        aria-label="Navigasi utama"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-violet-400/10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand */}
            <NavLink
              to={homePath}
              className="group flex items-center gap-3 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl"
              onClick={closeMenu}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                H
              </span>
              <span className="hidden sm:block">
                <span className="block text-base font-bold text-slate-900 tracking-tight">
                  HRM WFH
                </span>
                <span className="block text-[11px] text-slate-500 -mt-0.5">
                  Attendance System
                </span>
              </span>
            </NavLink>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* User + actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-xs font-bold text-white ring-2 ring-white shadow-sm"
                  aria-hidden
                >
                  {getInitials(user?.name)}
                </div>
                <div className="max-w-[140px]">
                  <p className="text-sm font-medium text-slate-800 truncate" title={user?.name}>
                    {user?.name ?? 'Pengguna'}
                  </p>
                  <span className="inline-flex mt-0.5 items-center rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-700 border border-cyan-200">
                    {roleLabel(user?.role)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutPending}
                className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80"
                aria-label="Keluar dari akun"
              >
                <LogoutIcon />
                {logoutPending ? 'Keluar...' : 'Keluar'}
              </button>

              {/* Mobile menu toggle */}
              <button
                type="button"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/60 text-slate-700 hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          id="mobile-nav"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out border-t border-slate-200/80 ${
            menuOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!menuOpen}
        >
          <div className="relative px-4 pb-5 pt-3 space-y-4 bg-white/95 backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-bold text-white ring-2 ring-white shadow-sm"
                aria-hidden
              >
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800 truncate">{user?.name}</p>
                <span className="text-xs text-cyan-700">{roleLabel(user?.role)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'rounded-xl px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    ].join(' ')
                  }
                  onClick={closeMenu}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
            >
              <LogoutIcon />
              {logoutPending ? 'Keluar...' : 'Keluar dari akun'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
    </svg>
  );
}

export default Navigation;
