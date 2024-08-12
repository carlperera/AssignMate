"use client" // Renders this component on the client/frontend, not just on the server/backend.

import React, { useState } from 'react';
import Card from '../components/Card';
import SidePanel from '../components/SidePanel';
import styles from '../styles/page.module.css';

interface Team {
  name: string;
  color: string;
  // Add more team properties as needed
}

export default function Teams() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const teams: Team[] = [
    { name: 'FIT3171 Team 2', color: '#ff9999' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' }
  ];

  const handleCardClick = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleCloseSidePanel = () => {
    setSelectedTeam(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {teams.map(team => (
          <Card 
            key={team.name} 
            name={team.name} 
            color={team.color} 
            onClick={() => handleCardClick(team)}
          />
        ))}
      </div>
      <SidePanel team={selectedTeam} onClose={handleCloseSidePanel} />
    </div>
  );
}