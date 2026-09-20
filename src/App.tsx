import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { TeamDashboard } from './components/TeamDashboard';
import { EventWorkspace } from './components/EventWorkspace';
import { CustomerGallery } from './components/CustomerGallery';
import { CreateEventModal } from './components/CreateEventModal';
import { SystemTestModal } from './components/SystemTestModal';
import { DocumentationModal } from './components/DocumentationModal';
import { User, EventItem } from './types';
import { INITIAL_USERS, INITIAL_EVENTS } from './mockData';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [currentView, setCurrentView] = useState<'admin' | 'team' | 'workspace' | 'customer'>('admin');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [customerGallerySlug, setCustomerGallerySlug] = useState<string>('abc123');

  // Modals
  const [showCreateEvent, setShowCreateEvent] = useState<boolean>(false);
  const [showTestsModal, setShowTestsModal] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);

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

  // Initial login with Demo Admin
  useEffect(() => {
    loginUser('admin@trizen.com');
  }, []);

  const loginUser = async (email: string) => {
    const fallbackUser = INITIAL_USERS.find(u => u.email === email) || INITIAL_USERS[0];
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        // Automatically set view based on role if not on customer gallery
        if (currentView !== 'customer') {
          if (data.user.role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('team');
          }
          setSelectedEventId(null);
        }
        await fetchEvents(data.user.id);
        return;
      }
    } catch (err) {
      console.warn('API login offline or static host, using client store:', err);
    }

    // Graceful offline/static fallback
    setCurrentUser(fallbackUser);
    if (currentView !== 'customer') {
      if (fallbackUser.role === 'admin') {
        setCurrentView('admin');
        setEvents(INITIAL_EVENTS);
      } else {
        setCurrentView('team');
        setEvents(INITIAL_EVENTS.filter(e => e.assignedTeamMemberIds?.includes(fallbackUser.id)));
      }
      setSelectedEventId(null);
    }
  };

  const fetchEvents = async (userId: string) => {
    try {
      const res = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${userId}` },
      });
      const data = await res.json();
      if (res.ok && data.events && data.events.length > 0) {
        setEvents(data.events);
        return;
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
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('team');
    }
  };

  const handleNavigateHome = () => {
    setSelectedEventId(null);
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('team');
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-neutral-600">Initializing Trizen PhotoShare Platform...</p>
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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Top Universal Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={email => loginUser(email)}
        onOpenCustomerGallery={() => handleOpenCustomerGallery('abc123')}
        onOpenTests={() => setShowTestsModal(true)}
        onOpenDocs={() => setShowDocsModal(true)}
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'workspace' && selectedEventId && currentUser ? (
          <EventWorkspace
            eventId={selectedEventId}
            currentUser={currentUser}
            onBack={handleNavigateHome}
            onOpenCustomerGallery={handleOpenCustomerGallery}
          />
        ) : (currentUser?.role === 'admin' || !currentUser) ? (
          <AdminDashboard
            events={events.length > 0 ? events : INITIAL_EVENTS}
            currentUser={currentUser || INITIAL_USERS[0]}
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
    </div>
  );
}
