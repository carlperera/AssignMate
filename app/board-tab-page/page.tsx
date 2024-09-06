import { ClientKanbanWrapper } from '../components/ClientKanbanWrapper';

const initialData = {
  todo: {
    title: 'To Do',
    tasks: [
      { id: '1', title: 'Task 1', tag: 'feature' },
      { id: '2', title: 'Task 2', tag: 'bug' },
    ],
  },
  inProgress: {
    title: 'In Progress',
    tasks: [
      { id: '3', title: 'Task 3', tag: 'improvement' },
    ],
  },
  done: {
    title: 'Done',
    tasks: [
      { id: '4', title: 'Task 4', tag: 'feature' },
    ],
  },
};

export default function BoardTabPage() {
  return (
    <div>
      <h1>Board Tab</h1>
      <ClientKanbanWrapper initialData={initialData} />
    </div>
  );
}