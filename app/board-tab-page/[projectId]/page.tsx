import { ClientKanbanWrapper, BoardData } from '../../components/ClientKanbanWrapper';


export default function BoardTabPage({ params }: { params: { projectId: string } }) {

  const projectId: string = params.projectId;

  
  
  return (
    <div className="h-screen overflow-hidden">
      <ClientKanbanWrapper projectId={projectId} />
    </div>
  );
}