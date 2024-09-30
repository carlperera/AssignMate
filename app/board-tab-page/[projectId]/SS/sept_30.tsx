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
import { Database } from '@/supabase/database.types';
import { ProjectTaskStatus } from '@/supabase/databaseTypes';

interface Task {
  task_id: string;
  task_desc: string;
  task_assignee_id: string | null;
  task_deadline: string | null;
  task_priority: Database['public']['Enums']['task_priority '] | null;
  task_order: number;
}

interface Column {
  project_task_status_id: string;
  proj_status_name: string;
  tasks: Task[];
}

interface BoardData {
  columns: Column[];
  columnOrder: string[];
}

export default function BoardTabPage({ params }: { params: { projectId: string } }) {
  const [boardData, setBoardData] = useState<BoardData>({ columns: [], columnOrder: [] });
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
        const { data: project, error: projectError } = await fetchProjectById(projectId);
        if (!project || projectError) {
          throw new Error('Project not found');
        }

        const { data: tasks } = await fetchTasksForProject(projectId);
        const { data: teamMembers } = await fetchAllUserTeamForTeam(project.team_id);
        const { data: projectTaskStatuses } = await fetchProjectTaskStatusById(projectId);

        const columns: Column[] = projectTaskStatuses?.map((status: ProjectTaskStatus)=> ({
          project_task_status_id: status.project_task_status_id,
          proj_status_name: status.proj_status_name || 'Untitled',
          tasks: []
        })) || [];

        const columnOrder = columns.map(column => column.project_task_status_id);

        if (tasks) {
          tasks.forEach(task => {
            const columnIndex = columns.findIndex(col => col.project_task_status_id === task.task_status);
            if (columnIndex !== -1) {
              columns[columnIndex].tasks.push(task);
            }
          });
        }

        setBoardData({ columns, columnOrder });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();

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
      const newColumns = [...prevData.columns];
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const task: Task = {
          task_id: payload.new.task_id,
          task_desc: payload.new.task_desc || 'Untitled Task',
          task_assignee_id: payload.new.task_assignee_id,
          task_deadline: payload.new.task_deadline,
          task_priority: payload.new.task_priority
        };
        
        // Remove task from all columns (in case of update)
        newColumns.forEach(column => {
          column.tasks = column.tasks.filter(t => t.task_id !== task.task_id);
        });

        // Add task to correct column
        const columnIndex = newColumns.findIndex(col => col.project_task_status_id === payload.new.task_status);
        if (columnIndex !== -1) {
          newColumns[columnIndex].tasks.push(task);
        }
      } else if (payload.eventType === 'DELETE') {
        newColumns.forEach(column => {
          column.tasks = column.tasks.filter(t => t.task_id !== payload.old.task_id);
        });
      }
      return { ...prevData, columns: newColumns };
    });
  };

  const handleStatusChange = (payload: any) => {
    setBoardData(prevData => {
      let newColumns = [...prevData.columns];
      let newColumnOrder = [...prevData.columnOrder];
      if (payload.eventType === 'INSERT') {
        const newColumn: Column = {
          project_task_status_id: payload.new.project_task_status_id,
          proj_status_name: payload.new.proj_status_name,
          tasks: []
        };
        newColumns.push(newColumn);
        newColumnOrder.push(newColumn.project_task_status_id);
      } else if (payload.eventType === 'UPDATE') {
        const columnIndex = newColumns.findIndex(col => col.project_task_status_id === payload.new.project_task_status_id);
        if (columnIndex !== -1) {
          newColumns[columnIndex].proj_status_name = payload.new.proj_status_name;
        }
      } else if (payload.eventType === 'DELETE') {
        newColumns = newColumns.filter(col => col.project_task_status_id !== payload.old.project_task_status_id);
        newColumnOrder = newColumnOrder.filter(id => id !== payload.old.project_task_status_id);
      }
      return { columns: newColumns, columnOrder: newColumnOrder };
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
    if (newTaskTitle.trim() && currentStatusId) {
      try {
        await createTask(
          null, // taskAssignee
          newTaskTitle.trim(), // taskDesc
          null, // taskDeadline
          projectId,
          undefined, // taskPriority
          currentStatusId // taskStatusId
        );
        setNewTaskTitle('');
        setNewTaskDescription('');
        setIsNewTaskDialogOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add new task');
      }
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const startColumn = boardData.columns.find(col => col.project_task_status_id === source.droppableId);
    const finishColumn = boardData.columns.find(col => col.project_task_status_id === destination.droppableId);

    if (!startColumn || !finishColumn) {
      return;
    }

    if (startColumn === finishColumn) {
      const newTasks = Array.from(startColumn.tasks);
      const [reorderedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, reorderedTask);

      const newColumn = {
        ...startColumn,
        tasks: newTasks,
      };

      const newColumns = boardData.columns.map(col =>
        col.project_task_status_id === newColumn.project_task_status_id ? newColumn : col
      );

      setBoardData({ ...boardData, columns: newColumns });
    } else {
      const startTasks = Array.from(startColumn.tasks);
      const [movedTask] = startTasks.splice(source.index, 1);
      const newStartColumn = {
        ...startColumn,
        tasks: startTasks,
      };

      const finishTasks = Array.from(finishColumn.tasks);
      finishTasks.splice(destination.index, 0, movedTask);
      const newFinishColumn = {
        ...finishColumn,
        tasks: finishTasks,
      };

      const newColumns = boardData.columns.map(col =>
        col.project_task_status_id === newStartColumn.project_task_status_id ? newStartColumn :
        col.project_task_status_id === newFinishColumn.project_task_status_id ? newFinishColumn : col
      );

      setBoardData({ ...boardData, columns: newColumns });

      // Update the task status in the database
      await updateTaskStatus(movedTask.task_id, finishColumn.project_task_status_id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-screen overflow-hidden p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Project Board</h1>
          <Button onClick={() => setIsNewStatusDialogOpen(true)}>Add New Status</Button>
        </div>
        <div className="flex space-x-4 overflow-x-auto">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns.find(col => col.project_task_status_id === columnId);
            if (!column) return null;
            return (
              <div key={column.project_task_status_id} className="flex-shrink-0 w-64">
                <h2 className="font-bold mb-2">{column.proj_status_name}</h2>
                <Droppable droppableId={column.project_task_status_id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="bg-gray-100 p-2 rounded min-h-[200px]"
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.task_id} draggableId={task.task_id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-2 mb-2 rounded shadow"
                            >
                              {task.task_desc}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <Button 
                  onClick={() => {
                    setCurrentStatusId(column.project_task_status_id);
                    setIsNewTaskDialogOpen(true);
                  }}
                  className="mt-2"
                >
                  Add Task
                </Button>
              </div>
            );
          })}
        </div>
      </div>

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
    </DragDropContext>
  );
}