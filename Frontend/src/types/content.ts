export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl?: string | null;
  instructorId: string;
  instructorName: string;
  courseId?: string | null;
  courseTitle?: string | null;
  featured: boolean;
  publishedAt: string;
  updatedAt?: string | null;
}

export interface ResourceFile {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileExtension: string;
  fileSize: number;
  instructorId: string;
  instructorName: string;
  courseId?: string | null;
  courseTitle?: string | null;
  publishedAt: string;
}

export interface ToolRelease {
  id: string;
  appName: string;
  version: string;
  releaseNotes: string;
  fileName: string;
  fileUrl: string;
  fileExtension: string;
  fileSize: number;
  downloadFileName?: string;
  downloadFileUrl?: string;
  downloadFileExtension?: string;
  downloadFileSize?: number;
  uploadedById: string;
  uploadedByName: string;
  isLatest: boolean;
  publishedAt: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track?: (eventName: string, params?: Record<string, unknown>) => void;
    };
  }
}
