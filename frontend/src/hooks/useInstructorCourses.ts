import { useEffect, useState } from "react";

export type Lesson = {
  id: string;
  title: string;
  // Add other lesson fields if needed
};

export type Outcome = {
  id: string;
  description: string;
};

export type Course = {
  id: string;
  title: string;
  lessons: Lesson[];
  outcomes: Outcome[];
  // Add other course fields if needed
};

export function useInstructorCourses(instructorId?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    if (!instructorId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:5001/api/courses/getByInstructorId/${instructorId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch courses");
      }

      setCourses(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [instructorId]);

  return { courses, loading, error, refetch: fetchCourses };
}
