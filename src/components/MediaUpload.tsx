import React, { useCallback, useState } from 'react';
import { Upload, X, Image, Video, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface MediaUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  isAnalyzing?: boolean;
  analysisError?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  maxSizePerFile = 50,
  acceptedTypes = ['image/*', 'video/*'],
  className = '',
  isAnalyzing = false,
  analysisError = ''
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxSizePerFile}MB.`;
    }

    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File "${file.name}" is not a supported format.`;
    }

    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const processFileWithProgress = async (file: File, index: number): Promise<MediaFile> => {
    const fileId = `${file.name}_${index}`;

    try {
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Simulate progress for preview generation
      const preview = await createPreview(file);
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      const type = file.type.startsWith('image/') ? 'image' : 'video';

      // Clean up progress tracking
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 1000);

      return { file, preview, type };
    } catch (error) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
      throw error;
    }
  };

  const processFiles = async (files: FileList) => {
    setError('');
    const newFiles: MediaFile[] = [];
    const validFiles: File[] = [];

    if (mediaFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed. You currently have ${mediaFiles.length} files.`);
      return;
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validationError = validateFile(file);

        if (validationError) {
          setError(validationError);
          return;
        }

        const mediaFile = await processFileWithProgress(file, i);
        newFiles.push(mediaFile);
        validFiles.push(file);
      }

      const updatedMediaFiles = [...mediaFiles, ...newFiles];
      setMediaFiles(updatedMediaFiles);
      onFilesChange([...mediaFiles.map(mf => mf.file), ...validFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
      setError('Failed to process some files. Please try again.');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [mediaFiles, processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(updatedFiles);
    onFilesChange(updatedFiles.map(mf => mf.file));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all relative
          ${isDragOver
            ? 'border-austin-blue bg-blue-50'
            : 'border-gray-300 hover:border-austin-blue hover:bg-gray-50'
          }
          ${isAnalyzing ? 'opacity-75 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          id="media-upload"
        />
        
        {isAnalyzing ? (
          <div className="mx-auto h-12 w-12 mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-austin-blue"></div>
          </div>
        ) : (
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        )}
        
        <div className="space-y-2">
          <label
            htmlFor="media-upload"
            className="cursor-pointer text-austin-blue hover:text-austin-teal font-semibold"
          >
            Click to upload
          </label>
          <span className="text-gray-500"> or drag and drop</span>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          {isAnalyzing
            ? 'Analyzing your items with AI...'
            : `Images and videos up to ${maxSizePerFile}MB each (max ${maxFiles} files)`
          }
        </p>

        {/* Austin-specific tips */}
        {!isAnalyzing && mediaFiles.length === 0 && (
          <div className="mt-4 text-xs text-austin-blue bg-austin-blue/10 rounded-lg p-3">
            <p className="font-semibold mb-1">📱 Austin Moving Tips:</p>
            <p>• Show stairs/elevators in apartments</p>
            <p>• Include tight spaces like East Austin doors</p>
            <p>• Capture Hill Country home access</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {(error || analysisError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              {error && <p className="text-red-700">{error}</p>}
              {analysisError && <p className="text-red-700">{analysisError}</p>}
              <p className="text-red-600 mt-1 text-xs">Need help? Call (512) 555-MOVE</p>
            </div>
          </div>
        </div>
      )}

      {/* File Previews */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaFiles.map((mediaFile, index) => {
            const fileId = `${mediaFile.file.name}_${index}`;
            const progress = uploadProgress[fileId];

            return (
            <div key={index} className="relative bg-white border border-gray-200 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Remove file"
                disabled={isAnalyzing}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Progress indicator */}
              {progress !== undefined && progress < 100 && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                  <div className="bg-white rounded-full p-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-austin-blue"></div>
                  </div>
                </div>
              )}

              {mediaFile.type === 'image' ? (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={mediaFile.preview}
                    alt={mediaFile.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <video
                    src={mediaFile.preview}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                </div>
              )}

              <div className="p-3">
                <div className="flex items-center space-x-2 mb-1">
                  {mediaFile.type === 'image' ? (
                    <Image className="h-4 w-4 text-austin-green" />
                  ) : (
                    <Video className="h-4 w-4 text-austin-orange" />
                  )}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {mediaFile.file.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(mediaFile.file.size)}
                  </p>
                  {progress === undefined && (
                    <CheckCircle2 className="h-4 w-4 text-austin-green" />
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Upload Summary */}
      {mediaFiles.length > 0 && (
        <div className="bg-austin-blue/5 border border-austin-blue/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-austin-blue">
              {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''} ready for analysis
            </p>
            {isAnalyzing && (
              <div className="flex items-center text-austin-blue text-xs">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-austin-blue mr-2"></div>
                Processing...
              </div>
            )}
          </div>

          {/* Austin-specific file recommendations */}
          {mediaFiles.length < 3 && !isAnalyzing && (
            <p className="text-xs text-gray-600 mt-2">
              💡 Tip: Add {3 - mediaFiles.length} more photo{3 - mediaFiles.length !== 1 ? 's' : ''} for a more accurate Austin moving quote
            </p>
          )}
        </div>
      )}
    </div>
  );
};