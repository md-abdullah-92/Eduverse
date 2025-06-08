"use client";
import { Lesson } from "@/utils/types";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

import { Edit2, GripVertical, Trash2 } from "lucide-react";
import { useMemo } from "react";

interface LessonListProps {
  lessons: Lesson[];
  onEdit: (lessonId: number) => void;
  onDelete: (lessonId: number) => void;
  onReorder: (reorderedLessons: Lesson[]) => void;
}

  
  export default function LessonList({
  lessons,
  onEdit,
  onDelete,
  onReorder,
}: LessonListProps) {
  // Sort lessons by orderIndex
  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [lessons]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // If item wasn't moved, do nothing
    if (result.destination.index === result.source.index) return;

    // Create a new array of lessons in the new order
    const items = Array.from(sortedLessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order indices and save
    onReorder(items);
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="mb-2">No lessons added yet</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="lessons">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {sortedLessons.map((lesson, index) => (
              <Draggable key={lesson.id} draggableId={lesson.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`p-3 rounded-md border ${
                      snapshot.isDragging
                        ? "bg-teal-50 border-teal-300 shadow-md"
                        : "bg-white border-gray-200"
                    } transition-colors`}
                  >
                    <div className="flex items-center">
                      {/* Drag Handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical size={18} />
                      </div>

                      {/* Number Badge */}
                      <div className="h-6 w-6 flex items-center justify-center bg-teal-100 text-teal-700 rounded-full mr-3 text-sm">
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {lesson.title}
                        </h4>
                        {lesson.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {lesson.description}
                          </p>
                        )}

                        {/* Indicators */}
                        <div className="flex mt-2 space-x-2">                        
                          {lesson.videoUrl && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Video
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(lesson.id!)}
                          className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
                          aria-label="Edit lesson"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(lesson.id!)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Delete lesson"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
