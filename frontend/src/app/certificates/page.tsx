"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { dmSerif, notoSerif, raleway } from "@/utils/font";

export default function CourseCertificatePage() {
  const { courseid } = useParams();
  const courseName = "Advanced JavaScript"; // Replace dynamically
  const studentName = "John Doe"; // Replace dynamically
  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-gray-100 print:bg-white">
      {/* Certificate Card */}
      <div
        className="w-full max-w-4xl aspect-[1.414/1] border-8 border-yellow-500 bg-white p-10 shadow-xl rounded-xl text-center print:shadow-none print:border-yellow-500 print:rounded-none print:mx-auto"
      >
        <h1 className={`${dmSerif.className} text-4xl text-yellow-600 font-bold mb-6`}>
          🎓 Certificate of Completion
        </h1>

        <p className={`${raleway.className} text-lg text-gray-700 mb-4`}>
          This is awarded to
        </p>

        <h2 className={`${dmSerif.className} text-3xl text-purple-700 font-semibold mb-4`}>
          {studentName}
        </h2>

        <p className={`${notoSerif.className} text-xl text-gray-800 mb-4`}>
          for successfully completing the course
        </p>

        <h3 className={`${dmSerif.className} text-2xl text-teal-700 font-semibold mb-6`}>
          “{courseName}”
        </h3>

        <p className={`${raleway.className} text-base text-gray-600 mb-10`}>
          Dated: <strong>{completionDate}</strong>
        </p>

        {/* Signature */}
        <div className="flex justify-end items-center px-10 mt-12">
          <div className="text-right">
            <p className="text-2xl italic text-black font-[cursive] mb-2">
              Eduverse
            </p>
            <div className="w-40 h-px bg-gray-500 mb-1" />
            <p className="text-sm text-gray-600">Eduverse Authority</p>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-6 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          🖨️ Print Certificate
        </Button>
      </div>
    </div>
  );
}
