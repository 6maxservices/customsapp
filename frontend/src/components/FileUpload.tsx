import { useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import { commonText } from '../lib/translations';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
}

export default function FileUpload({
  onUpload,
  disabled = false,
  accept,
  maxSize,
  label = commonText.uploadFile,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Check file size if maxSize is provided
    if (maxSize && file.size > maxSize) {
      setError(`${commonText.fileSizeExceeds} ${formatFileSize(maxSize)}`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      // Reset input
      const input = document.getElementById('file-upload-input') as HTMLInputElement;
      if (input) input.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || commonText.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
    const input = document.getElementById('file-upload-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor="file-upload-input"
        className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          disabled || uploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <Upload className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <input
          id="file-upload-input"
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          accept={accept}
        />
      </label>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading || disabled}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? commonText.uploading : commonText.upload}
            </button>
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

