import { EnrollmentUtils } from "@/utils/enrollmentUtils";
import { Enrollment } from "@/utils/types";
import { useEffect, useState } from "react";

interface UseEnrollmentDataProps {
  userId: string;
  enrollmentId: string;
}

export function useEnrollmentData({
  userId,
  enrollmentId,
}: UseEnrollmentDataProps) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!userId || !enrollmentId) return;

    const enrollmentUtils = new EnrollmentUtils({ userId });

    const fetchEnrollment = async () => {
      try {
        setLoading(true);
        const enrollmentData = await enrollmentUtils.fetchEnrollment(
          Number(enrollmentId)
        );
        setEnrollment(enrollmentData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load enrollment"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, [userId, enrollmentId, refreshTrigger]);

  const refetch = () => setRefreshTrigger((prev) => prev + 1);

  return { enrollment, loading, error, refetch };
}
