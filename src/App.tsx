import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { TeamDashboard } from './components/TeamDashboard';
import { EventWorkspace } from './components/EventWorkspace';
import { CustomerGallery } from './components/CustomerGallery';
import { CreateEventModal } from './components/CreateEventModal';
import { SystemTestModal } from './components/SystemTestModal';
import { DocumentationModal } from './components/DocumentationModal';
import { AuthScreen } from './components/AuthScreen';
import { AuthModal } from './components/AuthModal';
import { User, EventItem } from './types';
import { INITIAL_USERS, INITIAL_EVENTS } from './mockData';
import { getActiveUser, logoutUser, loginWithCredentials } from './services/authService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getActiveUser());
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [currentView, setCurrentView] = useState<'admin' | 'team' | 'workspace' | 'customer' | 'auth'>(() => {
    const initialUser = getActiveUser();
    if (!initialUser) return 'auth';
    return initialUser.role === 'admin' ? 'admin' : 'team';
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [customerGallerySlug, setCustomerGallerySlug] = useState<string>('abc123');

  // Modals
  const [showCreateEvent, setShowCreateEvent] = useState<boolean>(false);
  const [showTestsModal, setShowTestsModal] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

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

  // Sync events for current user on mount or change
  useEffect(() => {
    if (currentUser) {
      fetchEvents(currentUser.id);
    }
  }, [currentUser?.id]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('team');
    }
    setSelectedEventId(null);
    fetchEvents(user.id);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentView('auth');
    setSelectedEventId(null);
  };

  const switchUserByEmail = async (email: string) => {
    const res = await loginWithCredentials(email);
    if (res.success && res.user) {
      handleAuthSuccess(res.user);
    } else {
      const fallbackUser = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || INITIAL_USERS[0];
      handleAuthSuccess(fallbackUser);
    }
  };

  const fetchEvents = async (userId: string) => {
    try {
      const res = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${userId}` },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load events from API, using fallback:', err);
    }

    const active = currentUser || INITIAL_USERS[0];
    if (active.role === 'admin') {
      setEvents(INITIAL_EVENTS);
    } else {
      setEvents(INITIAL_EVENTS.filter(e => e.assignedTeamMemberIds?.includes(active.id)));
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
    if (!currentUser) {
      setCurrentView('auth');
    } else if (currentUser.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('team');
    }
  };

  const handleNavigateHome = () => {
    setSelectedEventId(null);
    if (!currentUser) {
      setCurrentView('auth');
    } else if (currentUser.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('team');
    }
  };

  // If customer view is active, render full-page customer gallery
  if (currentView === 'customer') {
    return (
      <CustomerGallery
        initialSlug={customerGallerySlug}
        onExit={handleExitCustomerGallery}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Top Universal Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={switchUserByEmail}
        onOpenCustomerGallery={() => handleOpenCustomerGallery('abc123')}
        onOpenTests={() => setShowTestsModal(true)}
        onOpenDocs={() => setShowDocsModal(true)}
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onLogout={handleLogout}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {!currentUser || currentView === 'auth' ? (
          <AuthScreen
            onSuccess={handleAuthSuccess}
            onOpenCustomerGallery={handleOpenCustomerGallery}
          />
        ) : currentView === 'workspace' && selectedEventId ? (
          <EventWorkspace
            eventId={selectedEventId}
            currentUser={currentUser}
            onBack={handleNavigateHome}
            onOpenCustomerGallery={handleOpenCustomerGallery}
          />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard
            events={events.length > 0 ? events : INITIAL_EVENTS}
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

      {/* Footer */}
      <footer className="bg-white py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-neutral-800">TrizenAI Technologies</span> • Full-Stack Internship Challenge
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowTestsModal(true)} className="hover:text-neutral-900 transition">
              System Test Matrix
            </button>
            <button onClick={() => setShowDocsModal(true)} className="hover:text-neutral-900 transition">
              Architecture & DB Docs
            </button>
            <span className="text-neutral-400">Submission: talent@trizen-ai.com</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {showCreateEvent && currentUser && (
        <CreateEventModal
          currentUser={currentUser}
          onClose={() => setShowCreateEvent(false)}
          onEventCreated={newEvent => {
            setEvents(prev => [newEvent, ...prev]);
            handleSelectEvent(newEvent.id);
          }}
        />
      )}

      {showTestsModal && (
        <SystemTestModal onClose={() => setShowTestsModal(false)} />
      )}

      {showDocsModal && (
        <DocumentationModal onClose={() => setShowDocsModal(false)} />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
