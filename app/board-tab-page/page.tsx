import { ClientKanbanWrapper, BoardData } from '../components/ClientKanbanWrapper';

const initialData: BoardData = {
  todo: {
    title: 'To Do',
    teamMembers: [
      {
        id: 'cp',
        name: 'Carl Perera',
        tasks: [
          { id: '1', title: 'Task 1', tag: 'feature', assignee: 'cp' },
        ],
      },
      {
        id: 'pf',
        name: 'Patrick Fitzgerald',
        tasks: [
          { id: '2', title: 'Task 2', tag: 'bug', assignee: 'pf' },
        ],
      },
    ],
    unassignedTasks: [
      { id: '3', title: 'Task 3', tag: 'improvement', assignee: null },
    ],
  },
  inProgress: {
    title: 'In Progress',
    teamMembers: [
      {
        id: 'cp',
        name: 'Carl Perera',
        tasks: [
          { id: '4', title: 'Task 4', tag: 'feature', assignee: 'cp' },
        ],
      },
    ],
    unassignedTasks: [],
  },
  done: {
    title: 'Done',
    teamMembers: [],
    unassignedTasks: [],
  },
};

export default function BoardTabPage() {
  return (
    <div className="h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Board Tab</h1>
      <div className="h-[calc(100vh-100px)]">
        <ClientKanbanWrapper initialData={initialData} />
      </div>
    </div>
  );
}