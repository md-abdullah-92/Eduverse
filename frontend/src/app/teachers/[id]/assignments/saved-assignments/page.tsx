"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import { playfair, lora } from "@/utils/font";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import { useInstructorCourses } from "@/hooks/useInstructorCourses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Assignment = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
};

export default function SavedAssignments() {
  const router = useRouter();
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId") || "12345"
      : "12345";
  const { profile, loading, error } = useTeacherProfile(userId ?? undefined);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  useEffect(() => {
    if (profile?.assignments) {
      setAssignments(profile.assignments);
    }
  }, [profile]);

  const { courses } = useInstructorCourses(userId || "0");

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/assignment/delete/${id}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setAssignments((prev) => prev.filter((a) => a.id !== id));
      } else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.error}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleView = (id: number) => {
    router.push(`/teachers/${userId}/assignments/${id}`);
  };

  const handleSaveToLesson = async () => {
    if (!selectedAssignmentId || !selectedLessonId) return;
    const selectedStudynote = assignments.find(
      (q) => q.id === selectedAssignmentId
    );
    const title = selectedStudynote?.title;
    const description = selectedStudynote?.description;
    if (!title || !description) {
      alert("Please provide a title and content for the Short Question.");
      return;
    }

    if (!userId || userId === "12345") {
      alert("Invalid or missing teacher ID.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/api/assignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          teacherId: userId,
          lessonId: parseInt(selectedLessonId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Server error:", data.error);
        alert(`Error: ${data.error}`);
        return;
      }
      setIsModalOpen(false);
      alert("Short Questions set successfully!");
    } catch (err) {
      console.error("Failed to save assignment:", err);
      alert("Failed to save Short Questions. Please try again.");
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>

      <main className={`flex-1 p-5 ml-20 ${lora.className}`}>
        <h1
          className={`text-3xl font-bold text-teal-800 mb-6 ${playfair.className}`}
        >
          Saved Short Questions
        </h1>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by assignment title..."
            className={`w-full max-w-md border-teal-300 shadow-sm focus:ring-2 focus:ring-teal-300 ${lora.className}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-gray-600">Loading assignments...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load assignments.</p>
        ) : filteredAssignments.length === 0 ? (
          <p className="text-gray-600">No matching assignments found.</p>
        ) : (
          <ScrollArea className="pr-2">
            <div className="space-y-6">
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className={`p-8 border border-purple-200 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 ${lora.className}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h2
                        className={`text-xl font-bold text-teal-800 mb-1 ${playfair.className}`}
                      >
                        {assignment.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Created:{" "}
                        {assignment.createdAt
                          ? new Date(assignment.createdAt).toLocaleString()
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-teal-700 border-teal-300 hover:bg-teal-100"
                          onClick={() => handleView(assignment.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          className="hover:bg-red-700"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                      <Button
                        variant="secondary"
                        className="text-teal-600 border-teal-300 hover:bg-teal-100 mt-1"
                        onClick={() => {
                          setSelectedAssignmentId(assignment.id);
                          setIsModalOpen(true);
                        }}
                      >
                        Save to Lesson
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>

      {/* Modal for selecting course/lesson */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Course and Lesson</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Course</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedCourseId(value);
                  setSelectedLessonId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lesson</Label>
              <Select
                disabled={!selectedCourseId}
                onValueChange={(value) => setSelectedLessonId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  {courses
                    .find((c) => c.id.toString() === selectedCourseId)
                    ?.lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id.toString()}>
                        {lesson.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveToLesson} disabled={!selectedLessonId}>
              Save Short Questions to Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
