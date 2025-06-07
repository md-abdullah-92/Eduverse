"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";

interface SaveSlideButtonProps {
  title: string;
}

export default function SaveSlideButton({ title }: SaveSlideButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getSanitizedClone = (): HTMLElement => {
    const preview = document.getElementById("assignment-preview");
    if (!preview) {
      toast.error("Assignment preview not found");
      throw new Error("Preview not found");
    }

    const clone = preview.cloneNode(true) as HTMLElement;
    clone.style.all = "unset";
    clone.style.backgroundColor = "#ffffff";
    clone.style.position = "relative";
    clone.style.width = preview.offsetWidth + "px";

    clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
      el.style.boxSizing = "border-box";
      el.style.margin = "0";
      el.style.padding = "0.35rem 0";
      el.style.fontFamily = "'Times New Roman', serif";
      el.style.fontSize = "16px";
      el.style.lineHeight = "1.8";
      el.style.color = "#000000";
    });

    const headings = clone.querySelectorAll<HTMLElement>("h2");
    if (headings.length > 0) {
      headings[0].remove();
    }

    clone.querySelectorAll<HTMLElement>(".slide-section").forEach((el) => {
      el.style.pageBreakAfter = "always";
      el.style.marginBottom = "2.5rem";
    });

    return clone;
  };

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const content = getSanitizedClone();

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Failed to open print window");
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title || "Assignment"}</title>
            <style>
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                .slide-section {
                  page-break-after: always;
                }
              }
              body {
                font-family: 'Times New Roman', serif;
                background-color: #fff;
                color: #000;
                font-size: 16px;
                line-height: 1.8;
                padding: 2rem;
              }
              h1, h2, h3 {
                font-weight: bold;
                margin: 1.2rem 0 0.5rem;
              }
              p, li {
                margin: 0.35rem 0;
              }
              ul {
                padding-left: 1.5rem;
                margin-bottom: 1.5rem;
              }
              .slide-section {
                margin-bottom: 2.5rem;
              }
              .assignment-meta {
                text-align: center;
                margin-bottom: 3rem;
              }
              .assignment-meta p {
                margin: 0.25rem 0;
              }
            </style>
          </head>
          <body>
            <div class="assignment-meta">
              <h1>${title || "Assignment"}</h1>
              <p><strong>Name:</strong> ________________________</p>
              <p><strong>ID:</strong> ____________________________</p>
              <p><strong>Date:</strong> __________________________</p>
            </div>
            <div id="print-root">${content.innerHTML}</div>
            <script>
              window.onload = function () {
                setTimeout(() => {
                  window.focus();
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      toast.error("Print failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        onClick={handlePrint}
        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md shadow-md"
        disabled={isLoading}
      >
        <Printer className="w-4 h-4 mr-2" />
        {isLoading ? "Processing..." : "Print Assignment"}
      </Button>
    </div>
  );
}
