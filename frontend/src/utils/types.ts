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

export interface Outcome {
  outcome: string;
}

export interface CourseData extends CourseFormData {
  id: number;
  lessons: Lesson[];
  outcomes: Outcome[];
  progress?: number;
}

export interface CourseInfo {
  id: number;
  enrollmentId: number;
  progress: number;
}

export interface EnrollmentData {
  id: number;
  studentId: string;
  courseId: number;
  createdAt: Date;
  updatedAt: Date;
  progressPercentage: number;
}

export interface LessonCompletion {
  id: number;
  enrollmentId: number;
  lessonId: number;
  completedAt: Date;
}

export interface LessonCompletionData extends LessonCompletion {
  completed: boolean;
  watchTime: number;
}

export interface Enrollment extends EnrollmentData {
  course: CourseData;
  lessonCompletions: LessonCompletion[];
}
