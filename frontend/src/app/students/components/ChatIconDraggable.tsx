// components/ChatIconDraggable.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import ChatWidget from '@/components/ChatWidget'; // or just the icon
import classNames from 'classnames';

export default function ChatIconDraggable() {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const ref = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setDragging(true);
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, offset]);

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      className={classNames(
        'cursor-move fixed z-[150]',
        dragging ? 'opacity-70' : ''
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <ChatWidget />
    </div>
  );
}
