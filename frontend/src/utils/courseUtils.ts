/* eslint-disable @typescript-eslint/no-explicit-any */
import { storage } from "@/firebaseConfig";
import { CourseData, CourseFormData, Lesson, Outcome } from "@/utils/types";
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

  async fetchCourse(): Promise<CourseData> {
    if (!this.courseId) throw new Error("Course ID is required");

    const response = await fetch(
      `${API_BASE_URL}/courses/get/${this.courseId}`
    );
    return response.json();
  }

  // Create new course
  async createCourse(data: CourseFormData): Promise<CourseFormData> {
    try {
      const parsedPrice = String(data.price).replace(",", ".");
      const response = await axios.post(`${API_BASE_URL}/courses/create`, {
        ...data,
        price: parseFloat(parsedPrice),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  }

  // Update course with all related entities
  async updateCourseWithEntities(
    data: CourseData,
    coverFile: File | null
  ): Promise<CourseData> {
    if (!this.courseId) throw new Error("Course ID is required");

    try {
      // Validate price
      const parsedPrice = String(data.price).replace(",", ".");
      if (isNaN(parseFloat(parsedPrice))) {
        throw new Error("Please enter a valid price");
      }

      // Upload cover image if changed
      const coverPhotoUrl = coverFile
        ? await this.uploadCoverImage(coverFile)
        : data.coverPhotoUrl;

      // Update course
      const response = await axios.put(
        `${API_BASE_URL}/courses/update/${this.courseId}`,
        {
          ...data,
          price: parseFloat(parsedPrice),
          coverPhotoUrl,
        }
      );
      if (!response || response.status !== 200) {
        throw new Error("Failed to update course");
      }

      // Handle lessons
      await this.handleLessons(data.lessons);

      // Handle outcomes
      await this.handleOutcomes(data.outcomes);

      return {
        ...data,
        price: parsedPrice,
        coverPhotoUrl,
      };
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  }

  // Handle lessons update
  // Handle lessons update
  private async handleLessons(lessons: Lesson[]): Promise<void> {
    // Fetch existing lessons
    const existingLessonsResponse = await axios.get(
      `${API_BASE_URL}/lessons/get/${this.courseId}`
    );
    const existingLessons = existingLessonsResponse.data;

    // Delete all existing lessons
    await Promise.all(
      existingLessons.map((lesson: any) =>
        axios.delete(`${API_BASE_URL}/lessons/delete/${lesson.id}`)
      )
    );

    // Create new lessons
    await Promise.all(
      lessons.map((lesson) =>
        axios.post(`${API_BASE_URL}/lessons/add/${this.courseId}`, {
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          orderIndex: lesson.orderIndex,
        })
      )
    );
  }

  // Handle outcomes update
  private async handleOutcomes(outcomes: Outcome[]): Promise<void> {
    if (!this.courseId) return;

    // Fetch existing outcomes
    const existingOutcomesResponse = await axios.get(
      `${API_BASE_URL}/outcomes/get/${this.courseId}`
    );
    const existingOutcomes = existingOutcomesResponse.data;
    const existingOutcomeTexts = existingOutcomes.map(
      (outcome: { outcome: string }) => outcome.outcome
    );

    // Delete outcomes that are no longer present
    const outcomesToDelete = existingOutcomes.filter(
      (outcome: { outcome: string; id: string }) =>
        !outcomes.some((o) => o.outcome === outcome.outcome)
    );

    await Promise.all(
      outcomesToDelete.map((outcome: { id: string }) =>
        axios.delete(`${API_BASE_URL}/outcomes/delete/${outcome.id}`)
      )
    );

    // Add new outcomes
    const newOutcomes = outcomes.filter(
      (outcome) =>
        !existingOutcomeTexts.includes(outcome.outcome) &&
        outcome.outcome.trim() !== ""
    );

    await Promise.all(
      newOutcomes.map((outcome) =>
        axios.post(`${API_BASE_URL}/outcomes/add/${this.courseId}`, {
          outcome: outcome.outcome,
        })
      )
    );
  }

  // Delete course
  async deleteCourse(): Promise<void> {
    if (!this.courseId) throw new Error("Course ID is required");

    await axios.delete(`${API_BASE_URL}/courses/${this.courseId}`);
  }

  // Format lessons data
  static formatLessons(lessons: any[]): Lesson[] {
    if (!Array.isArray(lessons)) return [];

    return lessons.map((lesson) => ({
      id: lesson.id || this.generateId(),
      title: lesson.title || "",
      description: lesson.description || "",
      notes: lesson.notes || "",
      videoUrl: lesson.videoUrl || null,
      orderIndex: lesson.orderIndex || 0,
    }));
  }

  // Generate unique ID for lessons
  static generateId(): string {
    return `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Validate course form
  static validateCourseForm(data: CourseFormData): string | null {
    if (!data.title.trim()) return "Course title is required";
    if (!data.description.trim()) return "Course description is required";
    if (!data.price) return "Course price is required";
    if (!data.level) return "Course level is required";
    return null;
  }

  // Validate lesson form
  static validateLessonForm(data: Lesson): string | null {
    if (!data.title.trim()) return "Lesson title is required";
    if (!data.description.trim()) return "Lesson description is required";
    if (!data.videoUrl) return "Video URL is required";
    if (!data.orderIndex) return "Order index is required";
    return null;
  }
}
