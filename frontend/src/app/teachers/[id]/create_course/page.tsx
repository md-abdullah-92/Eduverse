/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ChatWidget from "@/app/lesson/ChatWidget";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { useToast } from "@/components/ui_elements/toast";
import { CourseUtils } from "@/utils/courseUtils";
import { playfair, poppins } from "@/utils/font";
import { CourseFormData } from "@/utils/types";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function AddCoursePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  const courseUtils = new CourseUtils({ userId });
  const { showToast } = useToast();

  // Form state
  const [formState, setFormState] = useState<CourseFormData>({
    topic: "",
    level: "BEGINNER",
    title: "",
    price: "0", // Use string format
    description: "",
    coverPhotoUrl: "https://via.placeholder.com/150",
    instructorId: userId,
    averageRating: 0,
  });

  // UI state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form handlers
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "price") {
      // Allow only valid price format
      if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
        // Format the price with 2 decimal places
        const formattedPrice = value.replace(",", ".");
        setFormState((prev) => ({
          ...prev,
          price: formattedPrice,
        }));
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

  const resetForm = () => {
    setFormState({
      topic: "",
      level: "BEGINNER",
      title: "",
      price: "0",
      description: "",
      coverPhotoUrl: coverPreview || "https://via.placeholder.com/150",
      instructorId: userId,
      averageRating: 0,
    });
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleCreateCourse = async () => {
    // Validate form
    const validationError = CourseUtils.validateCourseForm(formState);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    try {
      setLoading(true);

      const coverPhotoUrl = await courseUtils.uploadCoverImage(coverFile);

      // Format data according to CourseData interface
      const courseData: CourseFormData = {
        topic: formState.topic,
        level: formState.level,
        title: formState.title,
        price: formState.price, // Convert to float
        description: formState.description,
        coverPhotoUrl: coverPhotoUrl || "https://via.placeholder.com/150",
        instructorId: userId,
        averageRating: 0,
      };

      await courseUtils.createCourse(courseData);
      showToast("Course created successfully!", "success");
      resetForm();
      router.push(`/teachers/${userId}/all`);
    } catch (error: any) {
      console.error("Error creating course:", error);

      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err: any) => err.msg)
          .join("\n");
        showToast(errorMessages, "error");
      } else {
        showToast(
          error.response?.data?.message || error.message || "Unknown error",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator text="Creating course..." />;
  }

  return (
    <div
      className={`flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 ${poppins.className}`}
    >
      <Sidebar role="TEACHER" userId={userId} />

      <main className="flex-1 ml-72 p-6 lg:p-8 relative z-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="text-center mb-2">
            <div>
              <h1
                className={`text-4xl md:text-5xl font-medium mb-4 ${playfair.className}`}
              >
                Create New Course
              </h1>
              <p className={`text-gray-600 text-lg ${poppins.className}`}>
                Share your knowledge and create engaging learning experiences
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Form Section */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <h2
                  className={`text-xl lg:text-2xl font-semibold mb-4 ${playfair.className}`}
                >
                  Course Details
                </h2>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="topic"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Topic
                    </label>
                    <div className="relative">
                      <select
                        id="topic"
                        name="topic"
                        className="w-full p-3 lg:p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white/70 backdrop-blur-sm appearance-none cursor-pointer text-sm lg:text-base"
                        value={formState.topic}
                        onChange={handleInputChange}
                      >
                        <option value="">Choose a topic</option>
                        <option value="Math">📐 Math</option>
                        <option value="Science">🔬 Science</option>
                        <option value="History">📚 History</option>
                        <option value="Language">🌍 Language</option>
                        <option value="Arts">🎨 Arts</option>
                        <option value="Technology">💻 Technology</option>
                        <option value="Islamic">☪️ Islamic</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="level"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Course Level
                    </label>
                    <div className="relative">
                      <select
                        id="level"
                        name="level"
                        className="w-full p-3 lg:p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white/70 backdrop-blur-sm appearance-none cursor-pointer text-sm lg:text-base"
                        value={formState.level}
                        onChange={handleInputChange}
                      >
                        <option value="BEGINNER">🌱 Beginner</option>
                        <option value="INTERMEDIATE">🚀 Intermediate</option>
                        <option value="ADVANCED">⭐ Advanced</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Course Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full p-3 lg:p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-sm lg:text-base"
                    value={formState.title}
                    onChange={handleInputChange}
                    placeholder="Enter an engaging course title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="price"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Price (৳)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">৳</span>
                    </div>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      className="w-full p-3 lg:p-4 pl-10 lg:pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-gray-400 text-sm lg:text-base"
                      value={formState.price || "0"}
                      onChange={handleInputChange}
                      placeholder="25.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="w-full p-3 lg:p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white/70 backdrop-blur-sm resize-y placeholder-gray-400 text-sm lg:text-base"
                    value={formState.description}
                    onChange={handleInputChange}
                    placeholder="Describe what students will learn and achieve in this course..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="cover-upload"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Cover Image
                  </label>
                  <div className="relative">
                    <label
                      htmlFor="cover-upload"
                      className="flex items-center justify-center w-full p-4 lg:p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group"
                    >
                      <div className="flex flex-col items-center space-y-2 lg:space-y-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <svg
                            className="w-5 h-5 lg:w-6 lg:h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm lg:text-lg font-medium text-gray-700 group-hover:text-teal-600">
                            {coverFile ? coverFile.name : "Upload cover image"}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        id="cover-upload"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 lg:pt-6">
                  <button
                    type="button"
                    onClick={handleCreateCourse}
                    className={`w-full py-3 lg:py-4 px-4 lg:px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 flex justify-center items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base ${
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
                        Creating Course...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Create Course
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-white/50">
              <div className="flex items-center space-x-3 mb-6">
                <h2
                  className={`text-xl lg:text-2xl font-bold text-gray-800 ${playfair.className}`}
                >
                  Course Preview
                </h2>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                {/* Cover Image */}
                <div className="w-full h-48 bg-gray-100 relative">
                  {coverPreview ? (
                    <div className="w-full h-full relative">
                      <img
                        src={coverPreview}
                        alt="Course Cover"
                        className="w-full h-full object-cover"
                      />
                      {formState.topic && (
                        <div className="absolute top-3 right-3 bg-white py-1 px-2 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                          {formState.topic}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>No cover image</span>
                      </div>
                      {formState.topic && (
                        <div className="absolute top-3 right-3 bg-white py-1 px-2 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                          {formState.topic}
                        </div>
                      )}
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
                  <div className="text-sm text-gray-600 mb-3">
                    {formState.description ||
                      "Course description will appear here..."}
                  </div>

                  <div className="text-lg font-bold text-green-600 mb-3">
                    ৳{formState.price || "0"}
                  </div>

                  <button
                    disabled
                    className="w-full py-2 px-4 bg-teal-700 text-white font-medium rounded-md cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Chat Widget */}
              <div className="mb-6">
                <ChatWidget userId={userId} />
              </div>

              {/* Preview Info */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-teal-800">
                      Preview Mode
                    </p>
                    <p className="text-xs text-teal-600 mt-1">
                      This is how your course will appear to students in the
                      marketplace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
