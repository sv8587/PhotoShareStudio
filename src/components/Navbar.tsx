import React from 'react';
import { Camera, ShieldCheck, UserCheck, KeyRound, PlayCircle, BookOpen, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onSwitchUser: (userEmail: string) => void;
  onOpenCustomerGallery: () => void;
  onOpenTests: () => void;
  onOpenDocs: () => void;
  currentView: 'admin' | 'team' | 'workspace' | 'customer' | 'auth';
  onNavigateHome: () => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onOpenCustomerGallery,
  onOpenTests,
  onOpenDocs,
  currentView,
  onNavigateHome,
  onLogout,
  onOpenAuthModal,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      {/* Top Demo Banner for Evaluators / Recruiters */}
      <div className="bg-neutral-900 text-neutral-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            TrizenAI Challenge
          </span>
          <span className="hidden sm:inline text-neutral-400">Quick Persona Switcher:</span>
          <div className="flex items-center gap-1.5">
            <button
              id="switch-admin-btn"
              onClick={() => onSwitchUser('admin@trizen.com')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                currentUser?.role === 'admin'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              👑 Admin (Aarav)
            </button>
            <button
              id="switch-team-btn"
              onClick={() => onSwitchUser('rahul@trizen.com')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                currentUser?.email === 'rahul@trizen.com'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              📸 Team (Rahul)
            </button>
            <button
              id="switch-customer-btn"
              onClick={onOpenCustomerGallery}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                currentView === 'customer'
                  ? 'bg-emerald-500 text-white font-semibold'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-950/60'
              }`}
            >
              🔑 Guest Gallery (PIN: 482917)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <button
            id="run-tests-nav-btn"
            onClick={onOpenTests}
            className="flex items-center gap-1 text-neutral-300 hover:text-emerald-300 transition"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Run System Tests</span>
          </button>
          <span className="text-neutral-700">|</span>
          <button
            id="open-docs-nav-btn"
            onClick={onOpenDocs}
            className="flex items-center gap-1 text-neutral-300 hover:text-white transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Docs & Architecture</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-neutral-900 tracking-tight">Trizen PhotoShare</span>
              <span className="text-[11px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">
                v1.0
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden sm:block">Collaborative Event Photography & Gallery Delivery</p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Active Role Indicator */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                {currentUser.role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-neutral-800">Admin Lead</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span className="font-semibold text-neutral-800">Team Member</span>
                  </>
                )}
              </div>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-600 max-w-[140px] truncate">{currentUser.name.split(' ')[0]}</span>
            </div>
          )}

          {/* Quick Customer Gallery Direct Link Button */}
          <button
            id="view-client-gallery-btn"
            onClick={onOpenCustomerGallery}
            className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-2 rounded-lg text-xs font-semibold transition border border-neutral-200"
            title="Open customer PIN-protected gallery preview"
          >
            <KeyRound className="w-3.5 h-3.5 text-neutral-700" />
            <span className="hidden md:inline">Customer Gallery</span>
            <span className="md:hidden">Gallery</span>
          </button>

          {/* User Profile / Switcher Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-toggle"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-neutral-700 hidden lg:inline">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-xs font-medium text-neutral-500">Signed in as</p>
                      <p className="text-sm font-bold text-neutral-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{currentUser.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {currentUser.role === 'admin' ? 'Administrative Lead (Full Access)' : 'Team Member (Uploads & Assigned)'}
                      </div>
                    </div>

                    <div className="px-2 py-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 px-2 py-1">
                        Switch Active User
                      </p>
                      <button
                        onClick={() => {
                          onSwitchUser('admin@trizen.com');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-neutral-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-neutral-800">Aarav Sharma</p>
                          <p className="text-[11px] text-neutral-500">Admin / Lead (admin@trizen.com)</p>
                        </div>
                        {currentUser.email === 'admin@trizen.com' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onSwitchUser('rahul@trizen.com');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-neutral-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-neutral-800">Rahul Verma</p>
                          <p className="text-[11px] text-neutral-500">Photographer (rahul@trizen.com)</p>
                        </div>
                        {currentUser.email === 'rahul@trizen.com' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onSwitchUser('ananya@trizen.com');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-neutral-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-neutral-800">Ananya Sen</p>
                          <p className="text-[11px] text-neutral-500">Candid Specialist (ananya@trizen.com)</p>
                        </div>
                        {currentUser.email === 'ananya@trizen.com' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    </div>

                    <div className="border-t border-neutral-100 px-2 py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAuthModal();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 font-medium"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Sign In Another / Register</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              id="nav-signin-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
