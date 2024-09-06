'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Task {
  id: string;
  title: string;
  tag: string;
  assignee?: string;
}

interface Column {
  title: string;
  tasks: Task[];
}

interface BoardData {
  [key: string]: Column;
}

interface KanbanProps {
  data: BoardData;
  onDragEnd: (result: DropResult) => void;
}

export const KanbanBoard: React.FC<KanbanProps> = ({ data, onDragEnd }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">AssignMate</h1>
      <div className="flex space-x-4 mb-4">
        <button className="text-purple-600">Main</button>
        <button className="text-gray-600">Teams</button>
        <button className="text-gray-600">Projects</button>
      </div>
      <div className="flex">
        <div className="w-48 space-y-4">
          <button className="w-full text-left py-2 px-4 bg-purple-100 text-purple-700">Timeline</button>
          <button className="w-full text-left py-2 px-4 bg-purple-600 text-white">Board</button>
          <button className="w-full text-left py-2 px-4">Backlog</button>
          <button className="w-full text-left py-2 px-4">Sprints</button>
          <button className="w-full text-left py-2 px-4">Goals</button>
          <button className="w-full text-left py-2 px-4 mt-8">Chat</button>
          <button className="w-full text-left py-2 px-4">Meetings</button>
          <button className="w-full text-left py-2 px-4">Meeting Scheduler</button>
          <button className="w-full text-left py-2 px-4">Smart Assistant</button>
          <button className="w-full text-left py-2 px-4 mt-8">Project Pages</button>
          <button className="w-full text-left py-2 px-4">Settings</button>
        </div>
        <div className="flex-1 ml-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4">
              {Object.entries(data).map(([columnId, column]) => (
                <div key={columnId} className="w-64">
                  <h2 className="font-bold mb-2">{column.title} {column.tasks.length}</h2>
                  <Droppable droppableId={columnId}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-gray-100 p-2 rounded min-h-[200px]"
                      >
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-2 mb-2 rounded shadow"
                              >
                                <h3 className="font-semibold">{task.title}</h3>
                                <div className="text-sm text-gray-600">{task.tag}</div>
                                {task.assignee && (
                                  <div className="mt-2 text-xs bg-gray-200 rounded-full px-2 py-1 inline-block">
                                    {task.assignee}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;