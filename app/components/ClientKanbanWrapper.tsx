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
  fetchProjectById,
  editTask,
  fetchUserTeam
} from '@/supabase/backendFunctions';
import supabase from '@/supabase/supabaseClient';


interface ClientKanbanWrapperProps {
  initialColumns: ProjectTaskStatus[];
  initialTasks: Task[];
  teamMembers: User[];
  projectId: string;
  teamId: string;
}

export const ClientKanbanWrapper: React.FC<ClientKanbanWrapperProps> = ({
  initialColumns,
  initialTasks,
  teamMembers,
  projectId,
  teamId,
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
    const { source, destination, type, draggableId } = result;

    if (!destination) return;

    if (type === 'COLUMN') {
      const newColumns = Array.from(columns);
      const [reorderedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, reorderedColumn);

      const updatedColumns = newColumns.map((column, index) => ({
        ...column,
        proj_status_order: index + 1,
      }));

      setColumns(updatedColumns);

      // Update the database
      try {
        const updatePromises = updatedColumns.map(column => 
          updateTaskStatusOrder(column.project_task_status_id, column.proj_status_order)
        );
        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error updating column order:', error);
        // Optionally, revert the UI change or show an error message to the user
      }
    } else {
      // const [taskId, sourceColumnId, sourceUserId, sourceTeamId] = draggableId.split('|');
      // const [destColumnId, destUserId, destTeamId] = destination.droppableId.split('|');

     
  
      // if (sourceColumnId === destColumnId && sourceUserId === destUserId) {
      //   return; // Task hasn't moved, no need to update
      // }

      // const updatedTask: Partial<Task> = {
      //   task_status: destColumnId,
      //   task_assignee_id: destUserId === 'unassigned' ? null : destUserId,
      //   task_team_id: sourceTeamId === 'unassigned' ? null : sourceTeamId, // Assuming team doesn't change
      // };

      // try {
      //   console.log('Updating task:', taskId, 'with:', updatedTask);
      //   console.log(updatedTask)
      //   const { data: updatedTaskData, error } = await editTask(taskId, updatedTask);

      //   if (error) {
      //     throw error;
      //   }

      //   if (updatedTaskData) {
      //     console.log('Task updated successfully:', updatedTaskData);
      //     // The subscription should handle updating the local state
      //   }
      // } catch (error) {
      //   console.error('Error updating task:', error);
      // }
      const [taskId, sourceColumnId, sourceUserId, sourceTeamId] = draggableId.split('|');
      const [destColumnId, destUserId, destTeamId] = destination.droppableId.split('|');

      if (sourceColumnId === destColumnId && sourceUserId === destUserId) {
        return; // Task hasn't moved, no need to update
      }

      const isMovedToUnassigned = destUserId === 'unassigned';

      // Optimistic update
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === taskId
            ? {
                ...task,
                task_status: destColumnId,
                task_assignee_id: isMovedToUnassigned ? null : (destUserId === 'unassigned' ? null : destUserId),
                task_team_id: isMovedToUnassigned ? null : (destTeamId === 'unassigned' ? null : destTeamId),
              }
            : task
        )
      );

      const updatedTask: Partial<Task> = {
        task_status: destColumnId,
        task_assignee_id: isMovedToUnassigned ? null : (destUserId === 'unassigned' ? null : destUserId),
        task_team_id: isMovedToUnassigned ? null : (destTeamId === 'unassigned' ? null : destTeamId),
      };

      try {
        console.log('Updating task:', taskId, 'with:', updatedTask);
        const { data: updatedTaskData, error } = await editTask(taskId, updatedTask);

        if (error) {
          throw error;
        }

        if (updatedTaskData) {
          console.log('Task updated successfully:', updatedTaskData);
          // The subscription will handle syncing the local state if there are any discrepancies
        }
      } catch (error) {
        console.error('Error updating task:', error);
        // Revert the optimistic update if there's an error
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.task_id === taskId
              ? {
                  ...task,
                  task_status: sourceColumnId,
                  task_assignee_id: sourceUserId === 'unassigned' ? null : sourceUserId,
                  task_team_id: sourceTeamId === 'unassigned' ? null : sourceTeamId,
                }
              : task
          )
        );
        // Optionally, show an error message to the user
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
        teamId={teamId}
      />
    </>
  );
};