'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import SimpleMDE from 'react-simplemde-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { playfair, workSans } from '@/utils/font';
import { useParams } from 'next/navigation';


// Placeholder Save Slide Button
const SaveSlideButton = ({ title }: { title: string }) => (
  <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
    Slide
  </Button>
);

// Save Study Note Logic
const saveStudyNote = (title: string, content: string) => {
  console.log('Saving:', title, content);
};

export default function LessonNotesPage() {
  const lessonId = useParams().lessonid as string;
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  console.log('Lesson ID:', lessonId);

  // New state for full preview mode toggle
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

  if (loading) {
    return <div className={`p-6 text-gray-600 text-lg ${workSans.className}`}>Loading lesson notes...</div>;
  }

  // Markdown renderers reused
  const markdownComponents = {
    h1: (props: any) => <h1 className={`text-xl font-bold text-teal-800 ${playfair.className}`} {...props} />,
    h2: (props: any) => <h2 className={`text-lg font-semibold text-teal-700 ${playfair.className}`} {...props} />,
    h3: (props: any) => <h3 className={`text-base font-medium text-teal-600 ${playfair.className}`} {...props} />,
    h4: (props: any) => <h4 className={`text-sm font-medium text-teal-500 ${playfair.className}`} {...props} />,
    strong: (props: any) => <strong className={`font-bold text-teal-600 ${playfair.className}`} {...props} />,
    em: (props: any) => <em className="italic text-yellow-500" {...props} />,
    blockquote: (props: any) => <blockquote className="border-l-4 border-teal-300 pl-4 text-teal-600" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
    hr: () => <hr className="border-teal-300 my-3" />,
    a: (props: any) => <a className="text-teal-600 underline" {...props} />,
    img: (props: any) => <img className="my-2" {...props} />,
    table: (props: any) => <table className="table-auto border-collapse border border-gray-300" {...props} />,
    th: (props: any) => <th className="border border-gray-300 px-2 py-1 bg-teal-50 font-semibold" {...props} />,
    td: (props: any) => <td className="border border-gray-300 px-2 py-1" {...props} />,
    p: (props: any) => <p className="text-gray-700 leading-relaxed mb-2" {...props} />,
    li: (props: any) => <li className="text-gray-700 mb-1" {...props} />,
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneLight}
          language={match[1]}
          PreTag="div"
          className="rounded-md my-2"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
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
          <div className="flex gap-2 mt-1">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
              disabled={previewOnly} // Disable toggle when in full preview mode
            >
              {showPreview ? <EyeOff className="mr-2 w-4 h-4" /> : <Eye className="mr-2 w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <SaveSlideButton title={title} />
            <Button
              onClick={() => saveStudyNote(title, markdown)}
              variant="outline"
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
              disabled={previewOnly} // Disable save when in full preview mode (optional)
            >
              Save
            </Button>
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
            disabled={previewOnly} // Disable editing title in previewOnly mode
          />
        </div>

        {/* Main content */}
        {previewOnly ? (
          // FULL PREVIEW MODE
          <Card className="h- full flex flex-col border border-gray-200 shadow-sm">
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
              <div className="px-4 py-2 border-b text-base font-semibold text-teal-700 bg-teal-50">Markdown Editor</div>
              <ScrollArea className="flex-1 px-4 py-2 bg-white rounded-b-md">
                <SimpleMDE
                  value={markdown}
                  onChange={setMarkdown}
                  className="h-full text-base"
                  options={{
                    spellChecker: false,
                    minHeight: '100%',
                    toolbar: [
                      'bold', 'italic', 'heading', '|',
                      'quote', 'unordered-list', 'ordered-list', '|',
                      'link', 'image', '|', 'preview', 'guide',
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
                <div className="px-4 py-2 border-b text-base font-semibold text-teal-700 bg-teal-50">Live Preview (Click to Expand)</div>
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
