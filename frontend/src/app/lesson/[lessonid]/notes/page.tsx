'use client';

import React, { useEffect, useState, ReactNode, HTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import SimpleMDE from 'react-simplemde-editor';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { playfair, workSans } from '@/utils/font';
import { useParams } from 'next/navigation';
import ChatWidget from '../../ChatWidget';
import LoadingIndicator from '@/components/ui_elements/loadingIndicator';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Placeholder Save Slide Button


// Save Study Note Logic

// Typed Code component for ReactMarkdown code block rendering
interface CodeProps extends HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

// Type guard to ensure the style is in the correct format
const getSyntaxHighlighterStyle = (style: typeof oneLight): Record<string, React.CSSProperties> => {
  // If it's already in the correct format, return it
  if (typeof style === 'object' && style !== null && !('color' in style)) {
    return style as Record<string, React.CSSProperties>;
  }
  // Fallback to empty object if the style doesn't match expected format
  return {};
};

const Code: React.FC<CodeProps> = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');

  if (!inline && match) {
    return (
      <SyntaxHighlighter
        style={getSyntaxHighlighterStyle(oneLight)}
        language={match[1]}
        PreTag="div"
        className="rounded-md my-2"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  }

  return (
    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  );
};

export default function LessonNotesPage() {
  const lessonId = useParams().lessonid as string;
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPreview] = useState(true);
  const [previewOnly, setPreviewOnly] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`http://localhost:5001/api/studynote/lesson/${lessonId}`);
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
  useEffect(() => {
    if (!title || !markdown) {
      const timer = setTimeout(() => {
        router.back();
      }, 4000); // 4 seconds before going back

      return () => clearTimeout(timer); // cleanup on unmount
    }
  }, [title, markdown, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-teal-50">
        <LoadingIndicator text='Loading...' />
      </div>
    );
  }


  

  if (!title || !markdown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="max-w-md text-center p-8 shadow-md bg-white">
            <div className="flex justify-center text-teal-600 mb-4">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Notes Found
            </h2>
            <p className="text-gray-600 text-sm">Redirecting you back...</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ReactMarkdown components with typed handlers
  const markdownComponents: Components = {
    h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className={`text-xl font-bold text-teal-800 ${playfair.className}`} {...props} />
    ),
    h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className={`text-lg font-semibold text-teal-700 ${playfair.className}`} {...props} />
    ),
    h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className={`text-base font-medium text-teal-600 ${playfair.className}`} {...props} />
    ),
    h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
      <h4 className={`text-sm font-medium text-teal-500 ${playfair.className}`} {...props} />
    ),
    strong: (props: HTMLAttributes<HTMLElement>) => (
      <strong className={`font-bold text-teal-600 ${playfair.className}`} {...props} />
    ),
    em: (props: HTMLAttributes<HTMLElement>) => <em className="italic text-yellow-500" {...props} />,
    blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="border-l-4 border-teal-300 pl-4 text-teal-600" {...props} />
    ),
    ul: (props: HTMLAttributes<HTMLUListElement>) => (
      <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
    ),
    ol: (props: HTMLAttributes<HTMLOListElement>) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
    ),
    hr: () => <hr className="border-teal-300 my-3" />,
    a: (props) => <a className="text-teal-600 underline" {...props} />,
    img: (props) => <img className="my-2" {...props} />,
    table: (props: HTMLAttributes<HTMLTableElement>) => (
      <table className="table-auto border-collapse border border-gray-300" {...props} />
    ),
    th: (props: HTMLAttributes<HTMLTableCellElement>) => (
      <th className="border border-gray-300 px-2 py-1 bg-teal-50 font-semibold" {...props} />
    ),
    td: (props: HTMLAttributes<HTMLTableCellElement>) => (
      <td className="border border-gray-300 px-2 py-1" {...props} />
    ),
    p: (props: HTMLAttributes<HTMLParagraphElement>) => (
      <p className="text-gray-700 leading-relaxed mb-2" {...props} />
    ),
    li: (props: HTMLAttributes<HTMLLIElement>) => <li className="text-gray-700 mb-1" {...props} />,
    code: Code,
  };

  return (
    <div className={`min-h-screen bg-teal-50 py-8 px-4 ${workSans.className}`}>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-2xl font-semibold text-teal-800 ${playfair.className}`}>Lesson Notes</h1>
            <p className="text-sm text-gray-600">Edit and preview your markdown notes.</p>
          </div>
         
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base border border-teal-300 bg-white"
            placeholder="Enter note title"
            disabled={previewOnly}
          />
        </div>

        <ChatWidget />

        {/* Main content */}
        {previewOnly ? (
          // FULL PREVIEW MODE
          <Card className="h-full flex flex-col border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center px-4 py-2 border-b text-base font-semibold text-teal-700 bg-teal-50">
              <span>Live Preview</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-teal-600 hover:underline"
                onClick={() => setPreviewOnly(false)}
              >
                Back to Editor
              </Button>
            </div>
            <ScrollArea className="flex-1 px-4 py-2 prose prose-base md:prose-lg max-w-none bg-white rounded-b-md">
              <h2 className={`text-xl font-semibold text-teal-700 mb-3 ${playfair.className}`}>{title}</h2>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {markdown}
              </ReactMarkdown>
            </ScrollArea>
          </Card>
        ) : (
          // SPLIT VIEW MODE
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Markdown Editor */}
            <Card className="h-full flex flex-col border border-gray-200 shadow-sm">
              <div className="px-4 py-2 border-b text-base font-semibold text-teal-700 bg-teal-50">
                Markdown Editor
              </div>
              <ScrollArea className="flex-1 px-4 py-2 bg-white rounded-b-md">
                <SimpleMDE
                  value={markdown}
                  onChange={setMarkdown}
                  className="h-full text-base"
                  options={{
                    spellChecker: false,
                    minHeight: '100%',
                    toolbar: [
                      'bold',
                      'italic',
                      'heading',
                      '|',
                      'quote',
                      'unordered-list',
                      'ordered-list',
                      '|',
                      'link',
                      'image',
                      '|',
                      'preview',
                      'guide',
                    ],
                  }}
                />
              </ScrollArea>
            </Card>

            {/* Live Preview */}
            {showPreview && (
              <Card
                className="h-[480px] flex flex-col border border-gray-200 shadow-sm cursor-pointer"
                onClick={() => setPreviewOnly(true)}
              >
                <div className="px-4 py-2 border-b text-base font-semibold text-teal-700 bg-teal-50">
                  Live Preview (Click to Expand)
                </div>
                <ScrollArea className="flex-1 px-4 py-2 prose prose-base md:prose-lg max-w-none bg-white rounded-b-md">
                  <h2 className={`text-xl font-semibold text-teal-700 mb-3 ${playfair.className}`}>{title}</h2>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {markdown}
                  </ReactMarkdown>
                </ScrollArea>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}