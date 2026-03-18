import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  File as FileIcon,
  Image as ImageIcon,
  FileText,
  Download,
  Trash2,
  X,
  Search,
  FolderOpen,
  Tag,
  Eye,
  Plus,
  Filter,
  FolderPlus,
} from 'lucide-react';
import { FileItem } from '../../types/file';
import {
  uploadFile,
  uploadMultipleFiles,
  getFiles,
  deleteFile,
  updateFile,
  getCategories,
  getFolders,
  deleteFolder,
} from '../../services/fileService';
import { toast } from 'react-toastify';

export const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New file upload form
  const [newCategory, setNewCategory] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Create folder modal
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [createFolderName, setCreateFolderName] = useState('');

  useEffect(() => {
    loadFiles();
    loadFilters();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [files, searchTerm, selectedCategory, selectedFolder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await getFiles();
      setFiles(data);
    } catch (error) {
      toast.error('Failed to load files');
      console.error('File loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [cats, dirs] = await Promise.all([getCategories(), getFolders()]);
      setCategories(cats);
      setFolders(dirs);
    } catch (error) {
      console.error('Failed to load filters', error);
      // Don't show error toast for filter loading as files might still work
    }
  };

  const filterFiles = () => {
    let result = [...files];

    // Filter out folder marker files completely - they should never be visible
    result = result.filter((file) => file.original_filename !== '.folder_marker');

    if (searchTerm) {
      result = result.filter((file) =>
        file.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter((file) => file.category === selectedCategory);
    }

    if (selectedFolder) {
      // If a folder is selected, show only files in that folder (excluding folder markers)
      result = result.filter((file) => file.folder === selectedFolder);
    } else {
      // If no folder is selected (root level), show only files that are NOT in any folder
      result = result.filter((file) => !file.folder || file.folder === null || file.folder === '');
    }

    setFilteredFiles(result);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      toast.error('Maximum 10 files can be uploaded at once');
      return;
    }

    const invalidFile = files.find((file) => file.size > 50 * 1024 * 1024);
    if (invalidFile) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFiles(files);
    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);

      if (selectedFiles.length === 1) {
        await uploadFile(selectedFiles[0], newCategory, selectedFolder, newDescription);
        toast.success('File uploaded successfully');
      } else {
        await uploadMultipleFiles(selectedFiles, newCategory, selectedFolder);
        toast.success(`${selectedFiles.length} files uploaded successfully`);
      }

      // Reset form
      setSelectedFiles([]);
      setNewCategory('');
      setNewDescription('');
      setShowUploadModal(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Reload files and filters
      await loadFiles();
      await loadFilters();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload files');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: number, filename: string) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      await deleteFile(fileId);
      toast.success('File deleted successfully');
      // Reload both files and folders to ensure UI stays in sync
      await Promise.all([loadFiles(), loadFilters()]);
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('Cannot delete folder marker files. Use folder deletion instead.');
      } else {
        toast.error('Failed to delete file');
      }
      console.error(error);
    }
  };

  const handleDownload = (file: FileItem) => {
    // Modify the Cloudinary URL to force download using fl_attachment
    let downloadUrl = file.cloudinary_url;

    // Check if it's a Cloudinary URL and add fl_attachment parameter
    if (downloadUrl.includes('cloudinary.com')) {
      // For raw files (non-image), use fl_attachment
      if (downloadUrl.includes('/raw/upload/')) {
        downloadUrl = downloadUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
      }
      // For images, use fl_attachment as well
      else if (downloadUrl.includes('/image/upload/')) {
        downloadUrl = downloadUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
      }
      // For videos
      else if (downloadUrl.includes('/video/upload/')) {
        downloadUrl = downloadUrl.replace('/video/upload/', '/video/upload/fl_attachment/');
      }
    }

    // Open the modified URL which will trigger download
    window.open(downloadUrl, '_blank');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-6 h-6" />;
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6" />;
    return <FileIcon className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedFolder('');
  };

  const handleDeleteFolder = async (folderName: string) => {
    if (!window.confirm(`Are you sure you want to delete the folder "${folderName}" and ALL files within it? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteFolder(folderName);
      toast.success(`Folder "${folderName}" and all its files have been deleted successfully`);
      await loadFiles();
      await loadFilters();
      // If we were viewing the deleted folder, go back to all files
      if (selectedFolder === folderName) {
        setSelectedFolder('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete folder');
      console.error(error);
    }
  };

  const handleCreateFolder = async () => {
    if (!createFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      // Create a placeholder file to establish the folder
      // This creates a small text file that acts as a folder marker
      const folderContent = `This is a folder marker file for the "${createFolderName.trim()}" folder.\nCreated on ${new Date().toISOString()}`;
      const folderMarker = new File([folderContent], '.folder_marker', { type: 'text/plain' });

      await uploadFile(folderMarker, '', createFolderName.trim(), `Folder: ${createFolderName.trim()}`);

      toast.success(`Folder "${createFolderName.trim()}" created successfully!`);
      setCreateFolderName('');
      setShowCreateFolderModal(false);

      // Reload files and filters
      await loadFiles();
      await loadFilters();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create folder');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">File Manager</h1>
        <p className="text-gray-600 dark:text-stone-400">
          Upload, organize, and manage your files
        </p>
      </div>

      {/* Upload Button & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Files</span>
          </button>
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FolderPlus className="w-5 h-5" />
            <span>Create Folder</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-surface dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-stone-400">Filters:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-lg dark:bg-dark-surface dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-lg dark:bg-dark-surface dark:text-white"
          >
            <option value="">All Folders</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>

          {(searchTerm || selectedCategory || selectedFolder) && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto text-sm text-gray-600 dark:text-stone-400">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {selectedFolder && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <button
            onClick={() => setSelectedFolder('')}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
          >
            All Files
          </button>
          {selectedFolder.split('/').map((segment, index, array) => (
            <React.Fragment key={index}>
              <span className="text-gray-400">/</span>
              {index === array.length - 1 ? (
                <span className="text-gray-900 dark:text-white font-medium">{segment}</span>
              ) : (
                <button
                  onClick={() => setSelectedFolder(array.slice(0, index + 1).join('/'))}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
                >
                  {segment}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Files Grid */}
      <div>
        {/* Folders Section - Always show if folders exist and not inside a folder */}
        {!selectedFolder && folders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Folders ({folders.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {folders.map((folder) => (
                <div
                  key={folder}
                  className="relative group flex flex-col items-center p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                >
                  <div
                    onClick={() => setSelectedFolder(folder)}
                    className="flex flex-col items-center cursor-pointer flex-1 w-full"
                  >
                    <FolderOpen className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center truncate w-full" title={folder}>
                      {folder.split('/').pop() || folder}
                    </span>
                    {folder.includes('/') && (
                      <span className="text-xs text-gray-500 dark:text-stone-400 truncate w-full text-center">
                        {folder.split('/').slice(0, -1).join('/')}
                      </span>
                    )}
                  </div>
                  {/* Delete button - shows on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete folder"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredFiles.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-dark-surface rounded-lg">
            <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-stone-400 mb-2">No files found</p>
            <p className="text-sm text-gray-500 dark:text-stone-500">
              {searchTerm || selectedCategory || selectedFolder
                ? 'Try adjusting your filters'
                : 'Upload your first file to get started'}
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileIcon className="w-5 h-5" />
              Files {selectedFolder && `in "${selectedFolder}"`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {/* File Icon/Preview */}
              <div className="flex items-center justify-center h-32 mb-3 bg-gray-50 dark:bg-gray-800 rounded">
                {file.file_type.startsWith('image/') ? (
                  <img
                    src={file.cloudinary_url}
                    alt={file.original_filename}
                    className="h-full w-full object-contain rounded"
                  />
                ) : (
                  <div className="text-gray-400">{getFileIcon(file.file_type)}</div>
                )}
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <h3
                  className="font-semibold text-gray-900 dark:text-white truncate"
                  title={file.original_filename}
                >
                  {file.original_filename}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-stone-400">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(file.created_at)}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {file.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                      <Tag className="w-3 h-3" />
                      {file.category}
                    </span>
                  )}
                  {file.folder && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                      <FolderOpen className="w-3 h-3" />
                      {file.folder}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.original_filename)}
                    className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Files</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                  setNewCategory('');
                  setNewDescription('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-stone-400 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-stone-400 mb-2">
                  {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
                  {selectedFolder && (
                    <span className="ml-2 text-primary-600 dark:text-primary-400">
                      → Will upload to "{selectedFolder}" folder
                    </span>
                  )}
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-700 dark:text-stone-300 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded"
                    >
                      {file.name} ({formatFileSize(file.size)})
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">
                  Category (optional)
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., documents, images, invoices"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg dark:bg-dark-surface dark:text-white"
                />
              </div>

              {selectedFiles.length === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg dark:bg-dark-surface dark:text-white"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                    setNewCategory('');
                    setNewDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-stone-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {previewFile.original_filename}
              </h2>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-stone-400 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview Content */}
              {previewFile.file_type.startsWith('image/') ? (
                <img
                  src={previewFile.cloudinary_url}
                  alt={previewFile.original_filename}
                  className="w-full rounded-lg"
                />
              ) : previewFile.file_type === 'application/pdf' ? (
                <iframe
                  src={previewFile.cloudinary_url}
                  className="w-full h-[600px] rounded-lg"
                  title={previewFile.original_filename}
                />
              ) : (
                <div className="text-center py-12">
                  <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-stone-400">
                    Preview not available for this file type
                  </p>
                </div>
              )}

              {/* File Details */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-stone-400">
                    File Size:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatFileSize(previewFile.file_size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-stone-400">
                    Type:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {previewFile.file_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-stone-400">
                    Uploaded:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDate(previewFile.created_at)}
                  </span>
                </div>
                {previewFile.category && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-stone-400">
                      Category:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {previewFile.category}
                    </span>
                  </div>
                )}
                {previewFile.folder && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-stone-400">
                      Folder:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {previewFile.folder}
                    </span>
                  </div>
                )}
                {previewFile.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-stone-400 block mb-1">
                      Description:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {previewFile.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    handleDelete(previewFile.id, previewFile.original_filename);
                    setPreviewFile(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Folder</h2>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setCreateFolderName('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-stone-400 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={createFolderName}
                  onChange={(e) => setCreateFolderName(e.target.value)}
                  placeholder="Enter folder name (e.g., 'Documents', '2024/Projects')"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg dark:bg-dark-surface dark:text-white focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder();
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-stone-400 mt-1">
                  Use "/" to create nested folders (e.g., "Projects/2024")
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCreateFolderModal(false);
                    setCreateFolderName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-stone-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!createFolderName.trim()}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Create Folder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
