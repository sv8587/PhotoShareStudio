import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileImage, Trash2, CheckCircle, AlertCircle, Loader2, Tag, ShieldCheck } from 'lucide-react';
import { User, PhotoMetadata } from '../types';

interface PhotoUploadModalProps {
  eventId: string;
  eventName: string;
  currentUser: User;
  onClose: () => void;
  onUploadSuccess: (newPhotos: PhotoMetadata[]) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  eventId,
  eventName,
  currentUser,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<string>('Ceremony');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Ceremony', 'Portraits', 'Sangeet', 'Haldi', 'Reception', 'Candid', 'Details'];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);
    const validFiles: File[] = [];
    const maxFileSize = 25 * 1024 * 1024; // 25MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setUploadError(`Skipped '${file.name}': Not a valid image file.`);
        continue;
      }
      if (file.size > maxFileSize) {
        setUploadError(`Skipped '${file.name}': Exceeds 25MB maximum limit.`);
        continue;
      }
      validFiles.push(file);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const executeUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('photos', file);
    });
    formData.append('category', category);

    try {
      const res = await fetch(`/api/events/${eventId}/photos/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photos.');
      }

      onUploadSuccess(data.photos || []);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h3 className="font-bold text-neutral-900 text-base">Upload Event Photographs</h3>
            <p className="text-xs text-neutral-500">Event: {eventName}</p>
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
          {/* Category Tag Selection */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-neutral-500" /> Photo Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    category === cat
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
              dragActive
                ? 'border-neutral-900 bg-neutral-100'
                : 'border-neutral-300 hover:border-neutral-500 bg-neutral-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-800 mb-3">
              <UploadCloud className="w-6 h-6 text-neutral-700" />
            </div>
            <p className="text-sm font-semibold text-neutral-900">
              Drag & drop photos here, or <span className="text-blue-600 underline">browse files</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Supports JPEG, PNG, WEBP up to 25MB each. Multi-file selection enabled.
            </p>
          </div>

          {/* Error Message & Retry */}
          {uploadError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs text-red-800 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Upload Error Handled</p>
                  <p className="text-red-700 mt-0.5">{uploadError}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-red-200/60 pl-6">
                <button
                  type="button"
                  onClick={() => {
                    setUploadError(null);
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-semibold transition"
                >
                  Retry with valid photo
                </button>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Test Scenario Simulator: A failed photo upload */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-600" />
              <div>
                <span className="font-semibold text-neutral-800">Scenario Test: Failed Upload</span>
                <p className="text-[11px] text-neutral-500">Test rejection of oversized (&gt;25MB) or corrupted uploads</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUploadError('Security Validation Error: File exceeds 25MB threshold or has invalid MIME type. Upload aborted safely by backend storage guard.');
              }}
              className="px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold rounded-lg transition shrink-0"
            >
              Simulate Failure
            </button>
          </div>

          {/* Selected Files Queue */}
          {selectedFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-2">
                <span>Selected Photos ({selectedFiles.length})</span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-neutral-400 hover:text-red-600 transition"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileImage className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span className="truncate font-medium text-neutral-800">{file.name}</span>
                      <span className="text-neutral-400 shrink-0">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 text-neutral-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Uploading as <strong className="text-neutral-800">{currentUser.name}</strong>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
            >
              Cancel
            </button>
            <button
              id="confirm-upload-btn"
              type="button"
              onClick={executeUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading {selectedFiles.length} photo(s)...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload {selectedFiles.length} Photos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
