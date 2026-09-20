import React from 'react';
import { X, BookOpen, Layers, ShieldCheck, Database, Server, User, Key, Check } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-neutral-900" />
            <div>
              <h3 className="font-bold text-neutral-900 text-base">System Documentation & Architecture</h3>
              <p className="text-xs text-neutral-500">Enterprise Photography Platform Specifications & Security Matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-700 leading-relaxed">
          {/* Platform Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-400 block mb-0.5 font-medium">Platform</span>
              <span className="font-bold text-neutral-900">PhotoShare Studio</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-400 block mb-0.5 font-medium">Environment</span>
              <span className="font-bold text-neutral-900 truncate block">Cloud Run Production</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-400 block mb-0.5 font-medium">Security Matrix</span>
              <span className="font-bold text-emerald-600">RBAC Enforced</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-400 block mb-0.5 font-medium">Technology Stack</span>
              <span className="font-bold text-neutral-900">React + Express + Sharp</span>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div>
            <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5 mb-2">
              <Layers className="w-4 h-4 text-blue-600" /> 3. System Architecture & Flow
            </h4>
            <div className="p-4 bg-neutral-900 text-neutral-200 font-mono text-[11px] rounded-xl overflow-x-auto">
              <pre>{`[Admin / Lead]      --> Create Event -> Assign Team -> Curate Photos -> Publish Gallery + PIN
[Team Photographers] --> Upload Multiple Photos -> View Assigned Events -> Manage Own Uploads
[Customer / Client]  --> Access Shareable Link -> Enter 6-digit PIN -> Browse High-Res Gallery

API Flow:
Client Request (Bearer Token / x-gallery-pin)
   |
   +--> Express Router (/api/*)
           |
           +--> RBAC Security Guard (Admin vs Team Member checks)
           +--> Multer Object Storage (/uploads) [Limits: 25MB, Mime: JPEG/PNG/WEBP]
           +--> JSON Database (/data/db.json) [Users, Events, Photos, Galleries]
           +--> Customer PIN Auth & Isolation Guard (Zero unselected photo leakage)`}</pre>
            </div>
          </div>

          {/* Database Schema */}
          <div>
            <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5 mb-2">
              <Database className="w-4 h-4 text-emerald-600" /> 4. Photo Metadata Schema (Section 4 Conformance)
            </h4>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 font-mono text-[11px]">
              <p><span className="text-blue-600 font-bold">Photo ID:</span> String unique identifier (e.g. 'p-01')</p>
              <p><span className="text-blue-600 font-bold">Event ID:</span> Foreign key referencing the parent event</p>
              <p><span className="text-blue-600 font-bold">Uploaded By:</span> Object with User ID, User Name, and Role</p>
              <p><span className="text-blue-600 font-bold">Filename:</span> Physical storage filename (e.g. 'photo-1725700.jpg')</p>
              <p><span className="text-blue-600 font-bold">Storage Location:</span> Object storage path/URL (e.g. '/uploads/photo-*.jpg')</p>
              <p><span className="text-blue-600 font-bold">File Size:</span> Size in bytes</p>
              <p><span className="text-blue-600 font-bold">Created At:</span> ISO 8601 creation timestamp</p>
            </div>
          </div>

          {/* Demo Credentials Summary */}
          <div>
            <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5 mb-2">
              <Key className="w-4 h-4 text-amber-600" /> 8. Demo Credentials (Section 8 Conformance)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                <p className="font-bold text-neutral-900">Admin / Lead</p>
                <p className="font-mono text-neutral-600">admin@trizen.com</p>
                <p className="font-mono text-neutral-500">Pass: admin123</p>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                <p className="font-bold text-neutral-900">Team Member (Lead)</p>
                <p className="font-mono text-neutral-600">rahul@trizen.com</p>
                <p className="font-mono text-neutral-500">Pass: team123</p>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                <p className="font-bold text-neutral-900">Customer Demo PIN</p>
                <p className="font-mono text-neutral-600">PIN: 482917</p>
                <p className="text-[11px] text-neutral-500">Slug: abc123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 transition"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
