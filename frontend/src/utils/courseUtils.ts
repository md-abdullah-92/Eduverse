import { storage } from "@/firebaseConfig";
import { CourseData, CourseFormData } from "@/utils/types";
import axios from "axios";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

export interface CourseUtilsConfig {
  userId: string;
  courseId?: string;
}

export class CourseUtils {
  private userId: string;
  private courseId?: string;

  constructor(config: CourseUtilsConfig) {
    this.userId = config.userId;
    this.courseId = config.courseId;
  }

  // Upload cover image to Firebase Storage
  async uploadCoverImage(coverFile: File | null): Promise<string> {
    if (!coverFile) throw new Error("No file provided");

    const storageRef = ref(
      storage,
      `course_covers/${Date.now()}-${coverFile.name}`
    );

    try {
      await uploadBytes(storageRef, coverFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading cover image:", error);
      throw new Error("Failed to upload cover image");
    }
  }

  // Fetch course data from API
  async fetchCourse(): Promise<CourseData> {
    if (!this.courseId) throw new Error("Course ID is required");

    const response = await axios.get(
      `${API_BASE_URL}/courses/${this.courseId}`
    );
    return response.data;
  }

  // Create new course
  async createCourse(data: CourseFormData): Promise<CourseFormData> {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/create`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  }

  // Update course
  async updateCourse(data: CourseFormData): Promise<CourseFormData> {
    if (!this.courseId) throw new Error("Course ID is required");

    const response = await axios.put(
      `${API_BASE_URL}/courses/${this.courseId}`,
      data
    );
    return response.data;
  }

  // Delete course
  async deleteCourse(): Promise<void> {
    if (!this.courseId) throw new Error("Course ID is required");

    await axios.delete(`${API_BASE_URL}/courses/${this.courseId}`);
  }

  // Format lessons data
  //   static formatLessons(lessons: any[]): any[] {
  //     return lessons.map((lesson) => ({
  //       id: lesson.id,
  //       title: lesson.title || "",
  //       description: lesson.description || "",
  //       lectureNote: lesson.lectureNote || "",
  //       videoUrl: lesson.videoUrl || null,
  //     }));
  //   }

  // Generate unique ID for lessons
  //   static generateId(): string {
  //     return `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  //   }

  // Validate course form
  static validateCourseForm(data: CourseFormData): string | null {
    if (!data.title.trim()) return "Course title is required";
    if (!data.description.trim()) return "Course description is required";
    if (!data.price) return "Course price is required";
    if (!data.level) return "Course level is required";
    return null;
  }

  //   // Validate lesson form
  //   static validateLessonForm(data: LessonForm): string | null {
  //     if (!data.title.trim()) return "Lesson title is required";
  //     if (!data.description.trim()) return "Lesson description is required";
  //     if (!data.lectureNote.trim()) return "Lecture note is required";
  //     return null;
  //   }
}
