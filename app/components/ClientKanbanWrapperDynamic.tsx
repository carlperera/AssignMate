'use client';

import React, { useState } from 'react';
import { KanbanBoard } from './Kanban';
import { DropResult } from '@hello-pangea/dnd';
import { updateTaskStatus, updateTaskAssignee } from '../supabase/backendFunctions';

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

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

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

    // Update task status in the backend
    if (sourceColumnId !== destColumnId) {
      await updateTaskStatus(draggableId, destColumnId);
    }

    // Update task assignee in the backend
    if (sourceTeamId !== destTeamId) {
      await updateTaskAssignee(draggableId, destTeamId);
    }
  };

  const addNewTask = async (columnId: string, task: Task) => {
    setBoardData(prevData => {
      const newData = { ...prevData };
      const taskExists = newData[columnId].unassignedTasks.some(t => t.id === task.id);
      if (!taskExists) {
        newData[columnId].unassignedTasks.push(task);
      }
      return newData;
    });

    // Add task to the backend here
    // You'll need to implement a createTask function in backendFunctions.ts
  };

  const deleteTask = async (columnId: string, taskId: string) => {
    setBoardData(prevData => {
      const newData = { ...prevData };
      const column = newData[columnId];
      
      // Check unassigned tasks
      const unassignedIndex = column.unassignedTasks.findIndex(task => task.id === taskId);
      if (unassignedIndex !== -1) {
        column.unassignedTasks.splice(unassignedIndex, 1);
        return newData;
      }

      // Check team member tasks
      for (const member of column.teamMembers) {
        const taskIndex = member.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          member.tasks.splice(taskIndex, 1);
          return newData;
        }
      }

      return newData;
    });

    // Delete task from the backend
    // You'll need to implement a deleteTask function in backendFunctions.ts
  };

  return <KanbanBoard data={boardData} onDragEnd={handleDragEnd} onAddNewTask={addNewTask} onDeleteTask={deleteTask} />;
};