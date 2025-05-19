import { Lesson } from "@/utils/types";
import { AlertCircle } from "lucide-react";

interface LessonFormProps {
  initialData: Lesson;
  editingId: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  errors?: Record<string, string>;
}

export default function LessonForm({
  initialData,
  editingId,
  onChange,
  // onVideoChange,
  onSubmit,
  onCancel,
  errors = {},
}: LessonFormProps) {
  // Check if this is an edit or create operation
  const isEditing = Boolean(editingId);

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
          />
          {errors.description && (
            <div className="mt-1 text-red-500 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.description}
            </div>
          )}
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
          />
        </div>

        {/* Lecture Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lecture Notes
          </label>
          <textarea
            name="notes"
            value={initialData.notes}
            onChange={onChange}
            placeholder="Enter lecture notes (optional)"
            className="w-full border border-gray-300 rounded-md p-2 min-h-[120px] resize-y focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Video - Placeholder for future implementation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Video (Coming Soon)
          </label>
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm">
            Video upload functionality will be available in a future update.
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            {isEditing ? "Update" : "Save"} Lesson
          </button>
        </div>
      </form>
    </div>
  );
}
