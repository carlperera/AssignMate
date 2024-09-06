'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BoardData, Column, Task, TeamMember } from './ClientKanbanWrapper';

interface KanbanProps {
  data: BoardData;
  onDragEnd: (result: DropResult) => void;
}

export const KanbanBoard: React.FC<KanbanProps> = ({ data, onDragEnd }) => {
  const allTeamMembers = Array.from(new Set(
    Object.values(data).flatMap(column => column.teamMembers.map(member => member.id))
  ));

  return (
    <div className="flex flex-col h-screen">
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
      <div className="flex-grow flex overflow-hidden">
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
        <main className="flex-grow p-6 overflow-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4 h-full">
              {Object.entries(data).map(([columnId, column]) => (
                <div key={columnId} className="w-64 bg-gray-100 rounded p-2 flex flex-col h-full">
                  <h2 className="font-bold mb-2">{column.title} {column.teamMembers.reduce((acc, member) => acc + member.tasks.length, 0) + column.unassignedTasks.length}</h2>
                  <div className="flex-grow overflow-y-auto">
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
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="bg-white p-2 mb-2 rounded shadow"
                                      >
                                        <h4 className="font-semibold">{task.title}</h4>
                                        <div className="text-sm text-gray-600">{task.tag}</div>
                                      </div>
                                    )}
                                  </Draggable>
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
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white p-2 mb-2 rounded shadow"
                                >
                                  <h4 className="font-semibold">{task.title}</h4>
                                  <div className="text-sm text-gray-600">{task.tag}</div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                  <button className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                    + Add New Task
                  </button>
                </div>
              ))}
            </div>
          </DragDropContext>
        </main>
      </div>
    </div>
  );
};

export default KanbanBoard;