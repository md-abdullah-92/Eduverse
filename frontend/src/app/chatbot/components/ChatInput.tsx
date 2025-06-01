"use client";

import { FC, useState, useRef, useEffect, KeyboardEvent } from 'react';
import { IconArrowUp } from "@tabler/icons-react";
import { Group } from '@mantine/core';
import { Message } from '@/types/index';

const ChatInput: FC<{ onSend: (message: Message) => void }> = ({ onSend }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 4000) {
      alert('Message limit is 4000 characters');
      return;
    }
    setContent(e.target.value);
  };

  const handleSend = () => {
    if (!content.trim()) {
      alert('Please enter a message');
      return;
    }
    onSend({ role: 'user', content });
    setContent('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className="min-h-[44px] rounded-lg pl-4 pr-12 py-2 w-full input-border-color"
        style={{ resize: 'none' }}
        placeholder="Type a message..."
        value={content}
        rows={1}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <Group style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <button onClick={handleSend}>
          <IconArrowUp className="absolute right-3 bottom-3 h-8 w-8 hover:cursor-pointer rounded-full p-1 text-white hover:opacity-80" />
        </button>
      </Group>
    </div>
  );
};

export default ChatInput;
