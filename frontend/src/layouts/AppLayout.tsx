// Layout dengan header glass — hanya halaman setelah login
import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';

const AppLayout = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
    </div>
    <Navigation />
    <main className="relative min-h-[calc(100vh-4rem)]">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
