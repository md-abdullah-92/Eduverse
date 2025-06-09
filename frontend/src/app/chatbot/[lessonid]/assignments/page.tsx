"use client";

import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { playfair, lora } from "@/utils/font"; // ⬅️ updated font imports
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function AssignmentViewPage() {
  const { lessonId} = useParams();
  



 useEffect(() => {
     async function fetchNote() {
       try {
         const res = await fetch(`http://localhost:5001/api/assignment/lesson/${lessonId}`);
         const data = await res.json();
         setTitle(data[0]?.title || '');
         setMarkdown(data[0]?.description || '');
       } catch (err) {
         console.error('Failed to fetch note:', err);
       } finally {
         setLoading(false);
       }
     }
 
     fetchNote();
   }, [lessonId]);
 
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
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: (props) => <h1 className={`text-3xl font-bold mt-4 mb-3 text-yellow-800 ${playfair.className}`} {...props} />,
                  h2: (props) => <h2 className={`text-2xl font-bold mt-3 mb-2 text-yellow-700 ${playfair.className}`} {...props} />,
                  h3: (props) => <h3 className={`text-xl font-semibold mt-3 mb-2 text-yellow-600 ${playfair.className}`} {...props} />,
                  p: (props) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
                  ul: (props) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                  ol: (props) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                  li: (props) => <li className="text-gray-700 mb-1" {...props} />,
                  strong: (props) => <strong className="font-bold text-yellow-600" {...props} />,
                  em: (props) => <em className="italic" {...props} />,
                  del: (props) => <del className="line-through" {...props} />,
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneLight}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md my-3"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  blockquote: (props) => (
                    <blockquote className="border-l-4 border-yellow-300 pl-3 italic text-gray-600 my-3" {...props} />
                  ),
                }}
              >
                {description}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </Card>
      </main>
    </div>
  );
}
