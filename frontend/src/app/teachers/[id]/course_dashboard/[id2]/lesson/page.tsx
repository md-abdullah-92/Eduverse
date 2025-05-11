"use client";

import { useState } from "react";

export default function LessonUpload({
  params,
}: {
  params: { id: string; id2: string; id3: string };
}) {
  const instructorId = params.id;
  const courseId = params.id2;
  const lessonId = params.id3;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lectureNote: "",
    video: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (e.g., upload to server)
    console.log("Form submitted:", formData);
    // Add your API call here
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-teal-700 mb-6">Lesson Upload</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Lecture Video
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-teal-50 file:text-teal-700
              hover:file:bg-teal-100"
          />
        </div>

        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lecture note
          </label>
          <textarea
            name="lectureNote"
            value={formData.lectureNote}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <button
          type="submit"
          className="bg-teal-700 hover:bg-teal-800 text-white w-full py-3 rounded-md flex items-center justify-center transition-all"
        >
          Finish
        </button>
      </form>
    </div>
  );
}
