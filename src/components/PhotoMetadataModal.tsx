import React from 'react';
import { X, FileImage, User, Calendar, HardDrive, Hash, Link as LinkIcon, Check, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PhotoMetadata } from '../types';

interface PhotoMetadataModalProps {
  photo: PhotoMetadata | null;
  onClose: () => void;
  isAdmin: boolean;
  onToggleSelect?: (photoId: string, currentSelected: boolean) => void;
}

export const PhotoMetadataModal: React.FC<PhotoMetadataModalProps> = ({
  photo,
  onClose,
  isAdmin,
  onToggleSelect,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!photo) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const copyStorageLocation = () => {
    navigator.clipboard.writeText(photo.storageLocation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <FileImage className="w-5 h-5 text-neutral-800" />
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Photo Storage & Database Metadata</h3>
              <p className="text-xs text-neutral-500">Section 4 Conformance — Database Object Record</p>
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
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo Preview */}
          <div className="flex flex-col gap-3">
            <div className="relative rounded-xl overflow-hidden bg-neutral-900 aspect-4/3 flex items-center justify-center">
              <img
                src={photo.storageLocation}
                alt={photo.filename}
                className="w-full h-full object-cover"
              />
              {photo.isSelected && (
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected for Gallery</span>
                </div>
              )}
            </div>

            {isAdmin && onToggleSelect && (
              <button
                id="modal-toggle-select-btn"
                onClick={() => onToggleSelect(photo.id, photo.isSelected)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  photo.isSelected
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                {photo.isSelected ? 'Remove from Published Selection' : 'Add to Published Selection'}
              </button>
            )}
          </div>

          {/* Detailed Metadata Fields strictly matching Section 4 */}
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
              <div>
                <span className="text-neutral-400 font-medium flex items-center gap-1.5 mb-0.5">
                  <Hash className="w-3.5 h-3.5" /> Photo ID
                </span>
                <p className="font-mono text-neutral-800 font-semibold">{photo.id}</p>
              </div>

              <div>
                <span className="text-neutral-400 font-medium flex items-center gap-1.5 mb-0.5">
                  <Hash className="w-3.5 h-3.5" /> Event ID
                </span>
                <p className="font-mono text-neutral-800">{photo.eventId}</p>
              </div>

              <div>
                <span className="text-neutral-400 font-medium flex items-center gap-1.5 mb-0.5">
                  <User className="w-3.5 h-3.5" /> Uploaded By
                </span>
                <p className="text-neutral-900 font-semibold">{photo.uploadedBy.name}</p>
                <p className="text-[11px] text-neutral-500 font-mono">ID: {photo.uploadedBy.id} ({photo.uploadedBy.role})</p>
              </div>

              <div>
                <span className="text-neutral-400 font-medium flex items-center gap-1.5 mb-0.5">
                  <FileImage className="w-3.5 h-3.5" /> Filename (Original vs Disk)
                </span>
                <p className="font-mono text-neutral-900 font-medium break-all">{photo.originalFilename}</p>
                <p className="text-[11px] font-mono text-neutral-500 break-all">Disk: {photo.filename}</p>
              </div>

              <div>
                <span className="text-neutral-400 font-medium flex items-center gap-1.5 mb-0.5">
                  <HardDrive className="w-3.5 h-3.5" /> File Size & MIME Type
                </span>
                <p className="text-neutral-900 font-semibold">
                  {formatBytes(photo.fileSize)} <span className="font-normal text-neutral-500 font-mono">({photo.fileSize.toLocaleString()} bytes)</span>
                </p>
                <p className="text-[11px] font-mono text-neutral-500">{photo.mimeType}</p>
              </div>

              <div>
                <span className="text-neutral-400 font-medium flex items-center gap-1.5 mb-0.5">
                  <Calendar className="w-3.5 h-3.5" /> Created At
                </span>
                <p className="text-neutral-900 font-medium">
                  {new Date(photo.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Storage Location Link */}
            <div>
              <span className="text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                <LinkIcon className="w-3.5 h-3.5" /> Storage Location (Object Storage URL)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={photo.storageLocation}
                  className="bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-neutral-700 w-full truncate"
                />
                <button
                  onClick={copyStorageLocation}
                  className="px-2.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>Metadata conforms with Section 4 storage specification</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-700 font-semibold hover:bg-neutral-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
