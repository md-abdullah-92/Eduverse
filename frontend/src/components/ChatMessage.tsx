"use client";

import { FC } from 'react';
import { Message } from '@/types/index';

const ChatMessage: FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`flex flex-col ${message.role === 'assistant' ? 'items-start' : 'items-end'}`}>
      <div
        className={`flex items-center ${message.role === 'assistant' ? 'message-background text-neutral-900' : 'message-background-user text-white'} rounded-2xl px-3 py-2 max-w-[67%] whitespace-pre-wrap`}
        style={{ overflowWrap: 'anywhere' }}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;
