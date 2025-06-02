"use client"

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  type: "MCQ" | "CQ";
  question: string;
  options?: string[];
  answer?: string;
}

const mockQuizData: QuizQuestion[] = [
  {
    id: "q1",
    type: "MCQ",
    question: "What does the following line do in pandas?\n\n`df['G1'] = df['G1'].mean()`",
    options: [
      "It adds a new level named 'G1' to the index.",
      "It calculates the average of the 'G1' level.",
    ],
  },
  {
    id: "q2",
    type: "CQ",
    question: "What is the purpose of the `df.columns` method in pandas?",
    answer:
      "The `df.columns` method is used to retrieve the names of the columns in a pandas DataFrame. It returns an object containing the column names, which can be helpful for understanding the structure of the DataFrame and accessing specific columns.",
  },
  {
    id: "q3",
    type: "CQ",
    question: "How do you obtain the index of a DataFrame using pandas?",
    answer:
      "You can obtain the index of a DataFrame using the `df.index` method. This returns an object representing the index, which can be modified or used for analysis.",
  },
];

export default function GeneratedQuizSection() {
  const [showTypes, setShowTypes] = useState({ MCQ: true, CQ: true });
  const [filterText, setFilterText] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>(mockQuizData);

  const toggleType = (type: "MCQ" | "CQ") => {
    setShowTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSelect = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selectedQuestions.length === 0) {
      toast.warning("Please select at least one question to delete.");
      return;
    }
    setQuestions((prev) => prev.filter((q) => !selectedQuestions.includes(q.id)));
    setSelectedQuestions([]);
    toast.success("Selected questions deleted successfully.");
  };

  const filteredQuestions = questions.filter(
    (q) =>
      showTypes[q.type] &&
      q.question.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="mt-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <Input
          placeholder="🔍 Filter by document or keyword"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full md:w-1/3"
        />
        <div className="flex gap-4 items-center mt-3 md:mt-0">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={showTypes.MCQ}
              onCheckedChange={() => toggleType("MCQ")}
            />
            MCQs
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={showTypes.CQ}
              onCheckedChange={() => toggleType("CQ")}
            />
            CQs
          </label>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-4 bg-white space-y-4 shadow">
        {filteredQuestions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No questions to show.</p>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="border rounded-md p-4 space-y-2 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={selectedQuestions.includes(q.id)}
                    onCheckedChange={() => handleSelect(q.id)}
                  />
                  <div>
                    <p className="text-sm font-medium whitespace-pre-wrap">{q.question}</p>
                    {q.type === "MCQ" && q.options && (
                      <ul className="pl-6 mt-2 list-disc text-sm text-muted-foreground">
                        {q.options.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    )}
                    {q.type === "CQ" && q.answer && (
                      <div className="mt-2 p-2 bg-gray-100 text-sm rounded text-green-700 border border-green-300">
                        {q.answer}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-purple-600 font-semibold">{q.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}