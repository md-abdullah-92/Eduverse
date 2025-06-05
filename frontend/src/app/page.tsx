"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CourseCTASection from "@/components/homepage/CourseCTASection";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import HeroSection from "@/components/homepage/HeroSection";
import PopularCourses from "@/components/homepage/PopularCourses";
import StatsSection from "@/components/homepage/StatsSection";
import TestimonialsSection from "@/components/homepage/TestimonialsSection";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";

const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        if (data.role === "TEACHER") {
          router.push(`/teachers/${data.id}`); // Make sure `data.id` is correct
        } else if (data.role === "STUDENT") {
          router.push(`/students/${data.id}`);
        } else {
          setMessage("Unknown user role. Please contact support.");
        }
      } catch (err) {
        console.error("Authentication failed:", err);
        localStorage.removeItem("token");
        setMessage("Session expired. Please log in again.");
      }
    };

    fetchUser();
  }, [router]);

  return (
    <Elements stripe={stripePromise}>
      <main className="min-h-screen bg-[#F9FAFC]">
        {message && (
          <div className="text-center p-4 text-red-600 font-medium bg-red-100">
            {message}
          </div>
        )}
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <CourseCTASection />
        <PopularCourses />
        <TestimonialsSection />
      </main>
    </Elements>
  );
}
