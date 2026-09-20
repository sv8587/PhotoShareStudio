import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { TeamDashboard } from './components/TeamDashboard';
import { EventWorkspace } from './components/EventWorkspace';
import { CustomerGallery } from './components/CustomerGallery';
import { CreateEventModal } from './components/CreateEventModal';
import { DocumentationModal } from './components/DocumentationModal';
import { LoginView } from './components/LoginView';
import { User, EventItem } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [currentView, setCurrentView] = useState<'admin' | 'team' | 'workspace' | 'customer'>('admin');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [customerGallerySlug, setCustomerGallerySlug] = useState<string>('abc123');

  // Modals & UI States
  const [showCreateEvent, setShowCreateEvent] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Initialize and check URL hash
  useEffect(() => {
    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, []);

  const checkHashRoute = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#gallery=')) {
      const slug = hash.replace('#gallery=', '');
      setCustomerGallerySlug(slug || 'abc123');
      setCurrentView('customer');
    }
  };

  // Restore authenticated session on mount from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem('photoshare_auth_token');
        if (savedToken) {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setCurrentUser(data.user);
              if (window.location.hash.startsWith('#gallery=')) {
                setCurrentView('customer');
              } else {
                setCurrentView(data.user.role === 'admin' ? 'admin' : 'team');
              }
              await fetchEvents(data.user.id);
              setLoadingInitial(false);
              return;
            }
          }
          localStorage.removeItem('photoshare_auth_token');
        }
      } catch (err) {
        console.error('Session restoration error:', err);
        localStorage.removeItem('photoshare_auth_token');
      } finally {
        setLoadingInitial(false);
      }
    };

    restoreSession();
  }, []);

  const loginUser = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('photoshare_auth_token', data.token);
        setCurrentUser(data.user);

        // Update view if not explicitly in guest customer gallery
        if (currentView !== 'customer') {
          if (data.user.role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('team');
          }
          setSelectedEventId(null);
        }
        await fetchEvents(data.user.id);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to log in user:', err);
      return false;
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout API notification skipped:', err);
    } finally {
      localStorage.removeItem('photoshare_auth_token');
      setCurrentUser(null);
      setEvents([]);
      setSelectedEventId(null);
    }
  };

  const fetchEvents = async (userId: string) => {
    try {
      const res = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${userId}` },
      });
      const data = await res.json();
      if (res.ok && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('workspace');
  };

  const handleOpenCustomerGallery = (slug: string = 'abc123') => {
    setCustomerGallerySlug(slug);
    setCurrentView('customer');
    window.location.hash = `gallery=${slug}`;
  };

  const handleExitCustomerGallery = () => {
    window.location.hash = '';
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('team');
      }
    }
  };

  const handleNavigateHome = () => {
    setSelectedEventId(null);
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
    } else if (currentUser) {
      setCurrentView('team');
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-neutral-400">Loading PhotoShare Studio...</p>
        </div>
      </div>
    );
  }

  // If customer view is active, render full-page customer gallery
  if (currentView === 'customer') {
    return (
      <CustomerGallery
        initialSlug={customerGallerySlug}
        onExit={handleExitCustomerGallery}
      />
    );
  }

  // If user is not authenticated, render Login / Register screen
  if (!currentUser) {
    return (
      <LoginView
        onLogin={loginUser}
        onOpenGuestGallery={handleOpenCustomerGallery}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Universal Clean Navigation Bar with Role Indicator & Logout */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={email => loginUser(email)}
        onLogout={logoutUser}
        onOpenLogin={() => {}}
        onOpenCustomerGallery={() => handleOpenCustomerGallery('abc123')}
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'workspace' && selectedEventId ? (
          <EventWorkspace
            eventId={selectedEventId}
            currentUser={currentUser}
            onBack={handleNavigateHome}
            onOpenCustomerGallery={handleOpenCustomerGallery}
          />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard
            events={events}
            currentUser={currentUser}
            onSelectEvent={handleSelectEvent}
            onCreateEventClick={() => setShowCreateEvent(true)}
            onOpenCustomerGallery={handleOpenCustomerGallery}
          />
        ) : (
          <TeamDashboard
            events={events}
            currentUser={currentUser}
            onSelectEvent={handleSelectEvent}
          />
        )}
      </main>

      {/* Professional Clean Production Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800">PhotoShare Studio</span>
            <span className="text-neutral-400">•</span>
            <span>Collaborative Event Photography & Client Delivery Platform</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-500">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </span>
            <span>•</span>
            <button
              onClick={() => setShowDocsModal(true)}
              className="hover:text-neutral-900 transition underline cursor-pointer"
            >
              Architecture Specs
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {showCreateEvent && (
        <CreateEventModal
          currentUser={currentUser}
          onClose={() => setShowCreateEvent(false)}
          onEventCreated={newEvent => {
            setEvents(prev => [newEvent, ...prev]);
            handleSelectEvent(newEvent.id);
          }}
        />
      )}

      {showDocsModal && (
        <DocumentationModal onClose={() => setShowDocsModal(false)} />
      )}
    </div>
  );
}
