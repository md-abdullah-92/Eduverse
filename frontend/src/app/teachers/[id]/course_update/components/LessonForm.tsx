import { Lesson } from "@/utils/types";
import { AlertCircle, Play, Upload, X } from "lucide-react";
import { useRef } from "react";


interface VideoState {
  selectedFile: File | null;
  error: string | null;
  isDragActive: boolean;
  isUploading: boolean;
  uploadProgress: number;
}

interface LessonFormProps {
  initialData: Lesson;
  editingId: string | null;
  courseId: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  errors?: Record<string, string>;

  videoState: VideoState;
  onVideoFileSelect: (file: File) => void;
  onVideoDragEvents: (e: React.DragEvent<HTMLDivElement>) => void;
  onVideoDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onVideoRemove: () => void;
}

export default function LessonForm({
  initialData,
  editingId,
  onChange,
  onSubmit,
  onCancel,
  errors = {},
  videoState,
  onVideoFileSelect,
  onVideoDragEvents,
  onVideoDrop,
  onVideoRemove,
}: LessonFormProps) {
  const isEditing = Boolean(editingId);
  const fileInputRef = useRef<HTMLInputElement>(null);

 
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const hasExistingVideo = Boolean(
    initialData.videoUrl && !videoState.selectedFile
  );
  const hasSelectedFile = Boolean(videoState.selectedFile);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoFileSelect(file);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={initialData.title}
            onChange={onChange}
            placeholder="Enter lesson title"
            className={`w-full border ${
              errors.title ? "border-red-500" : "border-gray-300"
            } rounded-md p-2 focus:ring-teal-500 focus:border-teal-500`}
            disabled={videoState.isUploading}
          />
          {errors.title && (
            <div className="mt-1 text-red-500 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.title}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={initialData.description}
            onChange={onChange}
            placeholder="Enter lesson description"
            className={`w-full border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } rounded-md p-2 min-h-[120px] resize-y focus:ring-teal-500 focus:border-teal-500`}
            disabled={videoState.isUploading}
          />
          {errors.description && (
            <div className="mt-1 text-red-500 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.description}
            </div>
          )}
        </div>

      

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Video
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={videoState.isUploading}
          />

          {/* Existing Video Display */}
          {hasExistingVideo && (
            <div className="border border-green-300 bg-green-50 rounded-md p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                      <Play size={16} className="text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Video uploaded
                    </p>
                    <p className="text-xs text-green-700">
                      Current lesson video is ready
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  disabled={videoState.isUploading}
                >
                  Replace
                </button>
              </div>
            </div>
          )}

          {/* Upload Area - Show when no video exists */}
          {!hasExistingVideo && !hasSelectedFile && (
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                videoState.isDragActive
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-300 hover:border-teal-400"
              }`}
              onClick={() =>
                !videoState.isUploading && fileInputRef.current?.click()
              }
              onDragEnter={onVideoDragEvents}
              onDragLeave={onVideoDragEvents}
              onDragOver={onVideoDragEvents}
              onDrop={onVideoDrop}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {videoState.isUploading
                  ? "Uploading..."
                  : "Click to select or drag and drop a video file"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                MP4, WebM, OGG, AVI, MOV (max 500MB)
              </p>
            </div>
          )}

          {/* Selected File Display */}
          {hasSelectedFile && videoState.selectedFile && (
            <div className="border border-gray-300 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-teal-100 rounded-md flex items-center justify-center">
                      <Upload size={16} className="text-teal-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {videoState.selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(videoState.selectedFile.size)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Will be uploaded when lesson is saved
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onVideoRemove}
                  className="p-1 text-gray-400 hover:text-red-500"
                  disabled={videoState.isUploading}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Upload Progress - Only show during upload */}
              {videoState.isUploading && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${videoState.uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    Uploading... {Math.round(videoState.uploadProgress)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {videoState.error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle size={16} className="text-red-500 mr-2" />
                <p className="text-sm text-red-600">{videoState.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={videoState.isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 ${
              videoState.isUploading
                ? "bg-teal-400"
                : "bg-teal-600 hover:bg-teal-700"
            } text-white rounded-md`}
            disabled={videoState.isUploading}
          >
            {videoState.isUploading
              ? "Uploading..."
              : isEditing
              ? "Update"
              : "Save"}{" "}
            Lesson
          </button>
        </div>
      </form>
    </div>
  );
}
