export interface LessonFormData {
  title: string;
  description: string;
  videoUrl: string | null;
  notes: string;
  orderIndex: number;
}

export interface Lesson extends LessonFormData {
  id: string | null;
}
export interface CourseFormData {
  title: string;
  price: string;
  level: string;
  topic: string;
  description: string;
  coverPhotoUrl: string | null;
  instructorId: string;
  averageRating: number;
}

export interface CourseData extends CourseFormData {
  id: string;
  lessons: Lesson[];
  outcomes: string[];
}
