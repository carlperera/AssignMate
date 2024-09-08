import React from 'react';
import AssignMateUI from '../../components/Sidebar';

const projectData = {
  alpha: { name: 'Project Alpha', color: 'blue', description: 'This is Project Alpha' },
  beta: { name: 'Project Beta', color: '#ff99ff', description: 'This is Project Beta' },
  gamma: { name: 'Project Gamma', color: 'red', description: 'This is Project Gamma' },
  delta: { name: 'Project Delta', color: 'green', description: 'This is Project Delta' },
  epsilon: { name: 'Project Epsilon', color: 'purple', description: 'This is Project Epsilon' },
  zeta: { name: 'Project Zeta', color: 'orange', description: 'This is Project Zeta' },
  eta: { name: 'Project Eta', color: 'pink', description: 'This is Project Eta' },
};

export async function generateStaticParams() {
    const ids = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta'];
    return ids.map((id) => ({
      id: id,
    }));
  }

export default function ProjectPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const project = projectData[projectId as keyof typeof projectData];

  if (!project) {
    return (
      <AssignMateUI>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p>Sorry, the project you're looking for doesn't exist.</p>
        </div>
      </AssignMateUI>
    );
  }

  return (
    <AssignMateUI>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4" style={{ color: project.color }}>
          {project.name}
        </h1>
        <p className="mb-4">{project.description}</p>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Project Details</h2>
          <p><strong>ID:</strong> {projectId}</p>
          <p><strong>Color:</strong> {project.color}</p>
          {/* Add more project details here */}
        </div>
      </div>
    </AssignMateUI>
  );
}