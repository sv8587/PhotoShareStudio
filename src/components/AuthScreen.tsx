import React, { useState } from 'react';
import { 
  Camera, ShieldCheck, UserCheck, KeyRound, ArrowRight, Lock, Mail, 
  User, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, LogIn
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { loginWithCredentials, registerNewUser, getStoredUsers } from '../services/authService';

interface AuthScreenProps {
  onSuccess: (user: UserType) => void;
  onOpenCustomerGallery: (slug: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onOpenCustomerGallery,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'guest'>('signin');
  
  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('team_member');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  // Guest Gallery State
  const [guestSlug, setGuestSlug] = useState('abc123');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    const result = await loginWithCredentials(loginEmail, loginPassword || undefined);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onSuccess(result.user);
    } else {
      setLoginError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = async (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setIsSubmitting(true);
    setLoginError(null);

    const result = await loginWithCredentials(email, pass);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onSuccess(result.user);
    } else {
      setLoginError(result.error || 'Login failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please provide your full name and email address.');
      return;
    }
    if (regPassword && regPassword.length < 4) {
      setRegError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    setRegError(null);

    const result = await registerNewUser(regName, regEmail, regRole, regPassword);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onSuccess(result.user);
    } else {
      setRegError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleGuestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = guestSlug.trim() || 'abc123';
    onOpenCustomerGallery(slug);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon & Heading */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
            <Camera className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Trizen PhotoShare
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
          Role-based event photography management, collaborative team uploads & private customer delivery.
        </p>

        {/* Tab Selector */}
        <div className="mt-6 flex bg-neutral-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setLoginError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'signin'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setRegError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'register'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'guest'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Client Gallery
          </button>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-3xl sm:px-10 border border-neutral-200">
          
          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <div className="space-y-6">
              {loginError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>{loginError}</div>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="admin@trizen.com"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-neutral-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-10 py-2 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-neutral-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {isSubmitting ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              {/* Quick Persona Test Buttons */}
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Instant Demo Accounts
                  </span>
                  <span className="text-[10px] text-neutral-400">Click to switch</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@trizen.com', 'admin123')}
                    className="w-full text-left p-2.5 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/50 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        👑
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 group-hover:text-black">
                          Aarav Sharma <span className="text-[10px] font-normal text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">Admin Lead</span>
                        </p>
                        <p className="text-[11px] text-neutral-500">admin@trizen.com • Pass: admin123</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rahul@trizen.com', 'team123')}
                    className="w-full text-left p-2.5 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/50 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                        📸
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 group-hover:text-black">
                          Rahul Verma <span className="text-[10px] font-normal text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">Lead Photographer</span>
                        </p>
                        <p className="text-[11px] text-neutral-500">rahul@trizen.com • Pass: team123</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ananya@trizen.com', 'team123')}
                    className="w-full text-left p-2.5 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/50 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        🌸
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 group-hover:text-black">
                          Ananya Sen <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Candid Specialist</span>
                        </p>
                        <p className="text-[11px] text-neutral-500">ananya@trizen.com • Pass: team123</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE ACCOUNT */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              {regError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>{regError}</div>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="e.g. Vikramaditya Rathore"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-neutral-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="vikram@trizen.com"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-neutral-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Account Role & Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('admin')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        regRole === 'admin'
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Admin / Lead</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${regRole === 'admin' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Create events, curate photos, publish galleries.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('team_member')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        regRole === 'team_member'
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                        <UserCheck className="w-4 h-4 text-sky-400" />
                        <span>Team Member</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${regRole === 'team_member' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Upload photos, view assigned events.
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Choose a password"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-neutral-50/50"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Creating Account...' : 'Register & Enter Studio'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: CLIENT / GUEST PIN ACCESS */}
          {activeTab === 'guest' && (
            <div className="space-y-4">
              <div className="text-center p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900">Customer & Guest Gallery Access</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Are you an invited client, wedding couple, or attendee? Enter your private gallery code below.
                </p>
              </div>

              <form onSubmit={handleGuestAccess} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Event Gallery Slug / Code
                  </label>
                  <input
                    type="text"
                    value={guestSlug}
                    onChange={e => setGuestSlug(e.target.value)}
                    placeholder="e.g. abc123"
                    className="block w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-neutral-50/50"
                    required
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Demo published gallery: <strong className="text-neutral-700">abc123</strong> (Access PIN: <strong className="text-neutral-700">482917</strong>)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition shadow-xs"
                >
                  <KeyRound className="w-4 h-4" />
                  Enter Customer Gallery
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
