'use client';

import React from 'react';
import { KanbanBoard } from './Kanban';
import { DropResult } from '@hello-pangea/dnd';

interface ClientKanbanWrapperProps {
  data: any; // Replace 'any' with actual data type
}

export const ClientKanbanWrapper: React.FC<ClientKanbanWrapperProps> = ({ data }) => {
  const handleDragEnd = (result: DropResult) => {
    // Handle drag end logic here
    console.log(result);
  };

  return <KanbanBoard data={data} onDragEnd={handleDragEnd} />;
};