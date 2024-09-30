'use client';

import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './Kanban';
import { DropResult } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {TaskPriority} from '@/supabase/databaseTypes'

import { 
  fetchProjectById,
  fetchTasksForProject,
  fetchAllUserTeamForTeam,
  fetchProjectTaskStatusById as fetchProjectTaskStatusByProjectId,


 } from '@/supabase/backendFunctions';
export interface Task {
  id: string;
  title: string;
  tag?: TaskPriority;
  assignee: string | null;
  dueDate?: string | null;
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

interface ProjectId {
  projectId: string;
}

export const ClientKanbanWrapper: React.FC<ProjectId> = ({ projectId }) => {
  console.log(projectId)

  retun
//   const [boardData, setBoardData] = useState<BoardData>({ columns: [], columnOrder: [] });
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }
  
//   //get the initial data for the project
//   useEffect(() => {
//     const fetchBoardData = async () => {
//       setIsLoading(true);
//       try {
//         const { data: project, error: projectError } = await fetchProjectById(projectId);
//         if (!project || projectError) {
//           throw new Error('Project not found');
//         }

//         const { data: tasks } = await fetchTasksForProject(projectId);
//         const { data: teamMembers } = await fetchAllUserTeamForTeam(project.team_id);
//         const { data: projectTaskStatuses } = await fetchProjectTaskStatusByProjectId(projectId);

//         const columns: Column[] = projectTaskStatuses?.map((status: ProjectTaskStatus)=> ({
//           project_task_status_id: status.project_task_status_id,
//           proj_status_name: status.proj_status_name || 'Untitled',
//           tasks: []
//         })) || [];

//         const columnOrder = columns.map(column => column.project_task_status_id);

//         if (tasks) {
//           tasks.forEach(task => {
//             const columnIndex = columns.findIndex(col => col.project_task_status_id === task.task_status);
//             if (columnIndex !== -1) {
//               columns[columnIndex].tasks.push(task);
//             }
//           });
//         }

//         setBoardData({ columns, columnOrder });
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An unexpected error occurred');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchBoardData();

//     const taskSubscription = supabase
//       .channel('task-changes')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'task', filter: `proj_id=eq.${projectId}` }, handleTaskChange)
//       .subscribe();

//     const statusSubscription = supabase
//       .channel('status-changes')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'project_task_status', filter: `proj_id=eq.${projectId}` }, handleStatusChange)
//       .subscribe();

//     return () => {
//       supabase.removeChannel(taskSubscription);
//       supabase.removeChannel(statusSubscription);
//     };
//   }, [projectId]);


//   const [boardData, setBoardData] = useState<BoardData>(initialData);
//   const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
//   const [newColumnTitle, setNewColumnTitle] = useState('');
//   const [sortOption, setSortOption] = useState<'none' | 'dueDate'>('none');

// const handleDragEnd = (result: DropResult) => {
//   const { source, destination, type } = result;

//   if (!destination) return;

//   if (type === 'COLUMN') {
//     // Handle column reordering
//     const entries = Object.entries(boardData);
//     const [removed] = entries.splice(source.index, 1);
//     entries.splice(destination.index, 0, removed);
//     const reorderedBoardData = Object.fromEntries(entries);
//     setBoardData(reorderedBoardData);
//   } else {
//     // Handle task reordering
//     const [sourceColumnId, sourceTeamId] = source.droppableId.split('-');
//     const [destColumnId, destTeamId] = destination.droppableId.split('-');
//     const newBoardData = { ...boardData };

//     // Helper function to get task array based on column and team ID
//     const getTaskArray = (columnId: string, teamId: string) => {
//       if (teamId === 'unassigned') {
//         return newBoardData[columnId].unassignedTasks;
//       }
//       const member = newBoardData[columnId].teamMembers.find(m => m.id === teamId);
//       return member ? member.tasks : [];
//     };

//     // Remove task from source
//     const sourceTaskArray = getTaskArray(sourceColumnId, sourceTeamId);
//     const [movedTask] = sourceTaskArray.splice(source.index, 1);

//     // Add task to destination
//     const destTaskArray = getTaskArray(destColumnId, destTeamId);
//     const updatedTask = { 
//       ...movedTask, 
//       assignee: destTeamId === 'unassigned' ? null : destTeamId 
//     };
//     destTaskArray.splice(destination.index, 0, updatedTask);

//     // If the destination is not 'unassigned', ensure the task is assigned to the correct team member
//     if (destTeamId !== 'unassigned') {
//       const destMember = newBoardData[destColumnId].teamMembers.find(m => m.id === destTeamId);
//       if (destMember) {
//         destMember.tasks = destTaskArray;
//       }
//     } else {
//       newBoardData[destColumnId].unassignedTasks = destTaskArray;
//     }

//     setBoardData(newBoardData);
//   }

//   };

//   const addNewTask = (columnId: string, task: Task) => {
//     setBoardData(prevData => {
//         const newData = { ...prevData };
        
//         // Check if the task already exists
//         const taskExists = newData[columnId].unassignedTasks.some(t => t.id === task.id);
//         if (!taskExists) {
//         newData[columnId].unassignedTasks.push(task);
//         }
//         return newData;
//     });
//   };

//     const editTask = (columnId: string, taskId: string, updatedTask: Partial<Task>) => {
//     setBoardData(prevData => {
//       const newData = { ...prevData };
//       const column = newData[columnId];
      
//       // Check unassigned tasks
//       let taskIndex = column.unassignedTasks.findIndex(task => task.id === taskId);
//       if (taskIndex !== -1) {
//         column.unassignedTasks[taskIndex] = { ...column.unassignedTasks[taskIndex], ...updatedTask };
//         return newData;
//       }

//       // Check team member tasks
//       for (const member of column.teamMembers) {
//         taskIndex = member.tasks.findIndex(task => task.id === taskId);
//         if (taskIndex !== -1) {
//           member.tasks[taskIndex] = { ...member.tasks[taskIndex], ...updatedTask };
//           return newData;
//         }
//       }

//       return newData;
//     });
//   };

//   const deleteTask = (columnId: string, taskId: string) => {
//     setBoardData(prevData => {
//       const newData = { ...prevData };
//       const column = newData[columnId];
      
//       // Check unassigned tasks
//       const unassignedIndex = column.unassignedTasks.findIndex(task => task.id === taskId);
//       if (unassignedIndex !== -1) {
//         column.unassignedTasks.splice(unassignedIndex, 1);
//         return newData;
//       }

//       // Check team member tasks
//       for (const member of column.teamMembers) {
//         const taskIndex = member.tasks.findIndex(task => task.id === taskId);
//         if (taskIndex !== -1) {
//           member.tasks.splice(taskIndex, 1);
//           return newData;
//         }
//       }

//       return newData;
//     });
//   };

//   const addNewColumn = () => {
//   if (newColumnTitle.trim()) {
//     setBoardData(prevData => {
//       // Get all unique team members from existing columns
//       const allTeamMembers = Array.from(new Set(
//         Object.values(prevData).flatMap(column => 
//           column.teamMembers.map(member => JSON.stringify({ id: member.id, name: member.name }))
//         )
//       )).map(memberString => JSON.parse(memberString)); // make sure we only add unique team members (avoid duplicates)


//       return {
//         ...prevData,
//         [newColumnTitle.toLowerCase().replace(/\s+/g, '-')]: {
//           title: newColumnTitle,
//           teamMembers: allTeamMembers.map(member => ({
//             id: member.id,
//             name: member.name,
//             tasks: []
//           })),
//           unassignedTasks: []
//         }
//       };
//     });
//     setNewColumnTitle('');
//     setIsAddColumnDialogOpen(false);
//   }

//   };

//   const handleAddNewColumnClick = () => {
//   setIsAddColumnDialogOpen(true);
//   };

//   const sortTasks = (tasks: Task[]) => {
//     if (sortOption === 'dueDate') {
//       return [...tasks].sort((a, b) => {
//         if (!a.dueDate) return 1;
//         if (!b.dueDate) return -1;
//         return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
//       });
//     }
//     return tasks;
//   };

//   const sortedBoardData = Object.entries(boardData).reduce((acc, [columnId, column]) => {
//     const sortedColumn = {
//       ...column,
//       teamMembers: column.teamMembers.map(member => ({
//         ...member,
//         tasks: sortTasks(member.tasks)
//       })),
//       unassignedTasks: sortTasks(column.unassignedTasks)
//     };
//     acc[columnId] = sortedColumn;
//     return acc;
//   }, {} as BoardData);


// return (
//     <>
//       <KanbanBoard
//         data={sortedBoardData}
//         onDragEnd={handleDragEnd}
//         onAddNewTask={addNewTask}
//         onEditTask={editTask}
//         onDeleteTask={deleteTask}
//         onAddNewColumn={handleAddNewColumnClick}
//         onSortChange={setSortOption}
//         currentSort={sortOption}

//       />
//       <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add New Column</DialogTitle>
//           </DialogHeader>
//           <Input
//             value={newColumnTitle}
//             onChange={(e) => setNewColumnTitle(e.target.value)}
//             placeholder="Enter column title"
//           />
//           <DialogFooter>
//             <Button onClick={addNewColumn}>Add Column</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );



};
