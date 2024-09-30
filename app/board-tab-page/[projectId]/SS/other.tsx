"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  fetchProjectTaskStatusById,
  fetchTasksForProject,
  fetchAllUserTeamForTeam,
  createProjectTaskStatus,
  createTask,
  updateTaskStatus,
  updateTaskAssignee,
  deleteTask,
  fetchProjectById
} from '@/supabase/backendFunctions';
import supabase from '@/supabase/supabaseClient';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';



interface Task {
  id: string;
  title: string;
  assignee: string | null;
  dueDate: string | null;
  tag: string | null;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface BoardData {
  columns: Column[];
  columnOrder: string[];
}




export default function BoardTabPage({ params }: { params: { projectId: string } }) {
  const [boardData, setBoardData] = useState<BoardData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewStatusDialogOpen, setIsNewStatusDialogOpen] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [currentStatusId, setCurrentStatusId] = useState<string | null>(null);

  const projectId: string = params.projectId;
  
  useEffect(() => {
    const fetchBoardData = async () => {
      setIsLoading(true);
      try {

        //get the specific project
        const { data: project, error: projectError } = await fetchProjectById(projectId);
        if (!project || projectError) {
          throw new Error('Project not found');
        }

        //fetch all the tasks for a project
        const { data: tasks, error: tasksError} = await fetchTasksForProject(projectId);

        if (tasksError) {
          throw new Error('Tasks not found');
        }

        //fetch all assignees for a project
        const { data: teamMembers, error: teamMemberError} = await fetchAllUserTeamForTeam(project.team_id);


        if (teamMemberError) {
          throw new Error('Team members not found');
        }
        
        //fetch all task statuses for the project
        const { data: projectTaskStatuses, error: projectTaskStatusesError} = await fetchProjectTaskStatusById(projectId);

        const newBoardData: BoardData = {};

        if (projectTaskStatuses && !projectTaskStatusesError) {
          for (const status of projectTaskStatuses) {
            newBoardData[status.id] = {
              title: status.proj_status_name || 'Untitled',
              teamMembers: [],
              unassignedTasks: []
            };
          }
        }

        if (teamMembers) {
          for (const column of Object.values(newBoardData)) {
            column.teamMembers = teamMembers.map(member => ({
              id: member.user_id,
              name: member.user_id,
              tasks: []
            }));
          }
        }

        if (tasks) {
          for (const task of tasks) {
            const column = newBoardData[task.task_status || 'default'];
            if (!column) continue;

            const taskData: Task = {
              id: task.task_id,
              title: task.task_desc || 'Untitled Task',
              assignee: task.task_assignee,
              dueDate: task.task_deadline,
              tag: task.task_priority
            };

            if (task.task_assignee) {
              const teamMember = column.teamMembers.find(m => m.id === task.task_assignee);
              if (teamMember) {
                teamMember.tasks.push(taskData);
              } else {
                column.unassignedTasks.push(taskData);
              }
            } else {
              column.unassignedTasks.push(taskData);
            }
          }
        }

        setBoardData(newBoardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();

    // Set up real-time subscriptions
    const taskSubscription = supabase
      .channel('task-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task', filter: `proj_id=eq.${projectId}` }, handleTaskChange)
      .subscribe();

    const statusSubscription = supabase
      .channel('status-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_task_status', filter: `proj_id=eq.${projectId}` }, handleStatusChange)
      .subscribe();

    return () => {
      supabase.removeChannel(taskSubscription);
      supabase.removeChannel(statusSubscription);
    };
  }, [projectId]);

  const handleTaskChange = (payload: any) => {
    setBoardData(prevData => {
      const newData = { ...prevData };
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const task: Task = {
          id: payload.new.task_id,
          title: payload.new.task_desc || 'Untitled Task',
          assignee: payload.new.task_assignee,
          dueDate: payload.new.task_deadline,
          tag: payload.new.task_priority
        };
        
        // Remove task from all columns (in case of update)
        Object.values(newData).forEach(column => {
          column.unassignedTasks = column.unassignedTasks.filter(t => t.id !== task.id);
          column.teamMembers.forEach(member => {
            member.tasks = member.tasks.filter(t => t.id !== task.id);
          });
        });

        // Add task to correct column
        const column = newData[payload.new.task_status];
        if (column) {
          if (task.assignee) {
            const teamMember = column.teamMembers.find(m => m.id === task.assignee);
            if (teamMember) {
              teamMember.tasks.push(task);
            } else {
              column.unassignedTasks.push(task);
            }
          } else {
            column.unassignedTasks.push(task);
          }
        }
      } else if (payload.eventType === 'DELETE') {
        Object.values(newData).forEach(column => {
          column.unassignedTasks = column.unassignedTasks.filter(t => t.id !== payload.old.task_id);
          column.teamMembers.forEach(member => {
            member.tasks = member.tasks.filter(t => t.id !== payload.old.task_id);
          });
        });
      }
      return newData;
    });
  };

  const handleStatusChange = (payload: any) => {
    setBoardData(prevData => {
      const newData = { ...prevData };
      if (payload.eventType === 'INSERT') {
        newData[payload.new.id] = {
          title: payload.new.proj_status_name,
          teamMembers: Object.values(prevData)[0]?.teamMembers || [],
          unassignedTasks: []
        };
      } else if (payload.eventType === 'UPDATE') {
        if (newData[payload.new.id]) {
          newData[payload.new.id].title = payload.new.proj_status_name;
        }
      } else if (payload.eventType === 'DELETE') {
        const { [payload.old.id]: deletedColumn, ...rest } = newData;
        return rest;
      }
      return newData;
    });
  };

  const handleAddNewStatus = async () => {
    if (newStatusName.trim()) {
      try {
        await createProjectTaskStatus(projectId, newStatusName.trim());
        setNewStatusName('');
        setIsNewStatusDialogOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add new status');
      }
    }
  };

  const handleAddNewTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        // Assuming the first status is the default one for new tasks
        const defaultStatusId = Object.keys(boardData)[0];
        await createTask(newTaskTitle.trim(), newTaskDescription.trim(), projectId, defaultStatusId);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setIsNewTaskDialogOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add new task');
      }
    }
  };

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const sourceColumnId = source.droppableId;
    const destColumnId = destination.droppableId;
    const taskId = draggableId;

    setBoardData(prevData => {
      const newData = { ...prevData };
      let task: Task | undefined;

      // Find and remove the task from the source
      if (sourceColumnId.includes('unassigned')) {
        const sourceColumn = newData[sourceColumnId.split('-')[0]];
        const taskIndex = sourceColumn.unassignedTasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
          [task] = sourceColumn.unassignedTasks.splice(taskIndex, 1);
        }
      } else {
        const [columnId, memberId] = sourceColumnId.split('-');
        const sourceColumn = newData[columnId];
        const member = sourceColumn.teamMembers.find(m => m.id === memberId);
        if (member) {
          const taskIndex = member.tasks.findIndex(t => t.id === taskId);
          if (taskIndex > -1) {
            [task] = member.tasks.splice(taskIndex, 1);
          }
        }
      }

      if (!task) return newData;

      // Add the task to the destination
      if (destColumnId.includes('unassigned')) {
        const destColumn = newData[destColumnId.split('-')[0]];
        destColumn.unassignedTasks.splice(destination.index, 0, { ...task, assignee: null });
      } else {
        const [columnId, memberId] = destColumnId.split('-');
        const destColumn = newData[columnId];
        const member = destColumn.teamMembers.find(m => m.id === memberId);
        if (member) {
          member.tasks.splice(destination.index, 0, { ...task, assignee: memberId });
        }
      }

      // Update the task in the database
    //   updateTask(taskId, {
    //     task_status: destColumnId.split('-')[0],
    //     task_assignee: destColumnId.includes('unassigned') ? null : destColumnId.split('-')[1]
    //   });
      updateTaskStatus(taskId, destColumnId.split('-')[0])
      updateTaskAssignee(taskId, destColumnId.includes('unassigned') ? null : destColumnId.split('-')[1])

      return newData;
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Project Board</h1>
      </div>
      <ClientKanbanWrapper 
        initialData={boardData} 
        onDragEnd={handleDragEnd}
      />

      {/* New Status Dialog */}
      <Dialog open={isNewStatusDialogOpen} onClose={() => setIsNewStatusDialogOpen(false)}>
        <DialogTitle>Add New Status</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Status Name"
            type="text"
            fullWidth
            variant="standard"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNewStatus}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskDialogOpen} onClose={() => setIsNewTaskDialogOpen(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            type="text"
            fullWidth
            variant="standard"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Task Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewTaskDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNewTask}>Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}