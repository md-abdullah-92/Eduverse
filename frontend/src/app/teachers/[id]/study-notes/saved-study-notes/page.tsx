"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import Sidebar from "@/app/teachers/components/Sidebar";
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

type Studynote = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
};

export default function SavedStudyNotes() {
  const router = useRouter();
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") || "12345" : "12345";
  const { profile, loading, error } = useTeacherProfile(userId ?? undefined);

  const [notes, setNotes] = useState<Studynote[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [viewingNoteId, setViewingNoteId] = useState<number | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  useEffect(() => {
    if (profile?.studyNotes) setNotes(profile.studyNotes);
  }, [profile]);

  const { courses } = useInstructorCourses(userId || "0");

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this study note?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/studynote/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== id));
      else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.error}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleView = (id: number) => {
    setViewingNoteId(id);
    setTimeout(() => {
      router.push(`/teachers/${userId}/study-notes/${id}`);
    }, 500); // Optional simulated delay
  };

  const handleSaveToLesson = async () => {
    if (!selectedNoteId || !selectedLessonId) return;

    const selectedStudynote = notes.find((q) => q.id === selectedNoteId);
    const title = selectedStudynote?.title;
    const description = selectedStudynote?.description;
    if (!title || !description) {
      alert("Please provide a title and content for the Study Note.");
      return;
    }

    if (!userId || userId === "12345") {
      alert("Invalid or missing teacher ID.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/api/studynote`, {
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
      alert("Study Note saved successfully!");
    } catch (err) {
      console.error("Failed to save assignment:", err);
      alert("Failed to save assignment. Please try again.");
    }
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative ${lora.className}`}
    >
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>

      <main className="flex-1 p-5 ml-20">
        <h1 className={`text-3xl font-bold text-teal-800 mb-6 ${playfair.className}`}>
          Saved Study Notes
        </h1>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by title"
            className={`w-full max-w-md border-teal-300 shadow-sm focus:ring-2 focus:ring-teal-300 ${lora.className}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-gray-600">Loading study notes...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load study notes.</p>
        ) : filteredNotes.length === 0 ? (
          <p className="text-gray-600">No matching notes found.</p>
        ) : (
          <ScrollArea className="pr-2">
            <div className="space-y-6">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`p-8 border border-teal-200 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 ${lora.className}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h2 className={`text-xl font-bold text-teal-800 mb-1 ${playfair.className}`}>
                        {note.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-teal-700 border-teal-300 hover:bg-teal-100"
                          onClick={() => handleView(note.id)}
                          disabled={viewingNoteId === note.id}
                        >
                          {viewingNoteId === note.id ? (
                            <span className="flex items-center gap-1">
                              <svg
                                className="animate-spin h-4 w-4 text-teal-700"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                />
                              </svg>
                              Loading...
                            </span>
                          ) : (
                            "View"
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          className="hover:bg-red-700"
                          onClick={() => handleDelete(note.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                      <Button
                        variant="secondary"
                        className="text-teal-600 border-teal-300 hover:bg-teal-100 mt-1"
                        onClick={() => {
                          setSelectedNoteId(note.id);
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

      {/* Modal */}
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
                  setSelectedLessonId(""); // reset lesson
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
              Save Note to Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
