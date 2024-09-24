'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BoardData, Column, Task, TeamMember } from './ClientKanbanWrapper';
import { Plus, Calendar, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KanbanProps {
  data: BoardData;
  onDragEnd: (result: DropResult) => void;
  onAddNewTask: (columnId: string, task: Task) => void;
  onEditTask: (columnId: string, taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onAddNewColumn: () => void;
  onSortChange: (option: 'none' | 'dueDate') => void;
  currentSort: 'none' | 'dueDate';
}

export const KanbanBoard: React.FC<KanbanProps> = ({
  data,
  onDragEnd,
  onAddNewTask,
  onEditTask,
  onDeleteTask,
  onAddNewColumn,
  onSortChange,
  currentSort 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTag, setTaskTag] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const allTeamMembers = Array.from(new Set(
    Object.values(data).flatMap(column => column.teamMembers.map(member => member.id))
  ));

  const handleAddNewTask = (columnId: string) => {
    setNewTaskColumn(columnId);
    setIsModalOpen(true);
    setTaskTitle('');
    setTaskTag('');
    setTaskDueDate('');
  };

  const handleEditTask = (columnId: string, task: Task) => {
    setEditingColumn(columnId);
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskTag(task.tag || '');
    setTaskDueDate(task.dueDate || '');
    setIsEditModalOpen(true);
  };

  const handleSubmitTask = (isEdit: boolean) => {
    if (taskTitle) {
      const taskData: Partial<Task> = {
        title: taskTitle,
        tag: taskTag || undefined,
        dueDate: taskDueDate || undefined
      };

      if (isEdit && editingTask) {
        onEditTask(editingColumn, editingTask.id, taskData);
      } else {
        onAddNewTask(newTaskColumn, {
          id: Date.now().toString(),
          ...taskData,
          assignee: null
        } as Task);
      }

      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setTaskTitle('');
      setTaskTag('');
      setTaskDueDate('');
      setEditingTask(null);
      setEditingColumn('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTaskColor = (dueDate?: string) => {
    if (!dueDate) return 'bg-white';
    const today = new Date();
    const taskDate = new Date(dueDate);
    const diffDays = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-100'; // Overdue
    if (diffDays <= 3) return 'bg-yellow-100'; // Due soon
    return 'bg-white';
  };

  const TaskCard = ({ task, columnId, index }: { task: Task; columnId: string; index: number }) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${getTaskColor(task.dueDate)} p-2 mb-2 rounded shadow relative`}
        >
          <h4 className="font-semibold">{task.title}</h4>
          {task.tag && <div className="text-sm text-gray-600">{task.tag}</div>}
          {task.dueDate && (
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <Calendar size={14} className="mr-1" />
              {formatDate(task.dueDate)}
            </div>
          )}
          <button
            onClick={() => handleEditTask(columnId, task)}
            className="absolute top-1 right-6 text-blue-500 hover:text-blue-700"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDeleteTask(columnId, task.id)}
            className="absolute top-1 right-1 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </Draggable>
  );


  return (
    <div className="flex flex-col h-screen"> {/* header and navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">AssignMate</h1>
        </div>
      </header>
      <nav className="bg-white border-b border-gray-200"> 

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Main</button>
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Teams</button>
              <button className="text-purple-600 hover:text-purple-900 px-3 py-2 rounded-md text-sm font-medium">Projects</button>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex-grow flex overflow-hidden"> {/* sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-2">
            <button className="w-full text-left py-2 px-4 bg-purple-600 text-white rounded">Board</button> 
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Meetings</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Meeting Scheduler</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded mt-8">Project Pages</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Settings</button>
          </div>
        </aside>

        {/* main content area */}
        <main className="flex-grow p-6 overflow-x-auto">
          <div className="mb-4">
            <Select onValueChange={onSortChange} value={currentSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No sorting</SelectItem>
                <SelectItem value="dueDate">Sort by due date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4 h-full" style={{ minWidth: 'max-content' }}>
              {Object.entries(data).map(([columnId, column]) => (
                <div key={columnId} className="w-64 flex-shrink-0 bg-gray-100 rounded p-2 flex flex-col h-full">
                  <h2 className="font-bold mb-2">{column.title} {column.teamMembers.reduce((acc, member) => acc + member.tasks.length, 0) + column.unassignedTasks.length}</h2>
                  <div className="flex-grow overflow-y-auto">
                    {/* column content */}
                    {allTeamMembers.map((memberId) => {
                      const member = column.teamMembers.find(m => m.id === memberId) || { id: memberId, name: memberId, tasks: [] };
                      return (
                        <div key={member.id} className="mb-2">
                          <div className="w-full text-left font-semibold p-2 bg-gray-200 rounded">
                            {member.name} ({member.tasks.length} issues)
                          </div>
                          <Droppable droppableId={`${columnId}-${member.id}`} type="TASK">
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="bg-white p-2 rounded mt-1"
                              >
                                {member.tasks.map((task, index) => (
                                  <TaskCard key={task.id} task={task} columnId={columnId} index={index} />
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      );
                    })}
                    <Droppable droppableId={`${columnId}-unassigned`} type="TASK">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="bg-white p-2 mb-2 rounded"
                        >
                          <h3 className="font-semibold mb-2">Unassigned</h3>
                          {column.unassignedTasks.map((task, index) => (
                            <TaskCard key={task.id} task={task} columnId={columnId} index={index} />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                  <button 
                    className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                    onClick={() => handleAddNewTask(columnId)}
                  >
                    + Add New Task
                  </button>
                </div>
              ))}
              {/* Add New Column Button */}
              <div className="w-64 flex-shrink-0 bg-gray-100 rounded p-2 flex flex-col h-full justify-center items-center">
                <button
                  onClick={onAddNewColumn}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <Plus size={48} />
                </button>
              </div>
            </div>
          </DragDropContext>
        </main>
      </div>
      <TaskModal
        isOpen={isModalOpen || isEditModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditModalOpen(false);
        }}
        onSubmit={() => handleSubmitTask(isEditModalOpen)}
        title={isEditModalOpen ? 'Edit Task' : 'Add New Task'}
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        taskTag={taskTag}
        setTaskTag={setTaskTag}
        taskDueDate={taskDueDate}
        setTaskDueDate={setTaskDueDate}
      />
    </div>
  );
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  taskTitle: string;
  setTaskTitle: (value: string) => void;
  taskTag: string;
  setTaskTag: (value: string) => void;
  taskDueDate: string;
  setTaskDueDate: (value: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  taskTitle,
  setTaskTitle,
  taskTag,
  setTaskTag,
  taskDueDate,
  setTaskDueDate
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <Input
        type="text"
        placeholder="Task Title"
        className="w-full p-2 mb-4 border rounded"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Task Tag (optional)"
        className="w-full p-2 mb-4 border rounded"
        value={taskTag}
        onChange={(e) => setTaskTag(e.target.value)}
      />
      <Input
        type="date"
        placeholder="Due Date (optional)"
        className="w-full p-2 mb-4 border rounded"
        value={taskDueDate}
        onChange={(e) => setTaskDueDate(e.target.value)}
      />
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {title === 'Edit Task' ? 'Save Changes' : 'Add Task'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default KanbanBoard;

