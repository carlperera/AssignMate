'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BoardData, Column, Task, TeamMember } from './ClientKanbanWrapper';
import { Underdog } from 'next/font/google';
import { Plus } from 'lucide-react';


interface KanbanProps {
  data: BoardData;
  onDragEnd: (result: DropResult) => void;
  onAddNewTask: (columnId: string, task: Task) => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onAddNewColumn: () => void;
}

export const KanbanBoard: React.FC<KanbanProps> = ({ data, onDragEnd, onAddNewTask, onDeleteTask, onAddNewColumn }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');

  const allTeamMembers = Array.from(new Set(
    Object.values(data).flatMap(column => column.teamMembers.map(member => member.id))
  ));

  const handleAddNewTask = (columnId: string) => {
    setNewTaskColumn(columnId);
    setIsModalOpen(true);
  };

  const handleSubmitNewTask = () => {
    if (newTaskTitle) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        tag: newTaskTag || undefined,
        assignee: null
      };
      onAddNewTask(newTaskColumn, newTask);
      setIsModalOpen(false);
      setNewTaskTitle('');
      setNewTaskTag('');
      setNewTaskColumn('');
    }
  };

  const TaskCard = ({ task, columnId, index }: { task: Task; columnId: string; index: number }) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white p-2 mb-2 rounded shadow relative"
        >
          <h4 className="font-semibold">{task.title}</h4>
          {task.tag && <div className="text-sm text-gray-600">{task.tag}</div>}
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
            <button className="w-full text-left py-2 px-4 bg-purple-100 text-purple-700 rounded">Timeline</button>
            <button className="w-full text-left py-2 px-4 bg-purple-600 text-white rounded">Board</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Backlog</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Sprints</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Goals</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded mt-8">Chat</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Meetings</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Meeting Scheduler</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Smart Assistant</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded mt-8">Project Pages</button>
            <button className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded">Settings</button>
          </div>
        </aside>

        {/* main content area */}
        <main className="flex-grow p-6 overflow-x-auto">
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Add New Task</h3>
            <input
              type="text"
              placeholder="Task Title"
              className="w-full p-2 mb-4 border rounded"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Task Tag (optional)"
              className="w-full p-2 mb-4 border rounded"
              value={newTaskTag}
              onChange={(e) => setNewTaskTag(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded"
                onClick={(e) => {
                  e.preventDefault(); // Prevent any default form submission
                  handleSubmitNewTask();
                }}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;