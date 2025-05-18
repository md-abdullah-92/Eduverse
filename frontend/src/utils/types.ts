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
  price: string;
  level: string;
  description: string;
  coverPhotoUrl?: string;
  outcomes: string[];
}

export interface CourseData extends CourseFormData {
  lessons: Lesson[];
}
