import { ClientKanbanWrapper, BoardData } from '../components/ClientKanbanWrapper';

const initialData: BoardData = {
  todo: {
    title: 'To Do',
    teamMembers: [
      {
        id: 'cp',
        name: 'Carl Perera',
        tasks: [
          { id: '1', title: 'Implement user authentication', tag: 'feature', assignee: 'cp', dueDate: '2024-10-15' },
          { id: '2', title: 'Design landing page', tag: 'design', assignee: 'cp' },
        ],
      },
      {
        id: 'pf',
        name: 'Patrick Fitzgerald',
        tasks: [
          { id: '3', title: 'Set up CI/CD pipeline', tag: 'devops', assignee: 'pf', dueDate: '2024-10-20' },
        ],
      },
      {
        id: 'jm',
        name: 'Jaden Mu',
        tasks: [
          { id: '4', title: 'Create API documentation', tag: 'documentation', assignee: 'jm' },
        ],
      },
      {
        id: 'kt',
        name: 'Kevin Tran',
        tasks: [
          { id: '5', title: 'Optimize database queries', tag: 'performance', assignee: 'kt', dueDate: '2024-10-18' },
        ],
      },
    ],
    unassignedTasks: [
      { id: '6', title: 'Write unit tests', tag: 'testing', assignee: null },
      { id: '7', title: 'Research new technologies', tag: 'research', assignee: null, dueDate: '2024-11-01' },
    ],
  },
  inProgress: {
    title: 'In Progress',
    teamMembers: [
      {
        id: 'cp',
        name: 'Carl Perera',
        tasks: [
          { id: '8', title: 'Refactor codebase', tag: 'maintenance', assignee: 'cp', dueDate: '2024-10-25' },
        ],
      },
      {
        id: 'pf',
        name: 'Patrick Fitzgerald',
        tasks: [
          { id: '9', title: 'Implement real-time notifications', tag: 'feature', assignee: 'pf' },
        ],
      },
      {
        id: 'jm',
        name: 'Jaden Mu',
        tasks: [
          { id: '10', title: 'Create user onboarding flow', tag: 'ux', assignee: 'jm', dueDate: '2024-10-30' },
        ],
      },
      {
        id: 'kt',
        name: 'Kevin Tran',
        tasks: [
          { id: '11', title: 'Integrate third-party API', tag: 'integration', assignee: 'kt' },
        ],
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
        tasks: [
          { id: '12', title: 'Set up project repository', tag: 'setup', assignee: 'cp' },
        ],
      },
      {
        id: 'pf',
        name: 'Patrick Fitzgerald',
        tasks: [
          { id: '13', title: 'Create database schema', tag: 'database', assignee: 'pf' },
        ],
      },
      {
        id: 'jm',
        name: 'Jaden Mu',
        tasks: [
          { id: '14', title: 'Design system architecture', tag: 'architecture', assignee: 'jm' },
        ],
      },
      {
        id: 'kt',
        name: 'Kevin Tran',
        tasks: [
          { id: '15', title: 'Set up development environment', tag: 'setup', assignee: 'kt' },
        ],
      },
    ],
    unassignedTasks: [],
  },
};

export default function BoardTabPage() {
  return (
    <div className="h-screen overflow-hidden">
      <ClientKanbanWrapper initialData={initialData} />
    </div>
  );
}