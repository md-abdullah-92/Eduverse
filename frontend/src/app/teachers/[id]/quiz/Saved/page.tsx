"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "../../../components/Sidebar";
import { robotoSlab } from "@/utils/font";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import { useInstructorCourses } from "@/hooks/useInstructorCourses";




import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function PublishedQuiz() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setUserId(uid);
  }, []);

  const { profile, loading, error, refetch } = useTeacherProfile(
    userId ?? undefined
  );

  type Quiz = {
    id: string;
    title: string;
    description: string;
    duration: number;
    createdAt: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: string;
    }[];
  };

  const quizzes: Quiz[] = profile?.quizzes ?? [];

  // Modal & Selection states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const { courses } = useInstructorCourses(userId||'0');
  

  // Fetch teacher's courses with lessons
  
  console.log(courses);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this exam?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/api/quiz/delete/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("Exam deleted successfully!");
        refetch();
      } else {
        toast.error(result.message || "Failed to delete exam");
      }
    } catch (error) {
      toast.error("Error deleting exam");
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/teachers/${userId}/quiz/${id}`);
  };

  // Assign quiz to course lesson
  const handleSetQuiz = async () => {
    if (!selectedQuizId || !selectedCourse || !selectedLesson) {
      toast.error("Please select all fields");
      return;
    }
const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);

if (!selectedQuiz) {
  alert("Quiz not found!");
  return;
}

const examData = {
  title: selectedQuiz.title,
  description: selectedQuiz.description,
  questions: selectedQuiz.questions,
  duration: selectedQuiz.duration,
  lessonId: selectedLesson ,
};

try {
  console.log("Creating exam:", examData);

  const response = await fetch("http://localhost:5001/api/quizes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(examData),
  });

  if (!response.ok) {
    throw new Error("Server responded with an error");
  }

  const result = await response.json();
  console.log("Exam created:", result);
  setOpenDialog(false);
  alert("✅ Exam created successfully!");
  
} catch (error) {
  console.error("Error creating exam:", error);
  alert("❌ Failed to create exam. Please try again.");
}

  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <p className="text-xl text-gray-600">No user ID found. Please log in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <p className="text-xl text-gray-600">Loading profile and exams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>

      <main className="ml-20 p-6 flex-1">
        <div className={`${robotoSlab.className} text-gray-800 max-w-5xl mx-auto`}>
          <h1 className="text-4xl font-bold mb-8 text-teal-700">📋 Published Exams</h1>

          {quizzes.length === 0 ? (
            <p className="text-lg text-gray-600">No exams published yet.</p>
          ) : (
            quizzes.map((exam) => (
              <Card
                key={exam.id}
                className="mb-6 border border-teal-200 shadow-lg bg-white/70 backdrop-blur-md rounded-2xl transition hover:shadow-xl"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-teal-800">{exam.title}</h2>
                      
                    </div>
                    <span className="text-sm text-gray-500 mt-1">
                      📅 {new Date(exam.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-md mb-4 text-gray-700">
                    ⏱ <span className="font-medium">Duration:</span> {exam.duration} min &nbsp;|&nbsp;
                    📄 <span className="font-medium">Questions:</span> {exam.questions.length}
                  </p>

                  <div className="flex gap-4 mt-4 flex-wrap">
                    <Button
                      onClick={() => handleViewDetails(exam.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-base px-6"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(exam.id)}
                      className="text-base px-6"
                    >
                      Delete
                    </Button>

                    {/* Set Quiz to Lesson Button & Modal */}
                    <Dialog open={openDialog && selectedQuizId === exam.id} onOpenChange={setOpenDialog}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => {
                            setSelectedQuizId(exam.id);
                            setOpenDialog(true);
                          }}
                        >
                          Set Quiz to Lesson
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Set Quiz for Course Lesson</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Choose Course</Label>
                            <Select
                              onValueChange={(val) => {
                                setSelectedCourse(val);
                                setSelectedLesson(""); // reset lesson when course changes
                              }}
                              value={selectedCourse}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select course" />
                              </SelectTrigger>
                              <SelectContent>
                                {courses.map((course) => (
                                  <SelectItem key={course.id} value={course.id}>
                                    {course.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Choose Lesson</Label>
                            <Select
                              onValueChange={(val) => setSelectedLesson(val)}
                              value={selectedLesson}
                              disabled={!selectedCourse}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select lesson" />
                              </SelectTrigger>
                              <SelectContent>
                                {(courses.find((c) => c.id === selectedCourse)?.lessons || []).map(
                                  (lesson) => (
                                    <SelectItem key={lesson.id} value={lesson.id}>
                                      {lesson.title}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={handleSetQuiz}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Assign Quiz
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
