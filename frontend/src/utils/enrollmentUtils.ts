import { Enrollment } from "@/utils/types";
import axios from "axios";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

export interface EnrollmentUtilsConfig {
  userId: string;
  token?: string;
  onSuccess?: (message: string) => void;
  onFailure?: (message: string) => void;
}

export class EnrollmentUtils {
  private userId: string;
  private token?: string;
  private onSuccess?: (message: string) => void;
  private onFailure?: (message: string) => void;

  constructor(config: EnrollmentUtilsConfig) {
    this.userId = config.userId;
    this.token = config.token;
    this.onSuccess = config.onSuccess;
    this.onFailure = config.onFailure;
  }

  // Enroll in a course
  async enrollInCourse(courseId: number): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.post(
        `${API_BASE_URL}/enrollments/enroll`,
        {
          studentId: String(this.userId),
          courseId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        if (this.onSuccess) {
          this.onSuccess("Course enrolled successfully");
        }
        return;
      }
      if (response.status === 400) {
        if (this.onFailure) {
          this.onFailure("Student is already enrolled in this course");
        }
        return;
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      if (this.onFailure) {
        this.onFailure("Failed to enroll in course");
      }
      throw error;
    }
  }

  async fetchEnrollment(enrollmentId: number): Promise<Enrollment> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get(
        `${API_BASE_URL}/enrollments/${this.userId}/${enrollmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        return response.data;
      }
      throw new Error("Failed to fetch enrollment");
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      throw error;
    }
  }

  //   // Get user's enrolled courses
  //   async getEnrolledCourses(): Promise<CourseData[]> {
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) throw new Error("No token found");

  //       const response = await axios.get(
  //         `${API_BASE_URL}/enrollments/user/${this.userId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (response.status === 200) {
  //         return response.data;
  //       }
  //       throw new Error("Failed to fetch enrolled courses");
  //     } catch (error) {
  //       console.error("Error fetching enrolled courses:", error);
  //       throw error;
  //     }
  //   }

  //   // Check if user is enrolled in a course
  //   async isEnrolled(courseId: string): Promise<boolean> {
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) throw new Error("No token found");

  //       const response = await axios.get(
  //         `${API_BASE_URL}/enrollments/check/${this.userId}/${courseId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (response.status === 200) {
  //         return response.data.isEnrolled;
  //       }
  //       return false;
  //     } catch (error) {
  //       console.error("Error checking enrollment status:", error);
  //       return false;
  //     }
  //   }

  //   // Get enrollment status for multiple courses
  //   async checkEnrollmentStatus(
  //     courseIds: string[]
  //   ): Promise<Record<string, boolean>> {
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) throw new Error("No token found");

  //       const response = await axios.post(
  //         `${API_BASE_URL}/enrollments/check-status`,
  //         {
  //           userId: this.userId,
  //           courseIds,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (response.status === 200) {
  //         return response.data;
  //       }
  //       return {};
  //     } catch (error) {
  //       console.error("Error checking enrollment status:", error);
  //       return {};
  //     }
  //   }

  //   // Cancel enrollment in a course
  //   async cancelEnrollment(courseId: string): Promise<void> {
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) throw new Error("No token found");

  //       const response = await axios.delete(
  //         `${API_BASE_URL}/enrollments/${this.userId}/${courseId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (response.status === 204) {
  //         return;
  //       }
  //       throw new Error("Failed to cancel enrollment");
  //     } catch (error) {
  //       console.error("Error canceling enrollment:", error);
  //       throw error;
  //     }
  //   }
}
