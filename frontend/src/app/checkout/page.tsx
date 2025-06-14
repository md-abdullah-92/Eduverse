// CheckoutPage.tsx
"use client";

import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import PaymentForm from "./components/checkOutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! ||
    "pk_test_51RWOiYECk5iYBS848JP8ovt1hC6ou8mSabgsYTpwRtx4wpHQBG1d6yU54ro4UHEfTK2jqlcsqI4DZaxoHdYGZMW1009zhd1XuR"
);

interface PaymentState {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

const CheckoutPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentState | null>(null);

  useEffect(() => {
    const clientSecret = searchParams.get("clientSecret");
    const paymentIntentId = searchParams.get("paymentIntentId");
    const amount = searchParams.get("amount");

    if (clientSecret && paymentIntentId && amount) {
      setPaymentData({
        clientSecret,
        paymentIntentId,
        amount: parseFloat(amount),
      });
    }
  }, [searchParams]);

  if (!paymentData) {
    return (
      <div className="checkout-container">
        <div>Loading payment information...</div>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret: paymentData.clientSecret,
    appearance: {
      theme: "stripe",
    },
  };

  return (
    <div className="checkout-container">
      <div className="payment-section">
        <Elements options={options} stripe={stripePromise}>
          <PaymentForm
            clientSecret={paymentData.clientSecret}
            paymentIntentId={paymentData.paymentIntentId}
            amount={paymentData.amount}
          />
        </Elements>
      </div>
    </div>
  );
};

export default CheckoutPage;
