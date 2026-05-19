// Halaman login dengan background gradient animasi
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password);
      const role = user?.role ?? 'employee';
      navigate(role === 'admin' ? '/dashboard' : '/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    }
  };

  return (
    <div className="relative min-h-screen login-animated-bg flex items-center justify-center p-4 overflow-hidden">
      {/* Orbs untuk depth */}
      <div
        className="login-orb pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl"
        aria-hidden
      />
      <div
        className="login-orb login-orb-delay pointer-events-none absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl"
        aria-hidden
      />
      <div
        className="login-orb login-orb-delay-2 pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white font-bold text-xl shadow-lg mb-4">
              H
            </div>
            <h1 className="text-3xl font-bold text-slate-800">HRM WFH System</h1>
            <p className="text-slate-500 text-sm mt-1">Employee Attendance & Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition"
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-6 text-xs leading-relaxed">
            Demo: emp@example.com / admin@example.com
            <br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
