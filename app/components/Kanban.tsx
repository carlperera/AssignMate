"use client";
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ProjectTaskStatus, Task, User } from '@/supabase/databaseTypes';
import { Plus, Calendar, Edit2, X, Loader, Trash2} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from './Header';

interface KanbanProps {
  columns: ProjectTaskStatus[];
  tasks: Task[];
  teamMembers: User[];
  onDragEnd: (result: DropResult) => void;
  onAddNewTask: (columnId: string, newTaskData: Partial<Task>) => void;
  onEditTask: (taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddNewColumn: (columnName: string) => void;
  onSortChange: (option: 'none' | 'dueDate') => void;
  currentSort: 'none' | 'dueDate';
  projectId: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEditTask, onDeleteTask }) => (
  <Draggable key={task.task_id} draggableId={task.task_id} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="bg-white p-2 mb-2 rounded shadow relative"
      >
        <h4 className="font-semibold">{task.task_name}</h4>
        <p className="text-sm text-gray-600">{task.task_desc}</p>
        {task.task_deadline && (
          <div className="text-sm text-gray-600 flex items-center mt-1">
            <Calendar size={14} className="mr-1" />
            {new Date(task.task_deadline).toLocaleDateString()}
          </div>
        )}
        <button
          onClick={() => onEditTask(task)}
          className="absolute top-1 right-6 text-blue-500 hover:text-blue-700"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDeleteTask(task.task_id)}
          className="absolute top-1 right-1 text-red-500 hover:text-red-700"
        >
          <Trash2 size={14} />
        </button>
      </div>
    )}
  </Draggable>
);


export const KanbanBoard: React.FC<KanbanProps> = ({
  columns,
  tasks,
  teamMembers,
  onDragEnd,
  onAddNewTask,
  onEditTask,
  onDeleteTask,
  onAddNewColumn,
  onSortChange,
  currentSort,
  projectId
}) => {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnError, setNewColumnError] = useState('');

  const [isTaskCardOpen, setIsTaskCardOpen] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    task_desc: '',
    task_deadline: null,
    task_assignee_id: null,
    task_priority: null,
    proj_id: projectId,
  });

  const [isAddingColumn, setIsAddingColumn] = useState(false);



  const handleAddNewTask = (columnId: string) => {
    setNewTaskColumn(columnId);
    setEditingTask(null);
    setNewTask({
      task_desc: '',
      task_deadline: null,
      task_assignee_id: null,
      task_priority: null,
      proj_id: projectId,
    });
    setIsTaskCardOpen(true);
  };
  
  const handleNewColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewColumnName(e.target.value);
    if (columns.some(col => col.proj_status_name.toLowerCase() === e.target.value.toLowerCase())) {
      setNewColumnError('A column with this name already exists');
    } else {
      setNewColumnError('');
    }
  };

  const handleAddNewColumn = async () => {
    if (newColumnName && !newColumnError) {
      setIsAddingColumn(true);
      try {
        await onAddNewColumn(newColumnName);
        setNewColumnName('');
      } catch (error) {
        console.error('Error adding new column:', error);
        setNewColumnError('Failed to add new column. Please try again.');
      } finally {
        setIsAddingColumn(false);
      }
    }
  };
  

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      ...task,
      task_deadline: task.task_deadline ? new Date(task.task_deadline).toISOString().split('T')[0] : null,
    });
    setIsTaskCardOpen(true);
  };

  const handleTaskSubmit = () => {
    if (newTask.task_desc) {
      if (editingTask) {
        onEditTask(editingTask.task_id, newTask);
      } else {
        onAddNewTask(newTaskColumn, newTask);
      }
      setIsTaskCardOpen(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const [sourceColumnId, sourceSection] = result.source.droppableId.split('-');
    const [destColumnId, destSection] = result.destination.droppableId.split('-');

    const updatedTask: Partial<Task> = {
      task_status: destColumnId,
      task_assignee_id: destSection === 'unassigned' ? null : destSection,
    };

    const taskId = result.draggableId;
    onEditTask(taskId, updatedTask);
    onDragEnd(result);
  };



  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow flex overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex p-4 space-x-4"
              >
                {columns.map((column, index) => (
                  <Draggable key={column.project_task_status_id} draggableId={column.project_task_status_id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="w-80 flex-shrink-0 flex flex-col"
                      >
                        <h3 {...provided.dragHandleProps} className="font-bold mb-2 p-2 bg-gray-200 rounded">
                          {column.proj_status_name}
                        </h3>
                        <div className="flex-grow bg-gray-100 rounded p-2 overflow-y-auto">
                          {teamMembers.map((member) => (
                            <div key={member.user_id} className="mb-4">
                              <h4 className="font-semibold mb-2">{member.user_fname} {member.user_lname}</h4>
                              <Droppable droppableId={`${column.project_task_status_id}-${member.user_id}`} type="TASK">
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[50px]">
                                    {tasks
                                      .filter(task => task.task_status === column.project_task_status_id && task.task_assignee_id === member.user_id)
                                      .map((task, index) => (
                                        <TaskCard
                                          key={task.task_id}
                                          task={task}
                                          index={index}
                                          onEditTask={handleEditTask}
                                          onDeleteTask={onDeleteTask}
                                        />
                                      ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          ))}
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Unassigned</h4>
                            <Droppable droppableId={`${column.project_task_status_id}-unassigned`} type="TASK">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[50px]">
                                  {tasks
                                    .filter(task => task.task_status === column.project_task_status_id && task.task_assignee_id === null)
                                    .map((task, index) => (
                                      <TaskCard
                                        key={task.task_id}
                                        task={task}
                                        index={index}
                                        onEditTask={handleEditTask}
                                        onDeleteTask={onDeleteTask}
                                      />
                                    ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        </div>
                        <button
                          className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
                          onClick={() => handleAddNewTask(column.project_task_status_id)}
                        >
                          Add Task
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <div className="w-80 flex-shrink-0">
                  <div className="bg-gray-100 p-4 rounded">
                    <Input
                      type="text"
                      placeholder="New column name"
                      value={newColumnName}
                      onChange={handleNewColumnNameChange}
                      className="mb-2"
                    />
                    {newColumnError && <p className="text-red-500 text-sm mb-2">{newColumnError}</p>}
                    <Button
                      onClick={handleAddNewColumn}
                      disabled={!newColumnName || !!newColumnError || isAddingColumn}
                      className="w-full"
                    >
                      {isAddingColumn ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus size={20} className="mr-2" />
                      )}
                      {isAddingColumn ? 'Adding...' : 'Add Column'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <Dialog open={isTaskCardOpen} onOpenChange={setIsTaskCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Task Name</label>
              <Input
                type="text"
                value={newTask.task_name || ''}
                onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
                placeholder="Enter task name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Task Description</label>
              <Input
                type="text"
                value={newTask.task_desc || ''}
                onChange={(e) => setNewTask({...newTask, task_desc: e.target.value})}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <Input
                type="date"
                value={newTask.task_deadline || ''}
                onChange={(e) => setNewTask({...newTask, task_deadline: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assignee</label>
              <Select
                value={newTask.task_assignee_id || 'unassigned'}
                onValueChange={(value) => setNewTask({...newTask, task_assignee_id: value === 'unassigned' ? null : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.user_fname} {member.user_lname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <Select
                value={newTask.task_priority || 'none'}
                onValueChange={(value) => setNewTask({...newTask, task_priority: value === 'none' ? null : value as Task['task_priority']})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleTaskSubmit}>
              {editingTask ? 'Save Changes' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;