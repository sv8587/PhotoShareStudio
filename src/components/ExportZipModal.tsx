import React, { useState } from 'react';
import { 
  X, Download, Archive, CheckCircle2, AlertCircle, Loader2, 
  Layers, Sparkles, UserCheck, Calendar, MapPin, FileCheck
} from 'lucide-react';
import { EventItem, User } from '../types';
import { exportEventPhotosAsZip, ExportScope, ExportProgress } from '../services/zipExportService';

interface ExportZipModalProps {
  event: EventItem;
  currentUser: User;
  onClose: () => void;
}

export const ExportZipModal: React.FC<ExportZipModalProps> = ({
  event,
  currentUser,
  onClose,
}) => {
  const [scope, setScope] = useState<ExportScope>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedFilename, setCompletedFilename] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const totalPhotos = event.totalPhotos || 0;
  const selectedPhotos = event.selectedPhotos || 0;

  const handleStartExport = async () => {
    setIsExporting(true);
    setError(null);
    setCompletedFilename(null);

    try {
      const result = await exportEventPhotosAsZip(event, currentUser, {
        scope,
        onProgress: (prog) => {
          setProgress(prog);
        },
      });

      setCompletedFilename(result.filename);
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(err.message || 'Failed to generate and download ZIP archive.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Archive className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Export Event Photographs</h3>
              <p className="text-xs text-neutral-500">Packaged as compressed high-resolution ZIP</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Event Context Card */}
          <div className="flex gap-4 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 items-center">
            <img
              src={event.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300'}
              alt={event.name}
              className="w-16 h-16 rounded-xl object-cover ring-1 ring-neutral-300 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-neutral-900 truncate">{event.name}</h4>
              <p className="text-neutral-500 truncate mt-0.5">Client: <span className="font-semibold text-neutral-800">{event.clientName}</span></p>
              <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Scope Selector Options */}
          {!completedFilename && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 block">
                Select Photo Packaging Scope:
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {/* All Photos */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                    scope === 'all'
                      ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    value="all"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    disabled={isExporting}
                    className="mt-0.5 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">All Event Photographs</span>
                      <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {totalPhotos} photos
                      </span>
                    </div>
                    <p className="text-neutral-500 mt-0.5 text-[11px]">
                      Complete master archive of all raw and processed photos uploaded by the photography team.
                    </p>
                  </div>
                </label>

                {/* Curated / Approved Only */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                    scope === 'curated'
                      ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    value="curated"
                    checked={scope === 'curated'}
                    onChange={() => setScope('curated')}
                    disabled={isExporting}
                    className="mt-0.5 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">Curated & Approved Only</span>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {selectedPhotos} photos
                      </span>
                    </div>
                    <p className="text-neutral-500 mt-0.5 text-[11px]">
                      Only photographs officially selected by Lead Admin for customer gallery delivery.
                    </p>
                  </div>
                </label>

                {/* Team Member Only: My Uploads */}
                {!isAdmin && (
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                      scope === 'my_uploads'
                        ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportScope"
                      value="my_uploads"
                      checked={scope === 'my_uploads'}
                      onChange={() => setScope('my_uploads')}
                      disabled={isExporting}
                      className="mt-0.5 text-neutral-900 focus:ring-neutral-900"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900">My Uploads Only</span>
                        <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          Your captures
                        </span>
                      </div>
                      <p className="text-neutral-500 mt-0.5 text-[11px]">
                        Export only photographs uploaded under your account ({currentUser.name}).
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Progress / Status Block */}
          {isExporting && progress && (
            <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>{progress.status}</span>
                </span>
                <span className="font-mono font-bold text-amber-400">{progress.percent}%</span>
              </div>

              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <p className="text-[11px] text-neutral-400 text-center">
                Bundling high-res photographs and verified SHA-256 metadata manifest...
              </p>
            </div>
          )}

          {/* Success Banner */}
          {completedFilename && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>ZIP Export Complete!</span>
              </div>
              <p className="text-xs text-emerald-800">
                Your browser download has started. If the download didn't begin automatically, click the button below to re-download.
              </p>
              <div className="p-2 bg-white rounded-xl border border-emerald-200 text-xs font-mono text-neutral-700 break-all flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{completedFilename}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-900">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Export Notice</p>
                <p className="text-red-800 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Included Features Note */}
          {!isExporting && !completedFilename && (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Archive Includes</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-600">
                <li>Full resolution photographic assets with original filenames</li>
                <li>Machine-readable <code className="font-mono bg-neutral-200/60 px-1 py-0.5 rounded text-[10px]">manifest.json</code> with uploader and category attribution</li>
                <li>Fast streaming with zero compression quality loss</li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold transition text-xs"
          >
            {completedFilename ? 'Close' : 'Cancel'}
          </button>

          {!completedFilename ? (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition text-xs shadow-xs disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Packaging Archive...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download ZIP Archive</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleStartExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition text-xs shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
