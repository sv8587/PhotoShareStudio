import React, { useState } from 'react';
import { X, Globe, KeyRound, Copy, Check, RefreshCw, ExternalLink, Calendar, Download, Sparkles } from 'lucide-react';
import { EventItem, User } from '../types';

interface GalleryPublishModalProps {
  event: EventItem;
  currentUser: User;
  onClose: () => void;
  onGalleryUpdated: (updatedEvent: EventItem) => void;
}

export const GalleryPublishModal: React.FC<GalleryPublishModalProps> = ({
  event,
  currentUser,
  onClose,
  onGalleryUpdated,
}) => {
  const [slug, setSlug] = useState(event.gallery.slug || 'gallery-access');
  const [pin, setPin] = useState(event.gallery.pin || '482917');
  const [allowDownloads, setAllowDownloads] = useState(event.gallery.allowDownloads ?? true);
  const [expiresAt, setExpiresAt] = useState(event.gallery.expiresAt ? event.gallery.expiresAt.split('T')[0] : '');
  const [welcomeMessage, setWelcomeMessage] = useState(event.gallery.welcomeMessage || `Welcome to ${event.name}!`);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const baseUrl = window.location.origin;
  const galleryUrl = `${baseUrl}#gallery=${slug}`;

  const generateRandomPin = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(randomPin);
  };

  const handlePublish = async (publishState: boolean) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/events/${event.id}/gallery/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          slug: slug.trim(),
          pin: pin.trim(),
          allowDownloads,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          welcomeMessage: welcomeMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update gallery publishing status.');
      }

      const updated: EventItem = {
        ...event,
        gallery: data.gallery,
      };

      onGalleryUpdated(updated);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Are you sure you want to unpublish this gallery? Guests with the link will no longer be able to access it.')) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/events/${event.id}/gallery/unpublish`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${currentUser.id}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unpublish gallery.');

      onGalleryUpdated({
        ...event,
        gallery: data.gallery,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const copyCredentialsCard = () => {
    const text = `Generated Gallery Credentials:
Event Name: ${event.name}
Gallery URL: ${galleryUrl}
Access PIN: ${pin}`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  const copyUrlOnly = () => {
    navigator.clipboard.writeText(galleryUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-neutral-800" />
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Client Gallery Publishing & Security</h3>
              <p className="text-xs text-neutral-500">{event.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Chip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  event.gallery.isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-xs font-bold text-neutral-800">
                {event.gallery.isPublished ? 'Live & Published to Customers' : 'Currently in Draft Mode (Unpublished)'}
              </span>
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              {event.selectedPhotos ?? 0} photos selected
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3 text-xs">
            {/* Gallery URL Slug */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Custom Gallery URL Slug
              </label>
              <div className="flex items-center">
                <span className="bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-xl px-3 py-2 text-neutral-500 font-mono text-[11px]">
                  /gallery/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  placeholder="e.g. abc123 or arjun-priya"
                  className="w-full border border-neutral-300 rounded-r-xl px-3 py-2 text-xs font-mono text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            {/* Access PIN Configuration (Section 2.1 & 5) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-neutral-700 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                  Gallery Access PIN (4-8 Digits)
                </label>
                <button
                  type="button"
                  onClick={generateRandomPin}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Generate PIN
                </button>
              </div>
              <input
                id="gallery-pin-input"
                type="text"
                maxLength={8}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 482917"
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-base tracking-widest font-mono font-bold text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Clients must enter this PIN to unlock and view the photographs.
              </p>
            </div>

            {/* Gallery Expiration & Downloads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition">
                  <input
                    type="checkbox"
                    checked={allowDownloads}
                    onChange={e => setAllowDownloads(e.target.checked)}
                    className="rounded-sm text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="text-xs font-medium text-neutral-800">Allow Photo Downloads</span>
                </label>
              </div>
            </div>

            {/* Welcome Message */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Customer Welcome Greeting
              </label>
              <input
                type="text"
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                placeholder="Welcome to our gallery!"
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Operational Credentials Preview Card (Matching Section 3 & 5 format) */}
          <div className="p-3.5 bg-neutral-900 text-neutral-100 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] font-sans pb-1 border-b border-neutral-800">
              <span className="flex items-center gap-1 font-semibold text-neutral-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Generated Gallery Credentials
              </span>
              <button
                type="button"
                onClick={copyCredentialsCard}
                className="hover:text-white transition flex items-center gap-1"
              >
                {copiedCreds ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCreds ? 'Copied!' : 'Copy All'}</span>
              </button>
            </div>
            <div>
              <span className="text-neutral-400">Event Name:</span> {event.name}
            </div>
            <div className="flex items-center justify-between">
              <div className="truncate pr-2">
                <span className="text-neutral-400">Gallery URL:</span>{' '}
                <span className="text-emerald-300 underline cursor-pointer" onClick={copyUrlOnly}>
                  {galleryUrl}
                </span>
              </div>
              <button onClick={copyUrlOnly} className="text-neutral-400 hover:text-white shrink-0">
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div>
              <span className="text-neutral-400">Access PIN:</span>{' '}
              <span className="text-amber-300 font-bold tracking-wider">{pin}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          {event.gallery.isPublished ? (
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={isSaving}
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
            >
              Unpublish Gallery
            </button>
          ) : (
            <span className="text-xs text-neutral-400">Ready to publish</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
            >
              Cancel
            </button>
            <button
              id="confirm-publish-gallery-btn"
              type="button"
              onClick={() => handlePublish(true)}
              disabled={isSaving}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4" />
              <span>{event.gallery.isPublished ? 'Update Published Gallery' : 'Publish Gallery to Customers'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
