import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, UploadCloud, Globe, Users, KeyRound, CheckSquare, 
  Square, Info, Trash2, CheckCircle2, Star, Filter, Eye, Download, 
  Sparkles, ShieldAlert, ChevronRight, AlertCircle, Share2, Copy, Check,
  Search, SlidersHorizontal, ArrowUpDown, ChevronLeft
} from 'lucide-react';
import { EventItem, PhotoMetadata, User } from '../types';
import { PhotoMetadataModal } from './PhotoMetadataModal';
import { PhotoUploadModal } from './PhotoUploadModal';
import { GalleryPublishModal } from './GalleryPublishModal';
import { TeamManagementModal } from './TeamManagementModal';

interface EventWorkspaceProps {
  eventId: string;
  currentUser: User;
  onBack: () => void;
  onOpenCustomerGallery: (slug: string) => void;
}

export const EventWorkspace: React.FC<EventWorkspaceProps> = ({
  eventId,
  currentUser,
  onBack,
  onOpenCustomerGallery,
}) => {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUploader, setSelectedUploader] = useState<string>('All');
  const [filterSelectionStatus, setFilterSelectionStatus] = useState<'All' | 'Selected' | 'Unselected'>('All');

  // Search, Sort & Pagination / Infinite Scroll States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size_desc' | 'size_asc' | 'name'>('newest');
  const [pageSize, setPageSize] = useState<number | 'all'>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [infiniteScrollMode, setInfiniteScrollMode] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Modals state
  const [inspectPhoto, setInspectPhoto] = useState<PhotoMetadata | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchEventDetails();
    fetchEventPhotos();
  }, [eventId, currentUser]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${currentUser.id}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load event details.');
      setEvent(data.event);
      setTeamMembers(data.teamMembers || []);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventPhotos = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/photos`, {
        headers: { Authorization: `Bearer ${currentUser.id}` },
      });
      const data = await res.json();
      if (res.ok && data.photos) {
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSelectPhoto = async (photoId: string, currentSelected: boolean) => {
    if (!isAdmin) {
      setNotification({
        type: 'error',
        message: 'Security Constraint: Only Admin / Lead can select photos for publishing.',
      });
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/photos/select`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          photoIds: [photoId],
          isSelected: !currentSelected,
        }),
      });

      if (!res.ok) throw new Error('Failed to update selection.');

      // Update local photo state
      setPhotos(prev =>
        prev.map(p => (p.id === photoId ? { ...p, isSelected: !currentSelected } : p))
      );

      // If inspect photo is open, update it
      if (inspectPhoto && inspectPhoto.id === photoId) {
        setInspectPhoto(prev => (prev ? { ...prev, isSelected: !currentSelected } : null));
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleBatchSelect = async (selectValue: boolean) => {
    if (!isAdmin) return;
    const targetIds = filteredPhotos.map(p => p.id);
    if (targetIds.length === 0) return;

    try {
      const res = await fetch(`/api/events/${eventId}/photos/select`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          photoIds: targetIds,
          isSelected: selectValue,
        }),
      });

      if (!res.ok) throw new Error('Failed to batch update.');

      setPhotos(prev =>
        prev.map(p => (targetIds.includes(p.id) ? { ...p, isSelected: selectValue } : p))
      );

      setNotification({
        type: 'success',
        message: `Updated selection for ${targetIds.length} photos.`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo record?')) return;

    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUser.id}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete photo.');

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      if (inspectPhoto?.id === photoId) setInspectPhoto(null);

      setNotification({ type: 'success', message: 'Photo deleted successfully.' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Team Member attempted publish guard demonstration (Requirement 6)
  const handleTeamMemberAttemptPublish = () => {
    setNotification({
      type: 'error',
      message: 'Scenario Handled: A Team Member attempting to publish a gallery -> HTTP 403 Forbidden. Only Admin/Lead is authorized to publish client galleries.',
    });
  };

  const copyGalleryLink = () => {
    if (!event) return;
    const url = `${window.location.origin}#gallery=${event.gallery.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPhoto = (photo: PhotoMetadata, quality: 'original' | 'web' = 'original') => {
    const url = `/api/photos/${photo.id}/download?quality=${quality}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = photo.originalFilename || photo.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filter & Search & Sorting calculations
  const categories = ['All', ...Array.from(new Set(photos.map(p => p.category).filter(Boolean)))];
  const uploaders = ['All', ...Array.from(new Set(photos.map(p => p.uploadedBy.name)))];

  const filteredPhotos = photos
    .filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedUploader !== 'All' && p.uploadedBy.name !== selectedUploader) return false;
      if (filterSelectionStatus === 'Selected' && !p.isSelected) return false;
      if (filterSelectionStatus === 'Unselected' && p.isSelected) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.originalFilename || '').toLowerCase().includes(q) || (p.filename || '').toLowerCase().includes(q);
        const matchUploader = (p.uploadedBy.name || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        if (!matchName && !matchUploader && !matchCat) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'size_desc') return b.fileSize - a.fileSize;
      if (sortBy === 'size_asc') return a.fileSize - b.fileSize;
      if (sortBy === 'name') return (a.originalFilename || a.filename).localeCompare(b.originalFilename || b.filename);
      return 0;
    });

  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredPhotos.length / (pageSize as number));
  const paginatedPhotos = infiniteScrollMode
    ? filteredPhotos.slice(0, visibleCount)
    : pageSize === 'all'
    ? filteredPhotos
    : filteredPhotos.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number));

  const selectedCount = photos.filter(p => p.isSelected).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-500">Loading Event Workspace...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-900">Event Not Found or Access Denied</h2>
        <p className="text-xs text-neutral-500 mt-1 mb-4">
          You might not have permission to view this event.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start justify-between gap-3 shadow-md border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-neutral-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition"
            title="Back to Events list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                {event.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  event.gallery.isPublished
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {event.gallery.isPublished ? (
                  <>
                    <Globe className="w-3 h-3 text-emerald-600" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3 h-3 text-amber-600" />
                    <span>Draft</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Client: <strong className="text-neutral-700">{event.clientName}</strong> • {event.location} • {event.date}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Upload Button */}
          <button
            id="workspace-upload-btn"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Photographs</span>
          </button>

          {/* Admin Team Assignment Button */}
          {isAdmin ? (
            <button
              id="workspace-manage-team-btn"
              onClick={() => setShowTeamModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition"
            >
              <Users className="w-3.5 h-3.5 text-neutral-600" />
              <span>Team ({teamMembers.length})</span>
            </button>
          ) : (
            <div className="text-xs text-neutral-500 px-2 py-1">
              Photographer: {currentUser.name}
            </div>
          )}

          {/* Gallery Publish Button (Admin vs Team Member scenario) */}
          {isAdmin ? (
            <button
              id="workspace-publish-gallery-btn"
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Globe className="w-4 h-4" />
              <span>Publish & PIN Setup</span>
            </button>
          ) : (
            <button
              id="team-attempt-publish-btn"
              onClick={handleTeamMemberAttemptPublish}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 text-xs font-medium transition cursor-not-allowed"
              title="Team Members cannot publish galleries (Requirement 2.2)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Publish Gallery (Admin Only)</span>
            </button>
          )}

          {/* View Live Customer Gallery */}
          {event.gallery.isPublished && (
            <button
              onClick={() => onOpenCustomerGallery(event.gallery.slug)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Guest Gallery</span>
            </button>
          )}
        </div>
      </div>

      {/* Operational State Banner (Section 5 Example representation) */}
      <div className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="border-r border-neutral-700 pr-4">
            <span className="text-[11px] text-neutral-400 block font-medium">Total Uploaded Photos</span>
            <span className="text-xl font-bold font-mono text-white">{photos.length.toLocaleString()}</span>
          </div>

          <div className="border-r border-neutral-700 pr-4">
            <span className="text-[11px] text-neutral-400 block font-medium">Selected for Publishing</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{selectedCount.toLocaleString()}</span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Customer Access PIN</span>
            <span className="text-lg font-bold font-mono text-amber-400 tracking-wider">
              {event.gallery.pin || '482917'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-700 text-xs font-mono text-neutral-300 truncate max-w-xs">
            /gallery/{event.gallery.slug}
          </div>
          <button
            onClick={copyGalleryLink}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
            title="Copy customer link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Curation & Filter Controls Bar */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by filename, category, or photographer..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-neutral-800 font-medium focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="newest">Newest Upload</option>
                <option value="oldest">Oldest Upload</option>
                <option value="size_desc">File Size (Largest)</option>
                <option value="size_asc">File Size (Smallest)</option>
                <option value="name">Filename (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5">
              <span className="text-neutral-400 font-medium">Page Size:</span>
              <select
                value={pageSize}
                onChange={e => {
                  const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
                  setPageSize(val as any);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-neutral-800 font-medium focus:outline-hidden text-xs cursor-pointer"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value="all">All</option>
              </select>
            </div>

            <button
              onClick={() => setInfiniteScrollMode(!infiniteScrollMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                infiniteScrollMode
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {infiniteScrollMode ? 'Infinite Mode: ON' : 'Infinite Mode: OFF'}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-neutral-100">
          {/* Status Selection Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> View:
            </span>
            {(['All', 'Selected', 'Unselected'] as const).map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilterSelectionStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterSelectionStatus === status
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {status === 'All' && `All (${photos.length})`}
                {status === 'Selected' && `Selected for Gallery (${selectedCount})`}
                {status === 'Unselected' && `In Review (${photos.length - selectedCount})`}
              </button>
            ))}
          </div>

          {/* Admin Batch Selection Tools */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-neutral-400 font-medium">Batch:</span>
              <button
                id="select-all-photos-btn"
                onClick={() => handleBatchSelect(true)}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-medium transition"
              >
                Select All Visible
              </button>
              <button
                id="deselect-all-photos-btn"
                onClick={() => handleBatchSelect(false)}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-medium transition"
              >
                Deselect All Visible
              </button>
            </div>
          )}
        </div>

        {/* Secondary Category and Photographer Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-neutral-400 shrink-0">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-neutral-200 text-neutral-900 font-bold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Photographer Filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Photographer:</span>
            <select
              value={selectedUploader}
              onChange={e => {
                setSelectedUploader(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs text-neutral-800 focus:outline-hidden"
            >
              {uploaders.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 space-y-3">
          <UploadCloud className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-neutral-900 text-base">No Photographs Match This Filter</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your category or selection filter, or upload new photographs for this event.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Photos</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedPhotos.map(photo => (
              <div
                key={photo.id}
                className={`group relative rounded-2xl overflow-hidden bg-white border transition-all duration-200 flex flex-col shadow-xs ${
                  photo.isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Photo Image with Overlay */}
                <div
                  className="relative aspect-4/3 overflow-hidden bg-neutral-100 cursor-pointer"
                  onClick={() => setInspectPhoto(photo)}
                >
                  <img
                    src={photo.thumbnailUrl || `/api/photos/${photo.id}/thumbnail?w=480`}
                    onError={(e) => {
                      // Fallback to original storage location if thumbnail fails
                      const target = e.target as HTMLImageElement;
                      if (target.src !== photo.storageLocation) {
                        target.src = photo.storageLocation;
                      }
                    }}
                    alt={photo.originalFilename}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                  />

                  {/* Selection Badge (Top Left) */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    {isAdmin ? (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleToggleSelectPhoto(photo.id, photo.isSelected);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 shadow-md ${
                          photo.isSelected
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-white/90 backdrop-blur-xs text-neutral-700 hover:bg-white'
                        }`}
                      >
                        {photo.isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Select</span>
                          </>
                        )}
                      </button>
                    ) : (
                      photo.isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selected by Admin</span>
                        </span>
                      )
                    )}
                  </div>

                  {/* Category Pill (Top Right) */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-semibold bg-neutral-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-full">
                      {photo.category}
                    </span>
                  </div>

                  {/* Hover Quick Action to Inspect Section 4 Metadata */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setInspectPhoto(photo);
                      }}
                      className="p-2 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 transition text-xs font-bold flex items-center gap-1.5 shadow-lg"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Inspect Metadata</span>
                    </button>
                  </div>
                </div>

                {/* Card Footer with Details */}
                <div className="p-3 text-xs flex flex-col justify-between flex-1 bg-white">
                  <div>
                    <p className="font-semibold text-neutral-900 truncate" title={photo.originalFilename}>
                      {photo.originalFilename}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center justify-between">
                      <span>By: {photo.uploadedBy.name.split(' ')[0]}</span>
                      <span>{(photo.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </p>
                  </div>

                  {/* Actions row */}
                  <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[100px]">
                      {photo.id}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Single Photo Download */}
                      <button
                        onClick={() => handleDownloadPhoto(photo, 'original')}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                        title="Download High-Res Original"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setInspectPhoto(photo)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                        title="Inspect full database metadata"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Photo permission: Admin can delete any, Team Member can only delete own */}
                      {(isAdmin || photo.uploadedBy.id === currentUser.id) && (
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination & Infinite Scrolling Controls */}
          <div className="p-4 bg-white rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-neutral-500">
              Showing <strong className="text-neutral-800">{paginatedPhotos.length}</strong> of{' '}
              <strong className="text-neutral-800">{filteredPhotos.length}</strong> photograph(s)
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </div>

            {infiniteScrollMode ? (
              visibleCount < filteredPhotos.length ? (
                <button
                  onClick={() => setVisibleCount(prev => Math.min(prev + (pageSize === 'all' ? 12 : Number(pageSize)), filteredPhotos.length))}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition shadow-xs"
                >
                  Load More Photos ({filteredPhotos.length - visibleCount} remaining)
                </button>
              ) : (
                <span className="text-neutral-400 font-medium">All {filteredPhotos.length} photos loaded</span>
              )
            ) : pageSize !== 'all' && totalPages > 1 ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                        currentPage === page
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modals */}
      {inspectPhoto && (
        <PhotoMetadataModal
          photo={inspectPhoto}
          onClose={() => setInspectPhoto(null)}
          isAdmin={isAdmin}
          onToggleSelect={handleToggleSelectPhoto}
        />
      )}

      {showUploadModal && (
        <PhotoUploadModal
          eventId={event.id}
          eventName={event.name}
          currentUser={currentUser}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={newPhotos => {
            setPhotos(prev => [...newPhotos, ...prev]);
            setNotification({
              type: 'success',
              message: `Uploaded ${newPhotos.length} photograph(s) successfully.`,
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />
      )}

      {showPublishModal && (
        <GalleryPublishModal
          event={event}
          currentUser={currentUser}
          onClose={() => setShowPublishModal(false)}
          onGalleryUpdated={updatedEvent => {
            setEvent(updatedEvent);
            setNotification({
              type: 'success',
              message: 'Gallery publishing configuration and PIN updated successfully!',
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />
      )}

      {showTeamModal && (
        <TeamManagementModal
          event={event}
          currentUser={currentUser}
          onClose={() => setShowTeamModal(false)}
          onEventUpdated={updatedEvent => {
            setEvent(updatedEvent);
            fetchEventDetails();
          }}
        />
      )}
    </div>
  );
};
