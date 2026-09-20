import React from 'react';
import { Camera, ShieldCheck, UserCheck, KeyRound, LogOut, ChevronDown, CheckCircle2, LogIn } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onSwitchUser: (userEmail: string) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenCustomerGallery: () => void;
  currentView: 'admin' | 'team' | 'workspace' | 'customer';
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onLogout,
  onOpenLogin,
  onOpenCustomerGallery,
  currentView,
  onNavigateHome,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-neutral-900 tracking-tight">PhotoShare Studio</span>
              <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200 uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden sm:block">Collaborative Event Photography & Client Delivery</p>
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition border ${
              currentView === 'customer'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-200'
            }`}
            title="Open customer PIN-protected gallery preview"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Customer Gallery</span>
            <span className="md:hidden">Gallery</span>
          </button>

          {/* Auth State: Logged In vs Logged Out */}
          {currentUser ? (
            <>
              {/* User Profile / Switcher Dropdown */}
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
                          Switch Studio Account
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
                            <p className="text-[11px] text-neutral-500">Admin Lead (admin@trizen.com)</p>
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

                      {/* Logout Action in dropdown */}
                      <div className="pt-1.5 mt-1 border-t border-neutral-100 px-2">
                        <button
                          id="dropdown-logout-btn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out of Workspace</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Direct Quick Logout Button on Navbar */}
              <button
                id="navbar-direct-logout-btn"
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 border border-neutral-200 transition"
                title="Log out of current studio account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            </>
          ) : (
            <button
              id="navbar-login-btn"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
