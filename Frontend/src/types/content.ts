export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  instructorId: string;
  instructorName: string;
  courseId?: string | null;
  courseTitle?: string | null;
  featured: boolean;
  publishedAt: string;
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
  uploadedById: string;
  uploadedByName: string;
  isLatest: boolean;
  publishedAt: string;
}
