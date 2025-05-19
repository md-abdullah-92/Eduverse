export interface Lesson {
  id: string;
  title: string;
  description: string;
  lectureNote: string;
  videoUrl: string | null;
}

export interface LessonForm {
  title: string;
  description: string;
  lectureNote: string;
  video: File | null;
}

export interface CourseFormData {
  title: string;
  price: number;
  level: string;
  topic: string;
  description: string;
  coverPhotoUrl?: string | null;
  instructorId: string;
}

export interface CourseData extends CourseFormData {
  id?: string;
  lessons: Lesson[];
  outcomes: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  coverPhotoUrl: string | null;
  level: string;
  topic: string;
  instructorId: string;
  averageRating: number;
}
