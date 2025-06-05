// PaymentForm.tsx
import { PaymentConfirmResponse } from "@/utils/types";
import {
  PaymentElement,
  PaymentElementProps,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface PaymentFormProps {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  paymentIntentId,
  amount,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

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
      const userToken = localStorage.getItem("token"); // or however you store auth token

      const response = await fetch("/api/purchase/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId: "handled_by_stripe",
        }),
      });

      const data: PaymentConfirmResponse = await response.json();

      if (data.success) {
        // Redirect to success page
        router.push(
          `/purchase-success?enrollments=${encodeURIComponent(
            JSON.stringify(data.data?.enrollments || [])
          )}&paymentIntentId=${paymentIntentId}`
        );
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" {...paymentElementProps} />

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="pay-button"
        type="submit"
      >
        <span id="button-text">
          {isLoading ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </span>
      </button>

      {message && (
        <div id="payment-message" className="error-message">
          {message}
        </div>
      )}
    </form>
  );
};

export default PaymentForm;
