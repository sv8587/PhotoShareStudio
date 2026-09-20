import React from 'react';
import { Camera, Calendar, MapPin, UploadCloud, ArrowRight, Shield, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { EventItem, User } from '../types';

interface TeamDashboardProps {
  events: EventItem[];
  currentUser: User;
  onSelectEvent: (eventId: string) => void;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({
  events,
  currentUser,
  onSelectEvent,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Team Member Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Photographer Workspace
            </span>
            <span className="text-xs text-neutral-400">• Team Member Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Assigned Event Assignments
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
            Welcome back, <strong className="text-neutral-800">{currentUser.name}</strong>. Select your assigned event to upload high-resolution shoot photographs.
          </p>
        </div>

        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-600 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800">Role: Field Photographer</p>
            <p className="text-[11px] text-neutral-500">Curating & Publishing managed by Admin</p>
          </div>
        </div>
      </div>

      {/* Role Boundary Notice (Section 2.2 Requirement) */}
      <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl flex items-start gap-3 text-xs text-sky-900">
        <Shield className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Role-Based Scope & Permissions (Section 2.2)</p>
          <p className="text-sky-800 mt-0.5 leading-relaxed">
            As a Team Member, you can upload multiple event photographs and view photos for your assigned events. Publishing client galleries and modifying other photographers' uploads are strictly reserved for Administrative Leads.
          </p>
        </div>
      </div>

      {/* Assigned Events Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Your Assigned Events ({events.length})</h2>
            <p className="text-xs text-neutral-500">Events you have been granted photo upload authorization for</p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
            <Camera className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="font-bold text-neutral-900 text-base">No Assigned Events</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              You are currently not assigned to any active events. Please contact Lead Admin Aarav Sharma to be assigned.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event.id)}
                className="group bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 overflow-hidden bg-neutral-900">
                    <img
                      src={event.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-600 text-white shadow-md flex items-center gap-1">
                        <span>Assigned To You</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-bold text-base tracking-tight truncate">{event.name}</h3>
                      <p className="text-xs text-neutral-300 truncate">Client: {event.clientName}</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 text-xs">
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

                    <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
                      <span className="text-neutral-600 font-medium">Uploaded Event Photos</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {event.totalPhotos ?? 0} photos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Ready</span>
                  </span>

                  <span className="font-bold text-xs text-neutral-900 group-hover:text-sky-600 transition flex items-center gap-1">
                    <span>Open Upload Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
