import React, { useState } from 'react';
import { X, Camera, Mail, Lock, User, ShieldCheck, UserCheck, CheckCircle2, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { loginWithCredentials, registerNewUser } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('team_member');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (mode === 'signin') {
      const res = await loginWithCredentials(email, password || undefined);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } else {
      if (!name.trim()) {
        setError('Full name is required.');
        setIsSubmitting(false);
        return;
      }
      const res = await registerNewUser(name, email, role, password || undefined);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Registration failed.');
      }
    }
  };

  const handleQuickSelect = async (quickEmail: string, pass: string) => {
    setEmail(quickEmail);
    setPassword(pass);
    setIsSubmitting(true);
    setError(null);
    const res = await loginWithCredentials(quickEmail, pass);
    setIsSubmitting(false);
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Quick login failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">
                {mode === 'signin' ? 'Sign In to PhotoShare' : 'Create New Account'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {mode === 'signin' ? 'Switch active credentials' : 'Add team member or admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Tab Switcher */}
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === 'signin'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === 'register'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Maya Iyer"
                      className="block w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 bg-neutral-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        role === 'admin'
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Lead</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('team_member')}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        role === 'team_member'
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Team Member</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@trizen.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 bg-neutral-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-9 py-2 text-xs border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 bg-neutral-50/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition shadow-xs disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              {isSubmitting ? 'Authenticating...' : mode === 'signin' ? 'Sign In' : 'Create & Sign In'}
            </button>
          </form>

          {/* Quick 1-click accounts */}
          {mode === 'signin' && (
            <div className="pt-3 border-t border-neutral-100">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Quick 1-Click Credentials
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('admin@trizen.com', 'admin123')}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:border-neutral-900 text-left text-[11px] bg-neutral-50/50 transition"
                >
                  <p className="font-semibold text-neutral-800">👑 Aarav</p>
                  <p className="text-[10px] text-neutral-400">Admin</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('rahul@trizen.com', 'team123')}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:border-neutral-900 text-left text-[11px] bg-neutral-50/50 transition"
                >
                  <p className="font-semibold text-neutral-800">📸 Rahul</p>
                  <p className="text-[10px] text-neutral-400">Team</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('ananya@trizen.com', 'team123')}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:border-neutral-900 text-left text-[11px] bg-neutral-50/50 transition"
                >
                  <p className="font-semibold text-neutral-800">🌸 Ananya</p>
                  <p className="text-[10px] text-neutral-400">Team</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
