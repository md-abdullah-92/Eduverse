// components/reviews/ReviewSection.tsx
"use client";

import { useAuth } from "@/app/auth/context";
import { useToast } from "@/components/ui_elements/toast";
import { Review } from "@/utils/types";
import { useEffect, useState } from "react";
import { FiEdit2, FiStar, FiTrash2, FiUser } from "react-icons/fi";

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}

interface ReviewSectionProps {
  courseId: number;
  isEnrolled: boolean;
}

export function ReviewSection({ courseId, isEnrolled }: ReviewSectionProps) {
  const { user, token } = useAuth(); // Now you can access token directly
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/";

  const getAuthHeaders = () => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
    if (user && isEnrolled) {
      fetchUserReview();
    }
  }, [courseId, user, isEnrolled]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${BASE_URL}reviews/course/${courseId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      const reviews = data.data.reviews;

      if (data.success) {
        setReviews(reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}reviews/course/${courseId}/stats`,
        {
          headers: getAuthHeaders(),
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      if (!user) return;
      const response = await fetch(
        `${BASE_URL}reviews/course/${courseId}/student/${user.id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        setUserReview(data.data);
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
    }
  };

  const handleDeleteReview = async () => {
    try {
      if (!userReview) return;
      const response = await fetch(`${BASE_URL}reviews/${userReview.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setUserReview(null);
        fetchReviews();
        fetchStats();
        showToast(data.message, "success");
      }
    } catch (error) {
      const data = error as { message: string };
      showToast(data.message, "error");
    }
  };

  const handleReviewSubmit = async (reviewData: Review) => {
    try {
      const url = userReview
        ? `${BASE_URL}reviews/${userReview.id}`
        : `${BASE_URL}reviews`;
      const method = userReview ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();
      if (data.success) {
        setUserReview(data.data);
        setShowReviewForm(false);
        fetchReviews();
        fetchStats();
        showToast(data.message, "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      const data = error as { message: string };
      showToast(data.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-200 border-t-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Student Reviews
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(stats.averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-2xl font-bold text-slate-900 ml-2">
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-slate-600">
                  ({stats.totalReviews} review
                  {stats.totalReviews !== 1 ? "s" : ""})
                </span>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="hidden md:block">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div
                    key={rating}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <span className="w-3 text-slate-600">{rating}</span>
                    <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-emerald-500 rounded-full"
                        style={{
                          width: `${
                            stats.totalReviews > 0
                              ? (stats.distribution[rating] /
                                  stats.totalReviews) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-slate-600 w-8">
                      {stats.distribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Review Form/Display */}
      {isEnrolled && user && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {userReview ? (
            <UserReviewDisplay
              review={userReview}
              onEdit={() => setShowReviewForm(true)}
              onDelete={handleDeleteReview}
            />
          ) : (
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-4">
                Share your experience
              </h4>
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Write a Review
                </button>
              ) : null}
            </div>
          )}

          {showReviewForm && (
            <ReviewForm
              courseId={courseId}
              existingReview={userReview}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className="text-center py-12">
            <FiStar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No reviews yet</p>
            <p className="text-slate-400">
              Be the first to review this course!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Review Card Component
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <FiUser className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">Student</div>
            <div className="text-sm text-slate-500">
              {new Date(review.createdAt || new Date()).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-slate-700 leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// User's Own Review Display
function UserReviewDisplay({
  review,
  onEdit,
  onDelete,
}: {
  review: Review;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-slate-900">Your Review</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-600 hover:text-red-600 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= review.rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-slate-600">({review.rating}/5)</span>
      </div>
      {review.comment && <p className="text-slate-700">{review.comment}</p>}
    </div>
  );
}

// Review Form Component
function ReviewForm({
  courseId,
  existingReview,
  onSubmit,
  onCancel,
}: {
  courseId: number;
  existingReview?: Review | null;
  onSubmit: (data: Review) => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !user) return;

    onSubmit({
      studentId: String(user.id),
      courseId,
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Rating *
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <FiStar
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              />
            </button>
          ))}
          <span className="ml-4 text-sm text-slate-600">
            {rating > 0 && `${rating}/5`}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Comment (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Share your thoughts about this course..."
        />
      </div>

      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={rating === 0}
          className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {existingReview ? "Update Review" : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
