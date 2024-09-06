'use client';

import React, { useState } from 'react';
import { KanbanBoard } from './Kanban';
import { DropResult } from '@hello-pangea/dnd';

export interface Task {
  id: string;
  title: string;
  tag?: string;
  assignee: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Column {
  title: string;
  teamMembers: TeamMember[];
  unassignedTasks: Task[];
}

export interface BoardData {
  [key: string]: Column;
}

interface ClientKanbanWrapperProps {
  initialData: BoardData;
}

export const ClientKanbanWrapper: React.FC<ClientKanbanWrapperProps> = ({ initialData }) => {
  const [boardData, setBoardData] = useState<BoardData>(initialData);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const [sourceColumnId, sourceTeamId] = source.droppableId.split('-');
    const [destColumnId, destTeamId] = destination.droppableId.split('-');

    const newBoardData = { ...boardData };

    // Helper function to get task array based on column and team ID
    const getTaskArray = (columnId: string, teamId: string) => {
      if (teamId === 'unassigned') {
        return newBoardData[columnId].unassignedTasks;
      }
      return newBoardData[columnId].teamMembers.find(m => m.id === teamId)!.tasks;
    };

    // Remove task from source
    const sourceTaskArray = getTaskArray(sourceColumnId, sourceTeamId);
    const [movedTask] = sourceTaskArray.splice(source.index, 1);

    // Add task to destination
    const destTaskArray = getTaskArray(destColumnId, destTeamId);
    destTaskArray.splice(destination.index, 0, { ...movedTask, assignee: destTeamId === 'unassigned' ? null : destTeamId });

    setBoardData(newBoardData);
  };

  const addNewTask = (columnId: string, task: Task) => {
    setBoardData(prevData => {
      const newData = { ...prevData };
      newData[columnId].unassignedTasks.push(task);
      return newData;
    });
  };



  return <KanbanBoard data={boardData} onDragEnd={handleDragEnd} onAddNewTask={addNewTask}  />;
};

