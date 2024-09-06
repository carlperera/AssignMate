'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BoardData, Column, Task, TeamMember } from './ClientKanbanWrapper';

interface KanbanProps {
  data: BoardData;
  onDragEnd: (result: DropResult) => void;
}

export const KanbanBoard: React.FC<KanbanProps> = ({ data, onDragEnd }) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (columnId: string, memberId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [`${columnId}-${memberId}`]: !prev[`${columnId}-${memberId}`]
    }));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 h-full">
        {Object.entries(data).map(([columnId, column]) => (
          <div key={columnId} className="w-64 bg-gray-100 rounded p-2 flex flex-col h-full">
            <h2 className="font-bold mb-2">{column.title} {column.teamMembers.reduce((acc, member) => acc + member.tasks.length, 0) + column.unassignedTasks.length}</h2>
            <Droppable droppableId={`${columnId}-unassigned`} type="TASK">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-white p-2 mb-2 rounded flex-grow"
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
            {column.teamMembers.map((member) => (
              <div key={member.id} className="mb-2">
                <button
                  onClick={() => toggleSection(columnId, member.id)}
                  className="w-full text-left font-semibold p-2 bg-gray-200 rounded"
                >
                  {member.name} ({member.tasks.length} issues)
                </button>
                {openSections[`${columnId}-${member.id}`] && (
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
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};



export default KanbanBoard;