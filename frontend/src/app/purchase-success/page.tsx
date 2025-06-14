"use client";
import { useAuth } from "@/app/auth/context";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Download,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PurchaseSuccessPage = () => {
  const router = useRouter();
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Only run on client-side

    // Use window.location.search instead of useSearchParams
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get("paymentIntentId");

    if (paymentId) {
      setPaymentIntentId(paymentId);
    }

    setIsLoading(false);
  }, [isMounted]); // Change dependency

  if (isLoading || !isMounted) {
    return <LoadingIndicator text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <CheckCircle className="w-24 h-24 text-teal-500" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-teal-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Welcome to your learning journey
          </p>
          <p className="text-sm text-gray-500">
            Transaction ID: {paymentIntentId.substring(3, 15)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              What&apos;s Next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Access Your Courses
                </h4>
                <p className="text-sm text-gray-600">
                  All your enrolled courses are now available in your dashboard
                </p>
              </div>

              <div className="text-center p-6 bg-teal-50 rounded-xl">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Download Materials
                </h4>
                <p className="text-sm text-gray-600">
                  Get course materials, PDFs, and resources for offline learning
                </p>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Track Progress
                </h4>
                <p className="text-sm text-gray-600">
                  Monitor your learning progress and earn certificates
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() =>
                router.push(`/students/${user?.id}/enrolled_course`)
              }
              className="flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200"
            >
              <BookOpen className="w-5 h-5" />
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push("/courses")}
              className="flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200"
            >
              <span>Browse More Courses</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Confirmation Email Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              📧 A confirmation email with your purchase details and course
              access links has been sent to your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
