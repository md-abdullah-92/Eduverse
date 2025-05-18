import {
  CheckCircle,
  ImageIcon,
  ListChecks,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import { CourseFormData } from "@/utils/types";

interface CourseFormProps {
  courseData: CourseFormData;
  onUpdate: <K extends keyof CourseFormData>(
    field: K,
    value: CourseFormData[K]
  ) => void;
  onAddOutcome: () => void;
  onRemoveOutcome: (index: number) => void;
  onUpdateOutcome: (index: number, value: string) => void;
  onCoverChange: (file: File | null) => void;
  coverPreview?: string | null;
}

export default function CourseForm({
  courseData,
  onUpdate,
  onAddOutcome,
  onRemoveOutcome,
  onUpdateOutcome,
  onCoverChange,
  coverPreview,
}: CourseFormProps) {
  // Handle cover image change
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onCoverChange(file);
  };

  return (
    <div className="p-5">
      {/* Cover Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image
        </label>
        <div className="mt-1 flex flex-col items-center">
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Cover Preview"
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 mb-3">
              <ImageIcon size={36} className="mb-2" />
              <p className="text-sm">No cover image selected</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            id="cover-upload"
            onChange={handleCoverChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById("cover-upload")?.click()}
            className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-md flex items-center"
          >
            <Upload size={16} className="mr-2" />
            {coverPreview ? "Change Cover Image" : "Upload Cover Image"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Title
          </label>
          <input
            type="text"
            value={courseData.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="Enter course title"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Price
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              value={courseData.price}
              onChange={(e) => onUpdate("price", e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-md pl-7 p-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course Level
        </label>
        <select
          value={courseData.level}
          onChange={(e) => onUpdate("level", e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">Select a level</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course Description
        </label>
        <textarea
          value={courseData.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Write course description..."
          className="w-full border border-gray-300 rounded-md p-2 min-h-[120px] resize-y focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      {/* Learning Outcomes Section */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Learning Outcomes
          </h2>
          <button
            type="button"
            onClick={onAddOutcome}
            className="flex items-center text-sm text-teal-700 hover:text-teal-900"
          >
            <Plus size={16} className="mr-1" /> Add Outcome
          </button>
        </div>

        <div className="p-5">
          {courseData.outcomes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ListChecks size={24} className="mx-auto mb-2" />
              <p>Add what students will learn from this course</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courseData.outcomes.map((outcome, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0 mr-2 text-teal-600">
                    <CheckCircle size={18} />
                  </div>
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => onUpdateOutcome(index, e.target.value)}
                    placeholder={`Learning outcome ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md p-2 bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveOutcome(index)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                    aria-label="Remove outcome"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
