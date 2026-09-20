import React, { useState } from 'react';
import { 
  Plus, Calendar, MapPin, Users, Globe, KeyRound, Sparkles, 
  ArrowRight, Search, Copy, Check, ExternalLink, Image as ImageIcon,
  CheckCircle2, Clock
} from 'lucide-react';
import { EventItem, User } from '../types';

interface AdminDashboardProps {
  events: EventItem[];
  currentUser: User;
  onSelectEvent: (eventId: string) => void;
  onCreateEventClick: () => void;
  onOpenCustomerGallery: (slug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  events,
  currentUser,
  onSelectEvent,
  onCreateEventClick,
  onOpenCustomerGallery,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const filteredEvents = events.filter(
    e =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPhotosAllEvents = events.reduce((acc, curr) => acc + (curr.totalPhotos || 0), 0);
  const publishedGalleriesCount = events.filter(e => e.gallery.isPublished).length;

  const copyGalleryLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}#gallery=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Admin & Lead Control
            </span>
            <span className="text-xs text-neutral-400">• Full Organizational Scope</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Event Photography Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
            Coordinate team uploads, curate approved photographs for clients, and issue PIN-protected private galleries.
          </p>
        </div>

        <button
          id="admin-create-event-btn"
          onClick={onCreateEventClick}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
            Active Projects
          </span>
          <span className="text-2xl font-bold font-mono text-neutral-900 mt-1 block">
            {events.length}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Events under management</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
            Total Photos Uploaded
          </span>
          <span className="text-2xl font-bold font-mono text-neutral-900 mt-1 block">
            {totalPhotosAllEvents.toLocaleString()}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Stored in object storage</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
            Published Galleries
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
            {publishedGalleriesCount}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">Protected with 6-digit PIN</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
            Lead Administrator
          </span>
          <span className="text-base font-bold text-neutral-900 mt-1 block truncate">
            {currentUser.name}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">{currentUser.email}</span>
        </div>
      </div>

      {/* Events List Header & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Event Projects ({filteredEvents.length})</h2>
            <p className="text-xs text-neutral-500">Select an event to curate photographs and manage publishing</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search event or client..."
              className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              className="group bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Event Cover Photo Banner */}
                <div className="relative aspect-16/9 overflow-hidden bg-neutral-900">
                  <img
                    src={event.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status Badges on Cover */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md flex items-center gap-1 ${
                        event.gallery.isPublished
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-900/80 backdrop-blur-xs text-neutral-200 border border-neutral-700'
                      }`}
                    >
                      {event.gallery.isPublished ? (
                        <>
                          <Globe className="w-3 h-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Draft</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* PIN pill if published */}
                  {event.gallery.isPublished && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                      <KeyRound className="w-3 h-3" />
                      <span>PIN: {event.gallery.pin}</span>
                    </div>
                  )}

                  {/* Bottom title info on cover */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base tracking-tight truncate">{event.name}</h3>
                    <p className="text-xs text-neutral-300 truncate">Client: {event.clientName}</p>
                  </div>
                </div>

                {/* Event Card Body */}
                <div className="p-5 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {event.date}
                    </span>
                  </div>

                  {/* Curation Stats Progress Bar */}
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-neutral-600">Curated for Gallery</span>
                      <span className="font-mono text-neutral-900">
                        {event.selectedPhotos ?? 0} / {event.totalPhotos ?? 0} photos
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            event.totalPhotos && event.totalPhotos > 0
                              ? Math.round(((event.selectedPhotos || 0) / event.totalPhotos) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Photographers assigned */}
                  <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{event.assignedTeamMemberIds.length} Photographer(s) Assigned</span>
                    </span>
                    <span className="font-mono text-neutral-400">/gallery/{event.gallery.slug}</span>
                  </div>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={e => copyGalleryLink(event.gallery.slug, e)}
                  className="text-neutral-500 hover:text-neutral-900 text-xs font-medium flex items-center gap-1 transition"
                  title="Copy gallery link"
                >
                  {copiedSlug === event.gallery.slug ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  {event.gallery.isPublished && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onOpenCustomerGallery(event.gallery.slug);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold flex items-center gap-1 transition"
                      title="Preview Customer Gallery"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Guest View</span>
                    </button>
                  )}

                  <span className="font-bold text-xs text-neutral-900 group-hover:text-blue-600 transition flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
