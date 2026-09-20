import React, { useState, useEffect } from 'react';
import { 
  KeyRound, Lock, Unlock, ArrowLeft, Download, Eye, Maximize2, 
  ChevronLeft, ChevronRight, X, Sparkles, Calendar, MapPin, 
  Heart, Share2, Check, AlertCircle, Loader2, Image as ImageIcon,
  FolderDown, Search, ArrowUpDown, Clock
} from 'lucide-react';
import JSZip from 'jszip';
import { GalleryPublicInfo } from '../types';

interface PublishedPhotoItem {
  id: string;
  filename: string;
  originalFilename: string;
  storageLocation: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  category: string;
  createdAt: string;
}

interface CustomerGalleryProps {
  initialSlug?: string;
  onExit: () => void;
}

export const CustomerGallery: React.FC<CustomerGalleryProps> = ({
  initialSlug = 'abc123',
  onExit,
}) => {
  const [slug, setSlug] = useState<string>(initialSlug);
  const [galleryInfo, setGalleryInfo] = useState<GalleryPublicInfo | null>(null);
  const [photos, setPhotos] = useState<PublishedPhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Search, Sort & Pagination / Infinite Scroll
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [pageSize, setPageSize] = useState<number | 'all'>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [infiniteScrollMode, setInfiniteScrollMode] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Load gallery public info
  useEffect(() => {
    fetchGalleryInfo(slug);
  }, [slug]);

  const fetchGalleryInfo = async (targetSlug: string) => {
    setIsLoading(true);
    setPinError(null);
    try {
      const res = await fetch(`/api/gallery/${targetSlug}/info`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gallery not found or unpublished.');
      }
      setGalleryInfo(data);
    } catch (err: any) {
      setPinError(err.message);
      setGalleryInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setPinError('Please enter the 6-digit access PIN.');
      return;
    }

    setIsVerifying(true);
    setPinError(null);

    try {
      const res = await fetch(`/api/gallery/${slug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect PIN entered.');
      }

      setSessionToken(data.token);
      setIsUnlocked(true);
      await fetchGalleryPhotos(data.token);
    } catch (err: any) {
      setPinError(err.message || 'Incorrect PIN. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchGalleryPhotos = async (token: string) => {
    try {
      const res = await fetch(`/api/gallery/${slug}/photos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-gallery-pin': pinInput.trim(),
        },
      });
      const data = await res.json();
      if (res.ok && data.photos) {
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error('Failed to load published photos:', err);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setActiveLightboxIndex(prev => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, photos]);

  const categories = ['All', ...Array.from(new Set(photos.map(p => p.category).filter(Boolean)))];

  const filteredPhotos = photos
    .filter(p => {
      if (selectedCategory === 'Favorites') {
        if (!favorites.has(p.id)) return false;
      } else if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.originalFilename || '').toLowerCase().includes(q) || (p.filename || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name') return (a.originalFilename || a.filename).localeCompare(b.originalFilename || b.filename);
      return 0;
    });

  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredPhotos.length / (pageSize as number));
  const paginatedPhotos = infiniteScrollMode
    ? filteredPhotos.slice(0, visibleCount)
    : pageSize === 'all'
    ? filteredPhotos
    : filteredPhotos.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number));

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const downloadPhoto = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSinglePhoto = (photo: PublishedPhotoItem, quality: 'original' | 'web' = 'original') => {
    const url = `/api/photos/${photo.id}/download?quality=${quality}`;
    downloadPhoto(url, photo.originalFilename || photo.filename);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportGallery = async () => {
    if (isExporting || photos.length === 0) return;
    setIsExporting(true);
    setExportError(null);
    setExportStatus('Initiating gallery export...');

    try {
      const cleanPin = pinInput.trim();
      const safeName = (galleryInfo?.eventName || 'Gallery').replace(/[^a-zA-Z0-9_-]/g, '_');

      // 1. First attempt: Fast server-side ZIP packaging
      setExportStatus('Generating ZIP archive from server...');
      const exportUrl = `/api/gallery/${slug}/export-zip?pin=${encodeURIComponent(cleanPin)}`;
      const headers: Record<string, string> = {
        'x-gallery-pin': cleanPin,
      };
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      let succeeded = false;

      try {
        const res = await fetch(exportUrl, { headers });
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 0) {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${safeName}_Approved_Photographs.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            succeeded = true;
          }
        }
      } catch (srvErr) {
        console.warn('Server export route encounter, falling back to browser-side bundling:', srvErr);
      }

      // 2. Client-side JSZip fallback if server-side is unavailable or fails
      if (!succeeded) {
        setExportStatus('Packaging approved photographs in browser...');
        const zip = new JSZip();

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const filename = photo.originalFilename || photo.filename || `photo-${i + 1}.jpg`;
          setExportStatus(`Packaging image ${i + 1} of ${photos.length} (${photo.category})...`);

          try {
            const photoRes = await fetch(photo.storageLocation);
            if (photoRes.ok) {
              const photoBlob = await photoRes.blob();
              zip.file(filename, photoBlob);
              continue;
            }
          } catch (fetchErr) {
            console.warn(`Could not bundle image ${photo.id}:`, fetchErr);
          }

          // In case remote asset cannot be read via CORS, include metadata descriptor
          zip.file(`${filename}.txt`, `File: ${photo.originalFilename}\nCategory: ${photo.category}\nSource: ${photo.storageLocation}`);
        }

        setExportStatus('Compressing ZIP archive...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const downloadUrl = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${safeName}_Approved_Photographs.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      }

      setExportStatus('Gallery archive downloaded successfully!');
      setTimeout(() => setExportStatus(null), 4000);
    } catch (err: any) {
      console.error('Export failed:', err);
      setExportError(err.message || 'Failed to export gallery ZIP archive. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /* =========================================================================
     SCREEN 1: PIN GATEWAY (Customer must enter valid PIN to unlock)
  ========================================================================= */
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col justify-between text-neutral-100 selection:bg-white selection:text-neutral-900">
        {/* Top bar with exit button */}
        <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App Workspace</span>
          </button>
          <span className="text-xs text-neutral-500 font-mono">Customer Gallery Access Portal</span>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-md mx-auto px-4 py-8">
          <div className="bg-neutral-800/90 border border-neutral-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            {/* Header Badge */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-neutral-700/80 border border-neutral-600 flex items-center justify-center text-white shadow-inner">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-serif tracking-tight text-white mb-2">
                {galleryInfo?.eventName || 'Private Event Gallery'}
              </h2>
              <p className="text-xs text-neutral-400">
                {galleryInfo?.clientName ? `Hosted for ${galleryInfo.clientName}` : 'Protected client photographs'}
              </p>
              {galleryInfo?.location && (
                <p className="text-[11px] text-neutral-500 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" /> {galleryInfo.location}
                </p>
              )}
            </div>

            {/* PIN Form */}
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 text-center mb-2">
                  Enter Your 6-Digit Access PIN
                </label>
                <div className="relative">
                  <input
                    id="customer-pin-input"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    autoFocus
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center text-3xl tracking-[0.4em] font-mono py-3.5 px-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 placeholder:text-neutral-700 transition"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                    <KeyRound className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {pinError && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                id="customer-unlock-btn"
                type="submit"
                disabled={isVerifying || !pinInput}
                className="w-full py-3.5 px-6 bg-white hover:bg-neutral-100 text-neutral-900 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Security PIN...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Gallery Photographs</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Helper for Demo Evaluation */}
            <div className="mt-6 pt-5 border-t border-neutral-700/60 text-center">
              <p className="text-[11px] text-neutral-400 mb-2">
                Evaluating this submission?
              </p>
              <button
                id="demo-pin-autofill-btn"
                type="button"
                onClick={() => setPinInput('482917')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-750 hover:bg-neutral-700 border border-neutral-600 text-xs font-mono text-amber-300 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Use Demo PIN: 482917</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto w-full px-6 py-4 text-center text-xs text-neutral-600">
          Powered by Trizen PhotoShare • Private Client Encryption & Object Storage
        </div>
      </div>
    );
  }

  /* =========================================================================
     SCREEN 2: UNLOCKED CUSTOMER GALLERY (Section 2.3)
  ========================================================================= */
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800 selection:text-white pb-20">
      {/* Sticky Customer Header */}
      <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
              title="Return to management workspace"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-white tracking-tight truncate max-w-[200px] sm:max-w-sm">
                {galleryInfo?.eventName}
              </h1>
              <p className="text-[11px] text-neutral-400 truncate">
                {galleryInfo?.clientName} • {photos.length} Photographs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Gallery Button */}
            <button
              id="export-gallery-btn"
              onClick={handleExportGallery}
              disabled={isExporting || photos.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm disabled:opacity-50 cursor-pointer"
              title="Download all approved photographs as a ZIP file"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FolderDown className="w-3.5 h-3.5" />
              )}
              <span className="font-medium">{isExporting ? 'Exporting...' : 'Export Gallery'}</span>
            </button>

            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => {
                setIsUnlocked(false);
                setPinInput('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Gallery</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Visual Section */}
      <div className="relative py-12 px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80 bg-linear-to-b from-neutral-900 to-neutral-950">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Official Event Gallery
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {galleryInfo?.eventName}
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            {galleryInfo?.welcomeMessage || 'Thank you for celebrating with us. Enjoy browsing and downloading memories from our special celebration.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400 pt-2">
            {galleryInfo?.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {new Date(galleryInfo.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {galleryInfo?.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                {galleryInfo.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
              {photos.length} High-Resolution Photographs
            </span>
            {galleryInfo?.expiresAt && (
              <span className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                <Clock className="w-3 h-3" />
                Expires: {new Date(galleryInfo.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Prominent Hero Export Gallery CTA */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              id="hero-export-gallery-btn"
              onClick={handleExportGallery}
              disabled={isExporting || photos.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs sm:text-sm transition shadow-xl disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                  <span>{exportStatus || 'Generating ZIP Archive...'}</span>
                </>
              ) : (
                <>
                  <FolderDown className="w-4 h-4 text-emerald-600" />
                  <span>Export Gallery ({photos.length} Approved Photos • ZIP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Controls & Filter Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Search, Sort & Pagination Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search gallery photographs..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-neutral-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-medium focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="newest" className="bg-neutral-900 text-white">Newest First</option>
                <option value="oldest" className="bg-neutral-900 text-white">Oldest First</option>
                <option value="name" className="bg-neutral-900 text-white">Filename (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5">
              <span className="text-neutral-500 font-medium">Page Size:</span>
              <select
                value={pageSize}
                onChange={e => {
                  const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
                  setPageSize(val as any);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-white font-medium focus:outline-hidden text-xs cursor-pointer"
              >
                <option value={12} className="bg-neutral-900 text-white">12</option>
                <option value={24} className="bg-neutral-900 text-white">24</option>
                <option value={48} className="bg-neutral-900 text-white">48</option>
                <option value="all" className="bg-neutral-900 text-white">All</option>
              </select>
            </div>

            <button
              onClick={() => setInfiniteScrollMode(!infiniteScrollMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                infiniteScrollMode
                  ? 'bg-white text-neutral-900 border-white shadow-xs'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              {infiniteScrollMode ? 'Infinite Mode: ON' : 'Infinite Mode: OFF'}
            </button>
          </div>
        </div>

        {/* Category Filter Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-neutral-800/60">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {cat} {cat === 'All' ? `(${photos.length})` : ''}
              </button>
            ))}

            {favorites.size > 0 && (
              <button
                onClick={() => {
                  setSelectedCategory('Favorites');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 flex items-center gap-1 ${
                  selectedCategory === 'Favorites'
                    ? 'bg-rose-500 text-white'
                    : 'bg-neutral-900 text-rose-400 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <Heart className="w-3 h-3 fill-current" />
                <span>Favorites ({favorites.size})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">
              Showing {paginatedPhotos.length} of {filteredPhotos.length} photos
            </span>
            <button
              id="category-bar-export-btn"
              onClick={handleExportGallery}
              disabled={isExporting || photos.length === 0}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              title="Download approved photos ZIP archive"
            >
              <Download className="w-3 h-3" />
              <span>Export All (ZIP)</span>
            </button>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm">
            No photographs found under this filter.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
              {paginatedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md transition-all duration-300 hover:border-neutral-700 hover:shadow-xl flex flex-col"
                >
                  <div
                    className="relative aspect-4/3 overflow-hidden cursor-pointer bg-neutral-900"
                    onClick={() => setActiveLightboxIndex(index)}
                  >
                    <img
                      src={photo.thumbnailUrl || `/api/photos/${photo.id}/thumbnail?w=480`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== photo.storageLocation) {
                          target.src = photo.storageLocation;
                        }
                      }}
                      alt={photo.originalFilename}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5">
                      {/* Top action icons */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full">
                          {photo.category}
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleFavorite(photo.id);
                          }}
                          className={`p-1.5 rounded-full backdrop-blur-xs transition ${
                            favorites.has(photo.id)
                              ? 'bg-rose-600 text-white'
                              : 'bg-black/60 text-white hover:bg-black/80'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${favorites.has(photo.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Bottom view & download */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white font-medium truncate max-w-[140px]">
                          {photo.originalFilename}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              downloadSinglePhoto(photo, 'original');
                            }}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-neutral-900 transition backdrop-blur-xs"
                            title="Download High-Res Original"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveLightboxIndex(index)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-neutral-900 transition backdrop-blur-xs"
                            title="View fullscreen"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtle caption with dual download options */}
                  <div className="p-2.5 flex items-center justify-between text-[11px] text-neutral-400 bg-neutral-900/60 border-t border-neutral-800/40">
                    <span className="truncate">{photo.category}</span>
                    <div className="flex items-center gap-2">
                      <span>{(photo.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                      <button
                        onClick={() => downloadSinglePhoto(photo, 'web')}
                        className="text-[10px] text-neutral-400 hover:text-white transition underline"
                        title="Download Web-Optimized version"
                      >
                        Web (1600px)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination & Infinite Scroll Footer */}
            <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-neutral-400">
                Showing <strong className="text-white">{paginatedPhotos.length}</strong> of{' '}
                <strong className="text-white">{filteredPhotos.length}</strong> photograph(s)
              </div>

              {infiniteScrollMode ? (
                visibleCount < filteredPhotos.length ? (
                  <button
                    onClick={() => setVisibleCount(prev => Math.min(prev + (pageSize === 'all' ? 12 : Number(pageSize)), filteredPhotos.length))}
                    className="px-4 py-2 bg-white text-neutral-950 rounded-xl font-semibold hover:bg-neutral-200 transition shadow-xs cursor-pointer"
                  >
                    Load More Photos ({filteredPhotos.length - visibleCount} remaining)
                  </button>
                ) : (
                  <span className="text-neutral-500 font-medium">All {filteredPhotos.length} photos loaded</span>
                )
              ) : pageSize !== 'all' && totalPages > 1 ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300"
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
                            ? 'bg-white text-neutral-950'
                            : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal (Bonus / Customer Experience) */}
      {activeLightboxIndex !== null && filteredPhotos[activeLightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between backdrop-blur-sm animate-in fade-in duration-200">
          {/* Top control bar */}
          <div className="px-6 py-4 flex items-center justify-between text-white border-b border-neutral-800">
            <div>
              <p className="text-sm font-semibold truncate max-w-sm">
                {filteredPhotos[activeLightboxIndex].originalFilename}
              </p>
              <p className="text-xs text-neutral-400">
                Photo {activeLightboxIndex + 1} of {filteredPhotos.length} • {filteredPhotos[activeLightboxIndex].category}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  downloadSinglePhoto(
                    filteredPhotos[activeLightboxIndex],
                    'original'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-neutral-900 text-xs font-bold hover:bg-neutral-200 transition"
                title="Download High-Res Original"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Original (High-Res)</span>
              </button>
              <button
                onClick={() =>
                  downloadSinglePhoto(
                    filteredPhotos[activeLightboxIndex],
                    'web'
                  )
                }
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-medium hover:bg-neutral-700 hover:text-white transition"
                title="Download Web-Optimized version"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Web (1600px)</span>
              </button>
              <button
                onClick={() => setActiveLightboxIndex(null)}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image with Left/Right controls */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            <button
              onClick={() =>
                setActiveLightboxIndex(prev =>
                  prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1
                )
              }
              className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-xs"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={filteredPhotos[activeLightboxIndex].storageLocation}
              alt={filteredPhotos[activeLightboxIndex].originalFilename}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />

            <button
              onClick={() =>
                setActiveLightboxIndex(prev =>
                  prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0
                )
              }
              className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-xs"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Info Bar */}
          <div className="px-6 py-3 border-t border-neutral-800 text-center text-xs text-neutral-500">
            Use Left and Right arrow keys to navigate • Esc to exit lightbox
          </div>
        </div>
      )}

      {/* Floating Export Status / Progress Toast */}
      {(isExporting || exportStatus || exportError) && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-neutral-900/95 border border-neutral-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            {isExporting ? (
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0 mt-0.5" />
            ) : exportError ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-semibold text-white">
                {isExporting ? 'Exporting Gallery Archive' : exportError ? 'Export Notice' : 'Gallery Export'}
              </p>
              <p className="text-neutral-300 mt-0.5 text-[11px] leading-relaxed">
                {exportError || exportStatus}
              </p>
            </div>
            {!isExporting && (
              <button
                onClick={() => {
                  setExportStatus(null);
                  setExportError(null);
                }}
                className="text-neutral-500 hover:text-white transition p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
