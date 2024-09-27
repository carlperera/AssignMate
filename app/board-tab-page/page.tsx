"use client";
import { useEffect, useState } from 'react';
import { ClientKanbanWrapper, BoardData } from '../components/ClientKanbanWrapper';
import { fetchTasksForProject, fetchTaskStatusById } from '../supabase/backendFunctions';
import { Task, TaskStatus } from '../supabase/databaseTypes';

export default function BoardTabPage() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const projectId = 'your-project-id'; // Replace with actual project ID
        const { data: tasks, error: tasksError } = await fetchTasksForProject(projectId);

        if (tasksError) {
          throw new Error(`Error fetching tasks: ${tasksError.message}`);
        }

        if (!tasks || tasks.length === 0) {
          setBoardData({});
          return;
        }

        const taskStatusMap = new Map<string, TaskStatus>();
        for (const task of tasks) {
          if (task.task_status && !taskStatusMap.has(task.task_status)) {
            const { data: statusData, error: statusError } = await fetchTaskStatusById(task.task_status);
            if (statusError) {
              console.error(`Error fetching status for ${task.task_status}:`, statusError);
            } else if (statusData && statusData.length > 0) {
              taskStatusMap.set(task.task_status, statusData[0]);
            }
          }
        }

        const newBoardData: BoardData = {};
        taskStatusMap.forEach((status, statusId) => {
          newBoardData[statusId] = {
            title: status.task_status_name || 'Unknown Status',
            teamMembers: [],
            unassignedTasks: [],
          };
        });

        const teamMembers = new Map<string, { id: string; name: string }>();
        tasks.forEach((task) => {
          const statusId = task.task_status || 'unassigned';
          if (!newBoardData[statusId]) {
            newBoardData[statusId] = {
              title: 'Unknown Status',
              teamMembers: [],
              unassignedTasks: [],
            };
          }

          const newTask = {
            id: task.task_id,
            title: task.task_desc || 'Untitled Task',
            tag: task.task_priority || undefined,
            assignee: task.task_assignee,
          };

          if (task.task_assignee) {
            if (!teamMembers.has(task.task_assignee)) {
              teamMembers.set(task.task_assignee, { id: task.task_assignee, name: `User ${task.task_assignee}` });
            }
            const memberIndex = newBoardData[statusId].teamMembers.findIndex(m => m.id === task.task_assignee);
            if (memberIndex === -1) {
              newBoardData[statusId].teamMembers.push({
                id: task.task_assignee,
                name: `User ${task.task_assignee}`,
                tasks: [newTask],
              });
            } else {
              newBoardData[statusId].teamMembers[memberIndex].tasks.push(newTask);
            }
          } else {
            newBoardData[statusId].unassignedTasks.push(newTask);
          }
        });

        setBoardData(newBoardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading board data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!boardData || Object.keys(boardData).length === 0) {
    return <div>No tasks found for this project.</div>;
  }

  return (
    <div className="h-screen">
      <ClientKanbanWrapper initialData={boardData} />
    </div>
  );
}