import React, { useState } from 'react';
import { Camera, Lock, Mail, ShieldCheck, UserCheck, ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (email: string, password?: string) => Promise<boolean>;
  onOpenGuestGallery: (slug?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onOpenGuestGallery }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'team_member'>('team_member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const success = await onLogin(email.trim(), password);
        if (!success) {
          setError('Invalid email or credentials. Please verify your email.');
        }
      } else {
        // Register new user
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          await onLogin(email.trim(), password);
        } else {
          setError(data.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setError(null);
    setEmail(quickEmail);
    setLoading(true);
    try {
      const success = await onLogin(quickEmail, 'password123');
      if (!success) {
        setError('Failed to sign in with this demo profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col justify-between selection:bg-white selection:text-neutral-900">
      {/* Top Simple Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-neutral-900 flex items-center justify-center font-bold shadow-md">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">PhotoShare Studio</span>
            <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-700">
              Enterprise
            </span>
          </div>
        </div>

        <button
          onClick={() => onOpenGuestGallery('abc123')}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition px-3 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-800/60"
        >
          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
          <span>Client Gallery Access</span>
        </button>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-neutral-950/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Header text */}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'login' ? 'Sign In to Workspace' : 'Create Studio Account'}
            </h1>
            <p className="text-xs text-neutral-400">
              {mode === 'login'
                ? 'Manage collaborative events, curate photos, and publish client galleries.'
                : 'Join the photography team and start uploading event portfolios.'}
            </p>
          </div>

          {/* Quick Persona Selectors */}
          {mode === 'login' && (
            <div className="mb-6 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 text-center">
                Quick One-Click Sign In
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@trizen.com')}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/80 transition text-left flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition truncate">
                      Aarav Sharma
                    </p>
                    <p className="text-[10px] text-neutral-400">Admin Lead (Full Access)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('rahul@trizen.com')}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-sky-500/50 hover:bg-neutral-800/80 transition text-left flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white group-hover:text-sky-300 transition truncate">
                      Rahul Verma
                    </p>
                    <p className="text-[10px] text-neutral-400">Lead Photographer</p>
                  </div>
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-neutral-800"></div>
                <span className="shrink mx-3 text-[10px] uppercase font-semibold text-neutral-500">or with credentials</span>
                <div className="grow border-t border-neutral-800"></div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@trizen.com or rahul@trizen.com"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-300">Password</label>
                <span className="text-[10px] text-neutral-500">Default: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white transition font-mono"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Workspace Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('team_member')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                      role === 'team_member'
                        ? 'bg-neutral-800 text-white border-white'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    Team Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                      role === 'admin'
                        ? 'bg-neutral-800 text-white border-white'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    Admin Lead
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-neutral-900 hover:bg-neutral-200 disabled:opacity-50 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
            {mode === 'login' ? (
              <p>
                New team member?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-white hover:underline font-semibold"
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-white hover:underline font-semibold"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Clean Footer without challenge/recruiter text */}
      <footer className="px-6 py-4 text-center text-[11px] text-neutral-500 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} PhotoShare Studio. Enterprise Event Photography & Gallery Delivery.</span>
        <button
          onClick={() => onOpenGuestGallery('abc123')}
          className="text-neutral-400 hover:text-white transition"
        >
          Looking for a client gallery? Enter guest portal →
        </button>
      </footer>
    </div>
  );
};
