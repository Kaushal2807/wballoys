export interface FileItem {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  category: string | null;
  folder: string | null;
  description: string | null;
  created_at: string;
  user_id: number;
}

export interface FileUploadResponse {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  category: string | null;
  folder: string | null;
  description: string | null;
  created_at: string;
}

export interface FileUpdateRequest {
  category?: string;
  folder?: string;
  description?: string;
}
