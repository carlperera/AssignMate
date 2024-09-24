'use client';

import React, { useState } from 'react';
import { KanbanBoard } from './Kanban';
import { DropResult } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


export interface Task {
  id: string;
  title: string;
  tag?: string;
  assignee: string | null;
  dueDate?: string;
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
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [sortOption, setSortOption] = useState<'none' | 'dueDate'>('none');

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
        
        // Check if the task already exists
        const taskExists = newData[columnId].unassignedTasks.some(t => t.id === task.id);
        if (!taskExists) {
        newData[columnId].unassignedTasks.push(task);
        }
        return newData;
    });
  };

    const editTask = (columnId: string, taskId: string, updatedTask: Partial<Task>) => {
    setBoardData(prevData => {
      const newData = { ...prevData };
      const column = newData[columnId];
      
      // Check unassigned tasks
      let taskIndex = column.unassignedTasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        column.unassignedTasks[taskIndex] = { ...column.unassignedTasks[taskIndex], ...updatedTask };
        return newData;
      }

      // Check team member tasks
      for (const member of column.teamMembers) {
        taskIndex = member.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          member.tasks[taskIndex] = { ...member.tasks[taskIndex], ...updatedTask };
          return newData;
        }
      }

      return newData;
    });
  };

  const deleteTask = (columnId: string, taskId: string) => {
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
  };

  const addNewColumn = () => {
    setIsAddColumnDialogOpen(true);
  };

  const handleAddNewColumn = () => {
    if (newColumnTitle.trim()) {
      setBoardData(prevData => ({
        ...prevData,
        [newColumnTitle.toLowerCase().replace(/\s+/g, '-')]: {
          title: newColumnTitle,
          teamMembers: [],
          unassignedTasks: []
        }
      }));
      setNewColumnTitle('');
      setIsAddColumnDialogOpen(false);
    }
  };

  const sortTasks = (tasks: Task[]) => {
    if (sortOption === 'dueDate') {
      return [...tasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }
    return tasks;
  };

  const sortedBoardData = Object.entries(boardData).reduce((acc, [columnId, column]) => {
    const sortedColumn = {
      ...column,
      teamMembers: column.teamMembers.map(member => ({
        ...member,
        tasks: sortTasks(member.tasks)
      })),
      unassignedTasks: sortTasks(column.unassignedTasks)
    };
    acc[columnId] = sortedColumn;
    return acc;
  }, {} as BoardData);





return (
    <>
      <KanbanBoard
        data={sortedBoardData}
        onDragEnd={handleDragEnd}
        onAddNewTask={addNewTask}
        onEditTask={editTask}
        onDeleteTask={deleteTask}
        onAddNewColumn={addNewColumn}
        onSortChange={setSortOption}
        currentSort={sortOption}

      />
      <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <Input
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="Enter column title"
          />
          <DialogFooter>
            <Button onClick={handleAddNewColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );



};

