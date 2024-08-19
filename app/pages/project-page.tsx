"use client" // Renders this component on the client/frontend, not just on the server/backend.

import React, { useState } from 'react';
import Card from '../components/Card';
import SidePanel from '../components/SidePanel';
import styles from '../styles/page.module.css'

interface Project {
  name: string;
  color: string;
}

export default function Projects() {

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects = [
    { name: 'Project Alpha', color: 'blue' },
    { name: 'Project Beta', color: '#ff99ff' },
    { name: 'Project Gamma', color: 'red' },
    { name: 'Project Delta', color: 'green' }
  ]

  const handleCardClick = (team: Project) => {
    setSelectedProject(team);
  };

  const handleCloseSidePanel = () => {
    setSelectedProject(null);
  };

  return (
    <div className={styles.grid}>
      {projects.map(project => (
        <Card key={project.name} name={project.name} color={project.color} onClick={() => handleCardClick(project)} />
      ))}
      <SidePanel team={selectedProject} onClose={handleCloseSidePanel} />
    </div>
  )
}