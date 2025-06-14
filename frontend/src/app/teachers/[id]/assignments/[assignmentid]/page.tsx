"use client";

import { useParams } from "next/navigation";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { playfair, lora } from "@/utils/font";

export default function AssignmentViewPage() {
  const { assignmentid } = useParams();
  const assignmentId = Number(assignmentid);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "10" : "10";
  const { profile, loading, error } = useTeacherProfile(userId);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error || !profile) return <div className="p-6 text-red-500">Error: {error}</div>;

  const assignment = profile.assignments?.find((a) => a.id === assignmentId);
  if (!assignment) return <div className="p-6 text-gray-600">Assignment not found.</div>;

  const selectedTopic = assignment.title;
  const description = assignment.description;

  return (
    <div className={`flex min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-purple-100 relative ${lora.className}`}>
      <main className="flex-1 p-8">
        <Card className="p-6 shadow-lg bg-white max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold text-purple-800 mb-4 ${playfair.className}`}>
            {selectedTopic}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Created: {new Date(assignment.createdAt).toLocaleString()}
          </p>

          <ScrollArea className="flex-1 overflow-auto px-4 py-2">
            <div className={`prose prose-yellow max-w-none ${lora.className}`}>
              {description
                .split(/\r?\n/)
                .map((line, idx) => {
                  const match = line.match(/^\s*(\d+)\.\s+(.*)/);
                  if (match) {
                    const [, number, content] = match;
                    return (
                      <div key={idx} className="flex gap-2 items-start mb-2 ml-2">
                        <span className="font-semibold text-gray-800">{number}.</span>
                        <span className="text-gray-800">{content}</span>
                      </div>
                    );
                  } else if (line.trim() === "") {
                    return <br key={idx} />;
                  } else {
                    return (
                      <p key={idx} className="text-gray-700 mb-2 leading-relaxed">
                        {line}
                      </p>
                    );
                  }
                })}
            </div>
          </ScrollArea>
        </Card>
      </main>
    </div>
  );
}
