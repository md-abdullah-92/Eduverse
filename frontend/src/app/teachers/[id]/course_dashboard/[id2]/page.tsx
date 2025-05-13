"use client";

import { ChevronDown, ChevronUp, Plus, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CourseDashboard() {
  const params = useParams();
  const instructorId = params.id as string;
  const courseId = params.id2 as string;

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [outcomes, setOutcomes] = useState([""]);
  const [lessons, setLessons] = useState([""]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isOutcomesExpanded, setIsOutcomesExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:5001/api/courses/get/${courseId}`
        );
        if (!response.ok) throw new Error("❌ Failed to fetch course details.");

        const courseData = await response.json();

        setTitle(courseData.title || "");
        setPrice(
          typeof courseData.price === "number"
            ? courseData.price.toFixed(2)
            : "0.00"
        );
        setCoverPhotoUrl(courseData.coverPhotoUrl || "");
        setLevel(courseData.level || "");
        setDescription(courseData.description || "");

        if (Array.isArray(courseData.outcomes))
          setOutcomes(courseData.outcomes);
        if (Array.isArray(courseData.lessons)) setLessons(courseData.lessons);
      } catch (err: unknown) {
        console.error("Error fetching course details:", err);
        setError(
          err instanceof Error ? `❌ ${err.message}` : `❌ ${String(err)}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const addOutcome = () => setOutcomes([...outcomes, ""]);

  const updateOutcome = (index: number, value: string) => {
    const updated = [...outcomes];
    updated[index] = value;
    setOutcomes(updated);
  };

  const addLesson = () => {
    router.push(
      `/teachers/${instructorId}/course_dashboard/${courseId}/lesson`
    );
  };

  const handleFinish = async () => {
    try {
      const parsedPrice = parseFloat(price.replace(",", "."));
      if (isNaN(parsedPrice)) {
        alert("❌ Please enter a valid price.");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/courses/update/${courseId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            price: parsedPrice,
            description,
            coverPhotoUrl,
            level,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update course");
      }

      alert("✅ Course updated successfully!");
      router.push(`/teachers/${instructorId}/all`);
    } catch (err: unknown) {
      console.error("Error updating course:", err);
      alert(err instanceof Error ? `❌ ${err.message}` : `❌ ${String(err)}`);
    }
  };

  if (isLoading) return <div>Loading course details...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 bg-white text-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-800 text-center mb-8">
        Course Dashboard
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left */}
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
              className="w-full border border-gray-300 rounded-md p-2"
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
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Description */}
          <div className="mb-5 border border-gray-200 rounded-md">
            <div
              className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <h3 className="font-semibold">Course Description</h3>
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
                  className="w-full border border-gray-300 rounded-md p-2 min-h-[120px] resize-y"
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
              <h3 className="font-semibold">What will users learn?</h3>
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
                      className="w-full bg-blue-50 border border-gray-300 rounded-md p-2"
                    />
                  </div>
                ))}
                <button
                  onClick={addOutcome}
                  className="flex items-center text-sm text-teal-700 mt-2 hover:underline"
                >
                  <Plus size={16} className="mr-1" /> Add Outcome
                </button>
              </div>
            )}
          </div>

          {/* Upload Photo Button */}
          <div className="mt-6">
            <button className="bg-teal-700 hover:bg-teal-800 text-white w-full py-3 rounded-md flex items-center justify-center">
              <Upload size={18} className="mr-2" />
              Upload/Change Cover Photo
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="w-full lg:w-80 border border-gray-200 rounded-md">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Upload Lessons</h3>
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
                  onChange={(e) => {
                    const updated = [...lessons];
                    updated[index] = e.target.value;
                    setLessons(updated);
                  }}
                  placeholder={`Lesson ${index + 1}`}
                  className="w-full bg-blue-50 border border-gray-300 rounded-md p-2"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Finish */}
      <div className="flex justify-end mt-10">
        <button
          onClick={handleFinish}
          className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-8 rounded-md"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
