import apiClient from './api';
import { FileItem, FileUploadResponse, FileUpdateRequest } from '../types/file';

/**
 * Upload a single file
 */
export const uploadFile = async (
  file: File,
  category?: string,
  folder?: string,
  description?: string
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);
  if (folder) formData.append('folder', folder);
  if (description) formData.append('description', description);

  const response = await apiClient.post<FileUploadResponse>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (
  files: File[],
  category?: string,
  folder?: string
): Promise<FileUploadResponse[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  if (category) formData.append('category', category);
  if (folder) formData.append('folder', folder);

  const response = await apiClient.post<FileUploadResponse[]>('/files/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get all files for current user
 */
export const getFiles = async (category?: string, folder?: string): Promise<FileItem[]> => {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  if (folder) params.folder = folder;

  const response = await apiClient.get<FileItem[]>('/files/', { params });
  return response.data;
};

/**
 * Get a specific file by ID
 */
export const getFileById = async (fileId: number): Promise<FileItem> => {
  const response = await apiClient.get<FileItem>(`/files/${fileId}`);
  return response.data;
};

/**
 * Update file metadata
 */
export const updateFile = async (fileId: number, data: FileUpdateRequest): Promise<FileItem> => {
  const response = await apiClient.patch<FileItem>(`/files/${fileId}`, data);
  return response.data;
};

/**
 * Delete a file
 */
export const deleteFile = async (fileId: number): Promise<void> => {
  await apiClient.delete(`/files/${fileId}`);
};

/**
 * Get list of unique categories
 */
export const getCategories = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>('/files/categories/list');
  return response.data;
};

/**
 * Get list of unique folders
 */
export const getFolders = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>('/files/folders/list');
  return response.data;
};

/**
 * Delete a folder and all files within it
 */
export const deleteFolder = async (folderName: string): Promise<void> => {
  await apiClient.delete(`/files/folders/${encodeURIComponent(folderName)}`);
};
