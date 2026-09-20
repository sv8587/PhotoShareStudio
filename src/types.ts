export type UserRole = 'admin' | 'team_member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface GalleryConfig {
  isPublished: boolean;
  slug: string;
  pin: string;
  publishedAt?: string;
  expiresAt?: string;
  allowDownloads: boolean;
  welcomeMessage?: string;
}

export interface EventItem {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  clientName: string;
  coverPhoto?: string;
  createdById: string;
  assignedTeamMemberIds: string[];
  gallery: GalleryConfig;
  createdAt: string;
  // Computed counters
  totalPhotos?: number;
  selectedPhotos?: number;
}

export interface PhotoMetadata {
  id: string;
  eventId: string;
  uploadedBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  filename: string;
  originalFilename: string;
  storageLocation: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isSelected: boolean;
  category?: string;
  createdAt: string;
}

export interface GalleryPublicInfo {
  slug: string;
  eventId: string;
  eventName: string;
  description: string;
  date: string;
  location: string;
  clientName: string;
  coverPhoto?: string;
  photoCount: number;
  isPublished: boolean;
  requiresPin: boolean;
  allowDownloads: boolean;
  welcomeMessage?: string;
  expiresAt?: string;
  isExpired?: boolean;
}

export interface TestResultItem {
  name: string;
  category: 'Auth & Authorization' | 'Photo Access Control' | 'Gallery Publishing' | 'PIN Verification' | 'Security & Boundary';
  status: 'passed' | 'failed';
  details: string;
  executionTimeMs: number;
}
