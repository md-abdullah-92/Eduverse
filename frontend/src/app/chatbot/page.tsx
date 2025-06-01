"use client";

import Chat from "@/app/chatbot/components/Chat";
import { Center } from "@mantine/core";
import { FC, useEffect, useRef, useState } from "react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const Home: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (message: Message) => {
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const assistantMessage =
        data.choices[0]?.message?.content ||
        "Sorry, I am unable to respond right now.";

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      { role: "assistant", content: `🌾 Welcome to Agribazaar! 🌾` },
    ]);
  };

  useEffect(() => {
    setMessages([
      { role: "assistant", content: `🌾 Welcome to Agribazaar! 🌾` },
    ]);
  }, []);

  return (
    <div
      style={{
        height: "89%",
        width: "100%",
        backgroundSize: "auto 06%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left 100px top",
        paddingTop: "100px",
        backgroundColor: "#e0f7fa",
      }}
    >
      <Center className="mx-auto max-w-[800px]" style={{ height: "89vh" }}>
        <div
          className="t-15 custom-scrollbar max-h-[80vh] overflow-y-auto"
          style={{ width: "100%" }}
        >
          <Chat
            messages={messages}
            loading={loading}
            onSend={handleSend}
            onReset={handleReset}
          />
          <div ref={messagesEndRef} />
        </div>
      </Center>
    </div>
  );
};

export default Home;
