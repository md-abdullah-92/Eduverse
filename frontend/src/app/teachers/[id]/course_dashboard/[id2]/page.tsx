"use client";

import { ChevronDown, ChevronUp, Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CourseDashboard({
  params,
}: {
  params: { id: string; id2: string };
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const router = useRouter();
  const { id, id2 } = params;
  const [description, setDescription] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isOutcomesExpanded, setIsOutcomesExpanded] = useState(false);
  const [outcomes, setOutcomes] = useState(["First Outcome"]);
  const [lessons, setLessons] = useState(["First Lesson"]);

  const addOutcome = () => {
    setOutcomes([...outcomes, ""]);
  };

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const addLesson = () => {
    router.push(`/teachers/${id}/course_dashboard/${id2}/lesson`);
  };

  const updateLesson = (index: number, value: string) => {
    const newLessons = [...lessons];
    newLessons[index] = value;
    setLessons(newLessons);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 bg-white text-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-800 text-center mb-8">
        Course Dashboard
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section */}
        <div className="flex-1">
          {/* Title */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Price */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Price
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Description */}
          <div className="mb-5 border border-gray-200 rounded-md">
            <div
              className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <h3 className="font-semibold text-gray-800">
                Course Description
              </h3>
              {isDescriptionExpanded ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>

            {isDescriptionExpanded && (
              <div className="p-4 pt-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write course description..."
                  className="w-full border border-gray-300 rounded-md p-2 min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Outcomes */}
          <div className="mb-5 border border-gray-200 rounded-md">
            <div
              className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
              onClick={() => setIsOutcomesExpanded(!isOutcomesExpanded)}
            >
              <h3 className="font-semibold text-gray-800">
                What will users learn?
              </h3>
              {isOutcomesExpanded ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>

            {isOutcomesExpanded && (
              <div className="p-4 pt-2">
                {outcomes.map((outcome, index) => (
                  <div key={index} className="mb-3">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => updateOutcome(index, e.target.value)}
                      placeholder={`Outcome ${index + 1}`}
                      className="w-full bg-blue-50 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                ))}
                <button
                  onClick={addOutcome}
                  className="flex items-center text-sm text-teal-700 mt-2 hover:underline"
                >
                  <Plus size={16} className="mr-1" />
                  Add Outcome
                </button>
              </div>
            )}
          </div>

          {/* Upload Photo */}
          <div className="mt-6">
            <button className="bg-teal-700 hover:bg-teal-800 text-white w-full py-3 rounded-md flex items-center justify-center transition-all">
              <Upload size={18} className="mr-2" />
              Upload/Change Cover Photo
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-80 border border-gray-200 rounded-md">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Upload Lessons</h3>
            <Plus
              size={20}
              onClick={addLesson}
              className="cursor-pointer text-teal-700"
            />
          </div>

          <div className="p-4">
            {lessons.map((lesson, index) => (
              <div key={index} className="mb-3">
                <input
                  type="text"
                  value={lesson}
                  onChange={(e) => updateLesson(index, e.target.value)}
                  placeholder={`Lesson ${index + 1}`}
                  className="w-full bg-blue-50 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Finish Button */}
      <div className="flex justify-end mt-10">
        <button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-8 rounded-md transition-all">
          Finish
        </button>
      </div>
    </div>
  );
}
