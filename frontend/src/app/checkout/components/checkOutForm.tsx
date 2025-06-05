// PaymentForm.tsx
import { useAuth } from "@/app/auth/context";
import { PaymentConfirmResponse } from "@/utils/types";
import {
  PaymentElement,
  PaymentElementProps,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { AlertCircle, CreditCard, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface PaymentFormProps {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  // clientSecret,
  paymentIntentId,
  amount,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Stripe handles the payment confirmation
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-complete`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Payment failed
        setMessage(error.message || "Payment failed");
        setIsLoading(false);
      } else {
        console.log("Payment succeeded");
        // Payment succeeded - now confirm with your backend
        await confirmWithBackend();
      }
    } catch (err) {
      setMessage("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const confirmWithBackend = async (): Promise<void> => {
    try {
      const response = await fetch(
        "http://localhost:5002/api/purchase/confirm-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId,
          }),
        }
      );

      const data: PaymentConfirmResponse = await response.json();

      if (data.success) {
        // Redirect to success page
        console.log("Success!!");
        router.push(`/purchase-success?paymentIntentId=${paymentIntentId}`);
      } else {
        setMessage(
          data.message || "Enrollment failed. Refund is being processed."
        );
      }
    } catch (error) {
      console.error("Backend confirmation error:", error);
      setMessage(
        "Payment succeeded but enrollment failed. Please contact support."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const paymentElementProps: PaymentElementProps = {
    options: {
      layout: "tabs",
    },
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#6366f1",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily: "Inter, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-purple-600 px-6 py-8 text-white">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Secure Payment</h2>
        <p className="text-teal-100 text-center text-sm">
          Complete your purchase securely
        </p>
      </div>

      {/* Payment Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Display */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">
                ৳ {amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Element Container */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Details
            </label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
              <PaymentElement id="payment-element" {...paymentElementProps} />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
            <Lock className="w-4 h-4 text-green-600" />
            <span>Your payment information is encrypted and secure</span>
          </div>

          {/* Error Message */}
          {message && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Payment Error</p>
                <p className="text-red-700 text-sm mt-1">{message}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={isLoading || !stripe || !elements}
            type="submit"
            className={`
              w-full py-4 px-6 rounded-lg font-semibold text-white text-lg
              transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
              shadow-lg hover:shadow-xl
              ${
                isLoading || !stripe || !elements
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700"
              }
            `}
          >
            <div className="flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Pay ৳ {amount.toFixed(2)}</span>
                </>
              )}
            </div>
          </button>
          <div className="flex justify-center items-center gap-4 text-gray-400">
            <span>Powered by Stripe • PCI DSS Compliant</span>
            <span>•</span>
            <span>💳 All Cards Accepted</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
