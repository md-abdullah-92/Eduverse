"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import { playfair, lora } from "@/utils/font"; // ⬅️ updated font imports
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

export default function SavedAssignments() {
  const router = useRouter();
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "12345" : "12345";
  const { profile, loading, error } = useTeacherProfile(userId ?? undefined);

  const [assignments, setAssignments] = useState<Assignments[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (profile?.assignments) {
      setAssignments(profile.assignments);
    }
  }, [profile]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/assignment/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAssignments((prev) => prev.filter((a) => a.id !== id));
      } else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.error}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleView = (id: number) => {
    router.push(`/teachers/${userId}/assignments/${id}`);
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-purple-100 relative">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>

      <main className={`flex-1 p-5 ml-20 ${lora.className}`}>
        <h1 className={`text-3xl font-bold text-purple-800 mb-6 ${playfair.className}`}>
          Saved Assignments
        </h1>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by assignment title..."
            className={`w-full max-w-md border-purple-300 shadow-sm focus:ring-2 focus:ring-purple-300 ${lora.className}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-gray-600">Loading assignments...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load assignments.</p>
        ) : filteredAssignments.length === 0 ? (
          <p className="text-gray-600">No matching assignments found.</p>
        ) : (
          <ScrollArea className="pr-2">
            <div className="space-y-6">
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className={`p-8 border border-purple-200 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 ${lora.className}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h2 className={`text-xl font-bold text-purple-800 mb-1 ${playfair.className}`}>
                        {assignment.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Created:{" "}
                        {assignment.createdAt
                          ? new Date(assignment.createdAt).toLocaleString()
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-purple-700 border-purple-300 hover:bg-purple-100"
                        onClick={() => handleView(assignment.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        className="hover:bg-red-700"
                        onClick={() => handleDelete(assignment.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
