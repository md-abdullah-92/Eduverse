"use client";

import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import { cookie, dmSerif, jaro, notoSerif, raleway } from "@/utils/font";
import { Course } from "@/utils/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CourseCertificatePage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");
  const studentName = localStorage.getItem("userName");
  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchCourseDetails = async () => {
    try {
      console.log(id);
      const response = await fetch(
        `http://localhost:5001/api/courses/get/${id}`
      );
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Failed to fetch course details");
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  // Enhanced print function with proper settings
  const handlePrint = () => {
    // Create a style element for print-specific styles
    const printStyles = `
      <style>
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        }
      </style>
    `;

    // Add the styles to the document head temporarily
    const styleElement = document.createElement("div");
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement.firstChild!);

    // Trigger print
    window.print();

    // Clean up the added styles after a delay
    setTimeout(() => {
      const addedStyle = document.head.querySelector("style:last-child");
      if (addedStyle) {
        document.head.removeChild(addedStyle);
      }
    }, 1000);
  };

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 via-teal-50 to-purple-100 print:bg-white print:p-0">
        {/* Certificate Card */}
        <div className="relative w-full max-w-4xl aspect-[1.414/1] bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:mx-auto print-certificate">
          {/* Decorative Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-teal-500 to-purple-500 p-1 rounded-2xl print:rounded-none print-border">
            <div className="w-full h-full bg-white rounded-xl print:rounded-none relative overflow-hidden print-content">
              {/* Background Pattern - Hidden in print */}
              <div className="absolute inset-0 opacity-5 background-pattern">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-400 to-teal-400"></div>
                <div className="absolute top-8 left-8 w-24 h-24 bg-purple-300 rounded-full opacity-20"></div>
                <div className="absolute bottom-8 right-8 w-32 h-32 bg-teal-300 rounded-full opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-300 to-teal-300 rounded-full opacity-10"></div>
              </div>

              {/* Corner Decorations - Hidden in print */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-transparent rounded-br-full opacity-30 corner-decoration"></div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-teal-400 to-transparent rounded-bl-full opacity-30 corner-decoration"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-400 to-transparent rounded-tr-full opacity-30 corner-decoration"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-purple-400 to-transparent rounded-tl-full opacity-30 corner-decoration"></div>

              {/* Certificate Content */}
              <div className="relative z-10 p-8 text-center h-full flex flex-col justify-between print:p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex justify-center items-center mb-3">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full gradient-line"></div>
                    <div className="mx-3 text-4xl">🎓</div>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full gradient-line"></div>
                  </div>
                  <h1
                    className={`${dmSerif.className} text-5xl font-bold text-teal-700 mb-2 print:text-4xl`}
                  >
                    Certificate of Excellence
                  </h1>
                </div>

                {/* Award Text */}
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <p
                    className={`${raleway.className} text-lg text-gray-700 font-light print:text-gray-800`}
                  >
                    This certificate is proudly presented to
                  </p>

                  {/* Student Name */}
                  <div className="relative my-2">
                    <h2
                      className={`${dmSerif.className} text-4xl font-bold text-purple-700 mb-2 print:text-3xl`}
                    >
                      {studentName}
                    </h2>
                    <div className="w-40 h-px bg-gradient-to-r from-purple-400 to-teal-400 mx-auto gradient-line"></div>
                  </div>

                  <p
                    className={`${notoSerif.className} text-lg text-gray-800 font-medium`}
                  >
                    for the successful completion of the course,
                  </p>

                  {/* Course Title */}
                  <div className="bg-gradient-to-r from-purple-50 to-teal-50 p-4 rounded-2xl border border-purple-100 mx-4 gradient-bg print:rounded-lg">
                    <h3
                      className={`${dmSerif.className} text-2xl font-semibold text-teal-800 print:text-xl`}
                    >
                      {course?.title}
                    </h3>
                  </div>

                  {/* Organization */}
                  <p
                    className={`${raleway.className} text-lg text-gray-600 font-bold print:text-gray-800`}
                  >
                    Issued on behalf of,
                  </p>
                  <div className="text-center">
                    <div className="mb-2">
                      <div className="w-32 h-32 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-1">
                        <p
                          className={`${jaro.className} text-2xl font-bold text-white print:text-xl`}
                        >
                          Edu Verse
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="flex justify-between items-end pt-4 print:pt-2">
                  <div className="text-left">
                    <p className="print:text-gray-800">{completionDate}</p>
                    <div className="w-24 h-px bg-gradient-to-r from-purple-400 to-teal-400 mb-1 gradient-line"></div>
                    <p
                      className={`${raleway.className} text-xs text-gray-600 print:text-gray-800`}
                    >
                      Date
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`${cookie.className} text-lg text-gray-600 font-bold print:text-gray-800`}
                    >
                      Abdullah Al Mahdi
                    </p>
                    <div className="w-24 h-px bg-gradient-to-r from-teal-400 to-purple-400 mb-1 gradient-line"></div>
                    <p
                      className={`${raleway.className} text-xs text-gray-600 print:text-gray-800`}
                    >
                      Signature
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-8 print:hidden">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="bg-teal-600 text-white border-0 hover:from-purple-400 hover:to-teal-400 px-18 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Download Certificate
          </Button>
        </div>
      </div>
    </>
  );
}
