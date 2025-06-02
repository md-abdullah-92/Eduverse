"use client";

import { FC } from "react";
import ChatInput from "../../../components/ChatInput";
import ChatLoader from "../../../components/ChatLoader";
import ChatMessage from "../../../components/ChatMessage";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const Chat: FC<{
  messages: Message[];
  loading: boolean;
  onSend: (message: Message) => void;
  onReset: () => void;
}> = ({ messages, loading, onSend, onReset }) => {
  return (
    <div className="mt-15">
      <div className="text-center text-2xl font-bold mb-4 text-green-600">
        Get expert advice tailored to your farming needs with Agribazaar&apos;s
        AI assistant.
      </div>

      <div
        className="flex flex-col rounded-lg px-4 py-4 shadow-lg border border-gray-300"
        style={{ backgroundColor: "#f9f9f9" }}
      >
        {messages.map((message, index) => (
          <div key={index} className="my-2">
            <ChatMessage message={message} />
          </div>
        ))}

        {loading && (
          <div className="my-2">
            <ChatLoader />
          </div>
        )}

        <div className="mt-4 sm:mt-6">
          <ChatInput onSend={onSend} />
        </div>
      </div>

      <div className="text-center mt-4 flex justify-center space-x-4">
        <button onClick={onReset}>Clear Chat</button>
        <button
          onClick={() => (window.location.href = "/ai-bot")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors duration-300"
        >
          Chat For Specific Queries
        </button>
      </div>
    </div>
  );
};

export default Chat;
