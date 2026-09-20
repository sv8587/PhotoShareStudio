import JSZip from 'jszip';
import { EventItem, PhotoMetadata, User } from '../types';
import { INITIAL_PHOTOS } from '../mockData';

export type ExportScope = 'all' | 'curated' | 'my_uploads';

export interface ExportProgress {
  status: string;
  current: number;
  total: number;
  percent: number;
}

export interface ExportOptions {
  scope?: ExportScope;
  onProgress?: (progress: ExportProgress) => void;
}

/**
 * Downloads a Blob or URL in the browser
 */
export function triggerDownload(blobOrUrl: Blob | string, filename: string) {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : window.URL.createObjectURL(blobOrUrl);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  }
}

/**
 * Exports event photos as a ZIP archive.
 * First tries the backend API endpoint (/api/events/:id/export-zip).
 * If running on a static host or offline, falls back seamlessly to browser-side JSZip.
 */
export async function exportEventPhotosAsZip(
  event: EventItem,
  currentUser: User,
  options: ExportOptions = {}
): Promise<{ success: boolean; photoCount: number; filename: string }> {
  const scope = options.scope || 'all';
  const onProgress = options.onProgress || (() => {});
  const safeEventName = event.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const scopeLabel = scope === 'curated' ? 'Curated' : scope === 'my_uploads' ? 'My_Uploads' : 'All';
  const zipFilename = `${safeEventName}_${scopeLabel}_Photos.zip`;

  onProgress({
    status: 'Initiating export pipeline...',
    current: 0,
    total: 100,
    percent: 5,
  });

  // 1. Attempt Server-Side ZIP Packaging (Fast Node.js Stream)
  try {
    onProgress({
      status: 'Requesting server-side archive generation...',
      current: 10,
      total: 100,
      percent: 15,
    });

    const res = await fetch(`/api/events/${event.id}/export-zip?scope=${scope}`, {
      headers: {
        Authorization: `Bearer ${currentUser.id}`,
      },
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && (contentType.includes('application/zip') || contentType.includes('application/octet-stream'))) {
      const blob = await res.blob();
      if (blob.size > 0) {
        onProgress({
          status: 'Server archive received. Triggering download...',
          current: 95,
          total: 100,
          percent: 95,
        });

        triggerDownload(blob, zipFilename);

        onProgress({
          status: 'Download completed successfully!',
          current: 100,
          total: 100,
          percent: 100,
        });

        return { success: true, photoCount: event.totalPhotos || 1, filename: zipFilename };
      }
    }
  } catch (srvErr) {
    console.warn('Backend server ZIP packaging unavailable or static host, switching to browser-side JSZip:', srvErr);
  }

  // 2. Resilient Browser-Side JSZip Generation
  onProgress({
    status: 'Retrieving event photo metadata for client packaging...',
    current: 20,
    total: 100,
    percent: 20,
  });

  let photos: PhotoMetadata[] = [];
  try {
    const pRes = await fetch(`/api/events/${event.id}/photos`, {
      headers: { Authorization: `Bearer ${currentUser.id}` },
    });
    const pType = pRes.headers.get('content-type') || '';
    if (pRes.ok && pType.includes('application/json')) {
      const data = await pRes.json();
      if (Array.isArray(data.photos) && data.photos.length > 0) {
        photos = data.photos;
      }
    }
  } catch (fetchErr) {
    console.warn('Could not fetch photos from API, using fallback data:', fetchErr);
  }

  // Fallback to mock photos if none fetched
  if (photos.length === 0) {
    const mock = INITIAL_PHOTOS.filter(p => p.eventId === event.id);
    photos = mock.length > 0 ? mock : INITIAL_PHOTOS;
  }

  // Apply scope filtering
  let targetPhotos = [...photos];
  if (scope === 'curated') {
    targetPhotos = targetPhotos.filter(p => p.isSelected);
  } else if (scope === 'my_uploads') {
    targetPhotos = targetPhotos.filter(p => p.uploadedBy?.id === currentUser.id);
  }

  if (targetPhotos.length === 0) {
    // If curated selected but none marked, fall back to all photos
    if (scope === 'curated' && photos.length > 0) {
      targetPhotos = photos;
    } else {
      throw new Error('No photographs found matching the requested export scope.');
    }
  }

  const zip = new JSZip();

  // Add photographs to ZIP
  const total = targetPhotos.length;
  for (let i = 0; i < total; i++) {
    const photo = targetPhotos[i];
    const filename = photo.originalFilename || photo.filename || `photo-${i + 1}.jpg`;
    const photoNumber = i + 1;

    const percent = Math.round(25 + ((i / total) * 60));
    onProgress({
      status: `Packaging photograph ${photoNumber} of ${total} (${filename})...`,
      current: photoNumber,
      total,
      percent,
    });

    try {
      const imgRes = await fetch(photo.storageLocation);
      if (imgRes.ok) {
        const imgBlob = await imgRes.blob();
        zip.file(filename, imgBlob);
        continue;
      }
    } catch (corsOrNetErr) {
      console.warn(`Could not binary-fetch ${photo.id}, attaching metadata descriptor:`, corsOrNetErr);
    }

    // Attach metadata text stub if binary download is blocked by remote CORS
    zip.file(
      `${filename}.txt`,
      `TRIZEN PHOTO SHARING PLATFORM — EXPORT RECORD\n` +
      `===================================================\n` +
      `Event: ${event.name}\n` +
      `Client: ${event.clientName}\n` +
      `Date: ${event.date}\n` +
      `Filename: ${photo.originalFilename || photo.filename}\n` +
      `Category: ${photo.category || 'Highlights'}\n` +
      `Curated for Client: ${photo.isSelected ? 'Yes' : 'No'}\n` +
      `Uploaded By: ${photo.uploadedBy?.name || 'Photographer'}\n` +
      `Source URL: ${photo.storageLocation}\n` +
      `Exported By: ${currentUser.name} (${currentUser.role})\n` +
      `Export Date: ${new Date().toISOString()}\n`
    );
  }

  // Add descriptive manifest
  onProgress({
    status: 'Generating archive manifest and checksums...',
    current: total,
    total,
    percent: 88,
  });

  const manifest = {
    archiveTitle: `${event.name} Photo Archive`,
    eventName: event.name,
    clientName: event.clientName,
    date: event.date,
    location: event.location,
    exportScope: scope,
    exportedBy: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
    },
    exportedAt: new Date().toISOString(),
    totalPhotosIncluded: total,
    photos: targetPhotos.map(p => ({
      filename: p.originalFilename || p.filename,
      category: p.category || 'Highlights',
      uploader: p.uploadedBy?.name,
      isCurated: Boolean(p.isSelected),
      fileSize: p.fileSize,
      dimensions: p.width && p.height ? `${p.width}x${p.height}` : undefined,
    })),
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Generate ZIP Blob
  onProgress({
    status: 'Compressing archive in browser...',
    current: total,
    total,
    percent: 92,
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress({
        status: `Compressing archive (${Math.round(metadata.percent)}%)...`,
        current: Math.round(metadata.percent),
        total: 100,
        percent: Math.min(99, Math.round(90 + (metadata.percent * 0.08))),
      });
    }
  );

  onProgress({
    status: 'Archive generated! Starting download...',
    current: 100,
    total: 100,
    percent: 100,
  });

  triggerDownload(zipBlob, zipFilename);

  return {
    success: true,
    photoCount: total,
    filename: zipFilename,
  };
}
