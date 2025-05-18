"use client";

import { storage } from "@/firebaseConfig";
import axios from "axios";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

// Type definitions
type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface FormState {
  topic: string;
  level: CourseLevel;
  title: string;
  price: string;
  description: string;
}

// Form validation function
const validateForm = (
  form: FormState,
  coverFile: File | null
): string | null => {
  if (!form.title.trim()) return "Course title is required";
  if (!form.description.trim()) return "Course description is required";

  const priceValue = parseFloat(form.price.replace(",", "."));
  if (isNaN(priceValue)) return "Please enter a valid price";

  return null; // Form is valid
};

export default function AddCoursePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  // Form state
  const [formState, setFormState] = useState<FormState>({
    topic: "",
    level: "BEGINNER",
    title: "",
    price: "0.00",
    description: "",
  });

  // UI state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Form handlers
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "price") {
      // Allow only valid price format
      if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
        setFormState((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const uploadCoverImage = async (): Promise<string> => {
    if (!coverFile) return "";

    const storageRef = ref(
      storage,
      `course_covers/${Date.now()}-${coverFile.name}`
    );

    try {
      await uploadBytes(storageRef, coverFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading cover image:", error);
      throw new Error("Failed to upload cover image");
    }
  };

  const resetForm = () => {
    setFormState({
      topic: "",
      level: "BEGINNER",
      title: "",
      price: "0.00",
      description: "",
    });
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleCreateCourse = async () => {
    // Validate form
    const validationError = validateForm(formState, coverFile);
    if (validationError) {
      setMessage({ text: `❌ ${validationError}`, type: "error" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const coverPhotoUrl = await uploadCoverImage();
      const priceValue = parseFloat(formState.price.replace(",", "."));

      const body = {
        title: formState.title,
        description: formState.description,
        price: priceValue,
        coverPhotoUrl,
        level: formState.level,
        instructorId: userId,
      };

      const response = await axios.post(
        "http://localhost:5001/api/courses/create/",
        body
      );

      if (response.status === 201) {
        setMessage({
          text: "✅ Course created successfully!",
          type: "success",
        });
        resetForm();
        router.push(`/teachers/${userId}/all`);
      } else {
        setMessage({
          text: `❌ Failed to create course: ${
            response.data.message || "Unknown error"
          }`,
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Error creating course:", error);

      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err: any) => `❌ ${err.msg}`)
          .join("\n");
        setMessage({ text: errorMessages, type: "error" });
      } else {
        setMessage({
          text: `❌ Error creating course: ${
            error.response?.data?.message || error.message || "Unknown error"
          }`,
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <div className="md:w-1/4 p-8 bg-white border-r border-gray-200">
        <h1 className="text-3xl font-bold text-teal-800 mb-6">
          Create a course
        </h1>
        <p className="text-lg mb-4 text-gray-700">
          Follow the steps to create a course.
        </p>
        <div className="space-y-4">
          {[
            "Select a topic for your course",
            "Select course level",
            "Input Price",
            "Input Title",
            "Write a description",
            "Upload a cover",
            "Write what one will learn from the course",
            "Upload lessons",
            "Deploy course",
          ].map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center mr-3">
                {index + 1}
              </div>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Course Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="topic"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Topic
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={formState.topic}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Language">Language</option>
                    <option value="Arts">Arts</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="level"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Course Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={formState.level}
                    onChange={handleInputChange}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Course Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={formState.title}
                    onChange={handleInputChange}
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price (£)
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={formState.price}
                    onChange={handleInputChange}
                    placeholder="25.00"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
                    value={formState.description}
                    onChange={handleInputChange}
                    placeholder="Describe what students will learn in this course"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="cover-upload"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-upload"
                    onChange={handleCoverChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleCreateCourse}
                    className={`w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-md transition duration-200 flex justify-center items-center ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create Course"
                    )}
                  </button>
                </div>

                {message.text && (
                  <div
                    className={`p-3 rounded-md mt-4 ${
                      message.type === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Course Preview
              </h2>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Cover Image */}
                <div className="w-full h-48 bg-gray-100 relative">
                  {coverPreview ? (
                    <div className="w-full h-full relative">
                      <img
                        src={coverPreview}
                        alt="Course Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>No cover image</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-4">
                  <div className="text-sm font-medium text-teal-700 mb-2">
                    {formState.level || "LEVEL"}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {formState.title || "Course Title"}
                  </h3>
                  <div className="text-sm text-gray-600 mb-1">
                    Your Name Here
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    University Name
                  </div>
                  <div className="text-xs text-gray-400 mb-4">
                    200 followers
                  </div>

                  <div className="text-lg font-bold text-green-600 mb-3">
                    £{parseFloat(formState.price || "0").toFixed(2)}
                  </div>

                  <button
                    disabled
                    className="w-full py-2 px-4 bg-gray-200 text-gray-500 font-medium rounded-md cursor-not-allowed"
                  >
                    Book
                  </button>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>
                  This is a preview of how your course will appear to students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
