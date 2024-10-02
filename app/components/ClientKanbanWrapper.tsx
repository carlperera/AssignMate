"use client";
import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './Kanban';
import { DropResult } from '@hello-pangea/dnd';
import { ProjectTaskStatus, Task, User } from '@/supabase/databaseTypes';
import {
  createTask,
  updateTaskStatus,
  updateTaskAssignee,
  deleteTask,
  createProjectTaskStatus,
  updateTaskStatusOrder,
  fetchProjectById
} from '@/supabase/backendFunctions';
import supabase from '@/supabase/supabaseClient';

interface ClientKanbanWrapperProps {
  initialColumns: ProjectTaskStatus[];
  initialTasks: Task[];
  teamMembers: User[];
  projectId: string;
}

export const ClientKanbanWrapper: React.FC<ClientKanbanWrapperProps> = ({
  initialColumns,
  initialTasks,
  teamMembers,
  projectId,
}) => {
  const [columns, setColumns] = useState<ProjectTaskStatus[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [members, setMembers] = useState<User[]>(teamMembers);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);



// Also, make sure you have the sortOption state
const [sortOption, setSortOption] = useState<'none' | 'dueDate'>('none');

  // ... other state

  useEffect(() => {
    // Set up real-time subscriptions
    const columnsSubscription = supabase
      .channel('project_task_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_task_status',
          filter: `proj_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Column change received!', payload);
          handleColumnChange(payload);
        }
      )
      .subscribe();

    const tasksSubscription = supabase
      .channel('task_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task',
          filter: `proj_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Task change received!', payload);
          handleTaskChange(payload);
        }
      )
      .subscribe();

    const teamMembersSubscription = supabase
      .channel('user_team_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_team',
          filter: `team_id=eq.${projectId}` // Assuming team_id is the same as project_id
        },
        (payload) => {
          console.log('Team member change received!', payload);
          handleTeamMemberChange(payload);
        }
      )
      .subscribe();

    // Clean up subscriptions on component unmount
    return () => {
      columnsSubscription.unsubscribe();
      tasksSubscription.unsubscribe();
      teamMembersSubscription.unsubscribe();
    };
  }, [projectId]);

  const handleColumnChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setColumns(prevColumns => {
        // Check if the column already exists
        if (prevColumns.some(col => col.project_task_status_id === payload.new.project_task_status_id)) {
          return prevColumns;
        }
        return [...prevColumns, payload.new];
      });
    } else if (payload.eventType === 'UPDATE') {
      setColumns(prevColumns => 
        prevColumns.map(column => 
          column.project_task_status_id === payload.new.project_task_status_id ? payload.new : column
        )
      );
    } else if (payload.eventType === 'DELETE') {
      setColumns(prevColumns => 
        prevColumns.filter(column => column.project_task_status_id !== payload.old.project_task_status_id)
      );
    }
  };

  const handleTaskChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setTasks(prevTasks => [...prevTasks, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === payload.new.task_id ? payload.new : task
        )
      );
    } else if (payload.eventType === 'DELETE') {
      setTasks(prevTasks => 
        prevTasks.filter(task => task.task_id !== payload.old.task_id)
      );
    }
  };

  const handleTeamMemberChange = async (payload: any) => {
    // For team member changes, we might need to fetch the updated user data
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const { data: userData, error } = await supabase
        .from('user')
        .select('*')
        .eq('user_id', payload.new.user_id)
        .single();

      if (error) {
        console.error('Error fetching updated user data:', error);
        return;
      }

      setMembers(prevMembers => {
        const existingMemberIndex = prevMembers.findIndex(member => member.user_id === userData.user_id);
        if (existingMemberIndex !== -1) {
          // Update existing member
          const updatedMembers = [...prevMembers];
          updatedMembers[existingMemberIndex] = userData;
          return updatedMembers;
        } else {
          // Add new member
          return [...prevMembers, userData];
        }
      });
    } else if (payload.eventType === 'DELETE') {
      setMembers(prevMembers => 
        prevMembers.filter(member => member.user_id !== payload.old.user_id)
      );
    }
  };
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === 'COLUMN') {
      const newColumns = Array.from(columns);
      const [reorderedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, reorderedColumn);

      const updatedColumns = newColumns.map((column, index) => ({
        ...column,
        proj_status_order: index + 1, // Adding 1 because array indices start at 0, but we want orders to start at 1
      }));

      setColumns(updatedColumns);

      // Update the database
      try {
        await updateColumnOrder(updatedColumns);
      } catch (error) {
        console.error('Error updating column order:', error);
        // Optionally, revert the UI change or show an error message to the user
      }
    } else {
      // Handling task moves (existing code)
      const sourceColumn = columns.find(col => col.project_task_status_id === source.droppableId.split('-')[0]);
      const destColumn = columns.find(col => col.project_task_status_id === destination.droppableId.split('-')[0]);

      if (!sourceColumn || !destColumn) return;

      const newTasks = Array.from(tasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, {
        ...movedTask,
        task_status: destColumn.project_task_status_id,
        task_assignee_id: destination.droppableId.split('-')[1] === 'unassigned' ? null : destination.droppableId.split('-')[1],
      });

      // Update the database
      try {
        await updateTaskStatus(movedTask.task_id, destColumn.project_task_status_id);
        await updateTaskAssignee(movedTask.task_id, newTasks[destination.index].task_assignee_id || null);
        setTasks(newTasks);
      } catch (error) {
        console.error('Error updating task:', error);
        // Optionally, revert the UI change or show an error message to the user
      }
    }
  };

  const updateColumnOrder = async (updatedColumns: ProjectTaskStatus[]) => {
    const updatePromises = updatedColumns.map(column => 
      updateTaskStatusOrder(column.project_task_status_id, column.proj_status_order)
    );

    try {
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating column orders:', error);
      throw error;
    }
  };


  const addNewTask = async (columnId: string, newTaskData: Partial<Task>) => {
    const { data: projectData } = await fetchProjectById(projectId);
    
    if (!projectData) {
      console.error('Failed to fetch project data');
      return;
    }
  
    const { data: createdTask, error } = await createTask(
      newTaskData.task_name || '',  // task_name is required
      newTaskData.task_desc || '',  // task_desc is required
      projectId,
      columnId,  // This is the task_status
      newTaskData.task_assignee_id || null,
      newTaskData.task_deadline || null,
      newTaskData.task_priority || null,
      projectData.team_id
    );
  
    if (!error && createdTask) {
      setTasks([...tasks, createdTask]);
    } else {
      console.error('Error creating task:', error);
    }
  };
  
  const editTask = async (taskId: string, updatedTask: Partial<Task>) => {
    const newTasks = tasks.map(task =>
      task.task_id === taskId ? { ...task, ...updatedTask } : task
    );
  
    // Update the database
    if (updatedTask.task_status) {
      await updateTaskStatus(taskId, updatedTask.task_status);
    }
    if (updatedTask.task_assignee_id !== undefined) {
      await updateTaskAssignee(taskId, updatedTask.task_assignee_id);
    }
  
    setTasks(newTasks);
  };

  
  
  const deleteTaskHandler = async (taskId: string) => {
    const error = await deleteTask(taskId);
    if (!error) {
      setTasks(tasks.filter(task => task.task_id !== taskId));
    } else {
      console.error('Error deleting task:', error);
    }
  };
  
  const addNewColumn = async (columnName: string) => {
    try {
      const { data: newColumn, error } = await createProjectTaskStatus(projectId, columnName);
      if (error) throw error;
      if (newColumn) {
        // We don't need to update the state here, as the subscription will handle it
        console.log('New column created:', newColumn);
      } else {
        throw new Error('New column data is null');
      }
    } catch (error) {
      console.error('Error creating new column:', error);
      throw error;
    }
  };
  
  const handleAddNewColumnClick = () => {
    setIsAddColumnDialogOpen(true);
  };


  


  // ... existing handleDragEnd and other functions

  return (
    <>
      <KanbanBoard
        columns={columns}
        tasks={tasks}
        teamMembers={members}
        onDragEnd={handleDragEnd}
        onAddNewTask={addNewTask}
        onEditTask={editTask}
        onDeleteTask={deleteTaskHandler}
        onAddNewColumn={addNewColumn}
        onSortChange={setSortOption}
        currentSort={sortOption}
        projectId={projectId}
      />
    </>
  );
};