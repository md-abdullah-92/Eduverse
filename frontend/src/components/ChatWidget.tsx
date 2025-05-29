'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MessageCircle, MessageSquare, Send, Download, Trash2, Copy } from 'lucide-react';

type Message = {
  from: 'user' | 'bot';
  text: string;
};

export default function ChatWidget({
  title = 'Eduverse Assistant',
  apiEndpoint = '/api/chat',
}) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('eduverse_chat') || '[]');
    }
    return [];
  });

  const [open, setOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('eduverse_chat_open') || 'false');
    }
    return false;
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [position, setPosition] = useState({ x: 30, y: 760 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('eduverse_chat', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('eduverse_chat_open', JSON.stringify(open));
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, offset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setDragging(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { from: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);
        setLoading(false);
      }, 600);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: '❌ Something went wrong. Please try again.' },
      ]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  const exportToPDF = async () => {
    const element = chatContainerRef.current;
    if (!element) return;

    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.color.includes('oklch')) {
        (el as HTMLElement).style.color = '#000';
      }
      if (style.backgroundColor.includes('oklch')) {
        (el as HTMLElement).style.backgroundColor = '#fff';
      }
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('chat.pdf');
  };

  const exportToMarkdown = () => {
    const content = messages
      .map((msg) => (msg.from === 'user' ? `**You:** ${msg.text}` : `**Assistant:** ${msg.text}`))
      .join('\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat.md';
    link.click();
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('eduverse_chat');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      ref={widgetRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 150,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            className="absolute bottom-full mb-4 w-[500px] h-[600px] flex flex-col rounded-2xl border border-gray-300 bg-white shadow-lg"
          >
            <div className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium border-b border-gray-300 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center shadow-md">
                  <MessageSquare size={16} />
                </div>
                <span>{title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <button onClick={exportToPDF} title="Export to PDF"><Download size={16} /></button>
                <button onClick={exportToMarkdown} title="Export to Markdown">.md</button>
                <button onClick={clearChat} title="Clear chat"><Trash2 size={16} /></button>
                <button onClick={() => setOpen(false)} title="Close">✕</button>
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-sm bg-white"
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={`group flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative max-w-[80%] px-3 py-2 rounded-md shadow-sm text-sm whitespace-pre-wrap ${
                    msg.from === 'user' ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');

                          if (!inline && match) {
                            return (
                              <div className="relative group">
                                <button
                                  onClick={() => navigator.clipboard.writeText(codeString)}
                                  className="absolute top-2 right-2 text-xs text-gray-500 hover:text-black opacity-0 group-hover:opacity-100 transition"
                                  title="Copy code"
                                >
                                  <Copy size={14} />
                                </button>
                                <SyntaxHighlighter
                                  style={solarizedlight}
                                  language={match[1]}
                                  PreTag="div"
                                  showLineNumbers
                                  customStyle={{
                                    borderRadius: '0.5rem',
                                    padding: '1rem',
                                    fontSize: '0.875rem',
                                    background: '#fdf6e3',
                                    overflowX: 'auto',
                                  }}
                                  {...props}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }

                          return (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                        strong: ({ children }) => (
                          <strong className="font-semibold text-black">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-gray-700">{children}</em>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 text-gray-800">{children}</p>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                    {msg.from === 'bot' && (
                      <button
                        className="absolute right-1 top-1 opacity-0 group-hover:opacity-200 text-xs text-gray-400 hover:text-gray-700"
                        onClick={() => copyToClipboard(msg.text)}
                        title="Copy"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && <div className="text-gray-400 italic">Assistant is typing...</div>}
            </div>

            <div className="border-t border-gray-200 p-3 bg-white flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Send
                className="text-purple-600 hover:text-purple-800 cursor-pointer"
                size={32}
                onClick={sendMessage}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => setOpen(!open)}
        className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white p-3 rounded-full shadow-xl"
        aria-label="Toggle Chat"
      >
        <MessageCircle size={20} />
      </motion.button>
    </div>
  );
}
