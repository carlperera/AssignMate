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
      {
        id: 'jm',
        name: 'Jaden Mu',
        tasks: [],
      },
      {
        id: 'kt',
        name: 'Kevin Tran',
        tasks: [],
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
      {
        id: 'pf',
        name: 'Patrick Fitzgerald',
        tasks: [],
      },
      {
        id: 'jm',
        name: 'Jaden Mu',
        tasks: [],
      },
      {
        id: 'kt',
        name: 'Kevin Tran',
        tasks: [],
      },
    ],
    unassignedTasks: [],
  },
  done: {
    title: 'Done',
    teamMembers: [
      {
        id: 'cp',
        name: 'Carl Perera',
        tasks: [],
      },
      {
        id: 'pf',
        name: 'Patrick Fitzgerald',
        tasks: [],
      },
      {
        id: 'jm',
        name: 'Jaden Mu',
        tasks: [],
      },
      {
        id: 'kt',
        name: 'Kevin Tran',
        tasks: [],
      },
    ],
    unassignedTasks: [],
  },
};

export default function BoardTabPage() {
  return (
    <div className="h-screen">
      <ClientKanbanWrapper initialData={initialData} />
    </div>
  );
}