import { useToast } from "@/components/ui/toast";
import { LessonForm as LessonFormData } from "@/utils/types";
import { Video, X } from "lucide-react";

interface LessonFormProps {
  initialData: LessonFormData;
  editingId: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function LessonForm({
  initialData,
  editingId,
  onChange,
  onVideoChange,
  onSubmit,
  onCancel,
}: LessonFormProps) {
  const { showToast } = useToast();

  // Generate a video preview URL if videoUrl exists in initialData
  const videoPreview = initialData.videoUrl;

  // Check if this is an edit or create operation
  const isEditing = Boolean(editingId);

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Title
          </label>
          <input
            type="text"
            name="title"
            value={initialData.title}
            onChange={onChange}
            placeholder="Enter lesson title"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={initialData.description}
            onChange={onChange}
            placeholder="Enter lesson description"
            className="w-full border border-gray-300 rounded-md p-2 min-h-[120px] resize-y focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Lecture Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lecture Note
          </label>
          <textarea
            name="lectureNote"
            value={initialData.lectureNote}
            onChange={onChange}
            placeholder="Enter lecture note"
            className="w-full border border-gray-300 rounded-md p-2 min-h-[120px] resize-y focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Video
          </label>
          <div className="flex items-center gap-4">
            {videoPreview && (
              <div className="relative w-32 h-32">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    // Create and trigger a synthetic event to clear the video
                    const fakeEvent = {
                      target: {
                        files: [],
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onVideoChange(fakeEvent);
                    showToast("Video removed", "info");
                  }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="video/*"
              onChange={onVideoChange}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="flex items-center gap-2 border border-gray-300 rounded-md p-2 hover:bg-gray-50 cursor-pointer"
            >
              <Video size={16} />
              <span>{videoPreview ? "Change Video" : "Upload Video"}</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
          >
            {isEditing ? "Update" : "Save"} Lesson
          </button>
        </div>
      </form>
    </div>
  );
}
