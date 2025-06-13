"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import solarizedlight from "react-syntax-highlighter/dist/esm/styles/prism/solarizedlight";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  MessageCircle,
  MessageSquare,
  Send,
  Download,
  Trash2,
  Copy,
} from "lucide-react";

type Message = {
  from: "user" | "assistant";
  text: string;
};

interface ChatWidgetProps {
  title?: string;
  apiEndpoint?: string;
  userId?: string;
}

export default function ChatWidget({
  title = "EduVerse Assistant",
  apiEndpoint = "/api/chat",
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("eduverse_chat") || "[]");
    }
    return [];
  });

  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("eduverse_chat_open") || "false");
    }
    return false;
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      return { 
        x: Math.max(20, window.innerWidth - 100), // 500px from right or 20px from left if screen is too small
        y: Math.max(20, window.innerHeight - 100) // 100px from bottom or 20px from top
      };
    }
    
    return { x: 20, y: 20 }; // Fallback position
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Save messages to localStorage on update
  useEffect(() => {
    localStorage.setItem("eduverse_chat", JSON.stringify(messages));
  }, [messages]);

  // Manage chat widget open state
  useEffect(() => {
    localStorage.setItem("eduverse_chat_open", JSON.stringify(isOpen));
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Mouse dragging behavior for widget repositioning
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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

    const userMessage = input;
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { from: "assistant", text: data.reply },
        ]);
        setIsLoading(false);
      }, 600);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "assistant", text: "❌ An error occurred. Please try again." },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const exportToPDF = async () => {
    const element = chatRef.current;
    if (!element) return;

    // Normalize modern CSS variables (e.g., oklch) for jsPDF
    document.querySelectorAll("*").forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.color.includes("oklch")) {
        (el as HTMLElement).style.color = "#000";
      }
      if (style.backgroundColor.includes("oklch")) {
        (el as HTMLElement).style.backgroundColor = "#fff";
      }
    });

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("chat.pdf");
  };

  const exportToMarkdown = () => {
    const markdown = messages
      .map((msg) =>
        msg.from === "user"
          ? `**You:** ${msg.text}`
          : `**Assistant:** ${msg.text}`
      )
      .join("\n\n");

    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chat.md";
    link.click();
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("eduverse_chat");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      ref={widgetRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 150,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="absolute bottom-full right-0 mb-4 w-[500px] h-[600px] flex flex-col rounded-2xl border border-gray-300 bg-white shadow-lg"
          >
            {/* Header */}
            <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <span className="font-medium text-gray-800 text-sm">
                  {title}
                </span>
              </div>
              <div className="flex gap-2 text-gray-600 text-xs">
                <button onClick={exportToPDF} title="Download PDF">
                  <Download size={16} />
                </button>
                <button onClick={exportToMarkdown} title="Download Markdown">
                  .md
                </button>
                <button onClick={clearChat} title="Clear Chat">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close Chat">
                  ✕
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-sm bg-white"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`group flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[80%] px-3 py-2 rounded-md shadow-sm whitespace-pre-wrap ${
                      msg.from === "user"
                        ? "bg-blue-200 text-blue-900"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          const code = String(children).replace(/\n$/, "");

                          if (!inline && match) {
                            return (
                              <div className="relative group">
                                <button
                                  onClick={() => copyToClipboard(code)}
                                  className="absolute top-2 right-2 text-xs text-gray-500 hover:text-black opacity-0 group-hover:opacity-100"
                                  title="Copy Code"
                                >
                                  <Copy size={14} />
                                </button>
                                <SyntaxHighlighter
                                  style={solarizedlight}
                                  language={match[1]}
                                  PreTag="div"
                                  showLineNumbers
                                  customStyle={{
                                    borderRadius: "0.5rem",
                                    padding: "1rem",
                                    fontSize: "0.875rem",
                                    background: "#fdf6e3",
                                  }}
                                  {...props}
                                >
                                  {code}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }

                          return (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                              {children}
                            </code>
                          );
                        },
                        strong: ({ children }) => (
                          <strong className="font-semibold text-black">
                            {children}
                          </strong>
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

                    {msg.from === "assistant" && (
                      <button
                        onClick={() => copyToClipboard(msg.text)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-gray-700"
                        title="Copy Message"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-gray-400 italic">
                  Assistant is typing...
                </div>
              )}
            </div>

            {/* Input Bar */}
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

      {/* Toggle Chat Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute bottom-0 right-0 bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white p-3 rounded-full shadow-xl"
        aria-label="Toggle Chat"
      >
        <MessageCircle size={20} />
      </motion.button>
    </div>
  );
}
