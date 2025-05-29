// app/components/ChatWidget.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, something went wrong. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle chat widget"
        className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 transition-colors text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 z-50"
      >
        💬
      </button>

      {/* Chat Panel with Animation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-6 w-80 h-96 bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-3 text-center font-semibold text-sm">
              Eduverse Assistant
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 p-3 overflow-y-auto text-sm space-y-4 bg-gray-50"
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {msg.from === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                        🤖
                      </div>
                    )}
                    <div
                      className={`p-2 rounded-lg ${
                        msg.from === "user"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    {msg.from === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 text-black flex items-center justify-center text-xs">
                        🧑
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && <div className="text-left text-gray-400 italic">Assistant is typing...</div>}
            </div>

            {/* Input */}
            <div className="flex border-t border-gray-200">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
                aria-label="Message input"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 hover:bg-blue-700 transition-colors"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
