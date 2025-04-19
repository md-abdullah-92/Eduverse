"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/auth?tab=login");
    } else {
      console.log("✅ Token found:", savedToken);
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="animate-spin w-10 h-10" />
        <span className="ml-4 text-lg">Checking session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 shadow-xl rounded-2xl p-10 max-w-xl text-center transition-all duration-500 ease-in-out">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-pulse">
          🎉 Welcome to your Dashboard
        </h1>
        <p className="text-gray-300 text-lg">Your token: <code className="text-green-400">{token?.slice(0, 20)}...</code></p>
      </div>
    </div>
  );
}
