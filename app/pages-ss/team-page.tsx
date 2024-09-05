"use client"

import React, { useState } from 'react';
import Card from '../components/Card';
import SidePanel from '../components/SidePanel';
import AddTeamButton from '../components/AddTeamButton';
import styles from '../styles/page.module.css';

interface Team {
  id: number;
  name: string;
  color: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'FIT3171 Team 2', color: '#ff9999' },
    { id: 2, name: 'FIT3178 Team 5', color: '#ff99ff' },
  ]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleCardClick = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleCloseSidePanel = () => {
    setSelectedTeam(null);
  };

  const handleAddTeam = (newTeam: { name: string; color: string }) => {
    const newId = Math.max(...teams.map(t => t.id), 0) + 1;
    setTeams([...teams, { ...newTeam, id: newId }]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {teams.map(team => (
          <Card 
            key={team.id} 
            name={team.name} 
            color={team.color} 
            onClick={() => handleCardClick(team)}
          />
        ))}
      </div>
      <SidePanel team={selectedTeam} onClose={handleCloseSidePanel} />
      <div className={styles.addButtonContainer}>
        <AddTeamButton onAddTeam={handleAddTeam} />
      </div>
    </div>
  );
}