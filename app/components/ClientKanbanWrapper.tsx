'use client';

import React, { useState } from 'react';
import { KanbanBoard } from './Kanban';
import { DropResult } from '@hello-pangea/dnd';

interface Task {
  id: string;
  title: string;
  tag: string;
  assignee?: string;
}

interface Column {
  title: string;
  tasks: Task[];
}

interface BoardData {
  [key: string]: Column;
}

interface ClientKanbanWrapperProps {
  initialData: BoardData;
}

export const ClientKanbanWrapper: React.FC<ClientKanbanWrapperProps> = ({ initialData }) => {
  const [boardData, setBoardData] = useState<BoardData>(initialData);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // If there's no destination, we don't need to do anything
    if (!destination) return;

    // If the source and destination are the same, we don't need to do anything
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Make a copy of the source column
    const sourceColumn = {...boardData[source.droppableId]};
    // Make a copy of the destination column
    const destColumn = {...boardData[destination.droppableId]};
    // Remove the task from the source column
    const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
    // Insert the task into the destination column
    destColumn.tasks.splice(destination.index, 0, movedTask);

    // Update the state with the new data
    setBoardData({
      ...boardData,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });
  };

  return <KanbanBoard data={boardData} onDragEnd={handleDragEnd} />;
};