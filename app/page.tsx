"use client";

import { useState } from 'react'
import TeamCard from './components/TeamCard'
import styles from './styles/page.module.css'
import TaskItem from './components/TaskItem'
import Header from './components/Header'

export default function Page() {
  const [selectedTab, setSelectedTab] = useState('teams');

  const tasksData = [
    { 
      project: "<project name 1>",
      tasks: [
        { name: "Process Diagram", tags: "#important", description: "description goes here..."},
        { name: "FINAL Contribution Document", tags: "", description: "description goes here..."},
        { name: "Other Worldly Game Submission", tags: "", description: "description goes here..."}
      ],
    },
    { 
      project: "<no project / uncategorised>",
      tasks: [
        { name: "Process Diagram", tags: "", description: "description goes here..."},
        { name: "call mum", tags: "#important", description: "description goes here..."},
      ],
    },
  ]
  
  const teams = [
    { name: 'FIT3171 Team 2', color: '#ff9999' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },

    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },

    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },

    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },

    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    
    // ... add all other teams
  ]

  return (
    // <div className={styles.grid}>
    //   {teams.map(team => (
    //     <TeamCard key={team.name} name={team.name} color={team.color} />
    //   ))}
    // </div>
    <div>
      <Header setSelectedTab={setSelectedTab} selectedTab={selectedTab}/>
      {/* Pass state and state setter to Header */}

      {selectedTab === 'teams' && (
        <div className={styles.taskList}>
          {tasksData.map((data, index) => (
            <TaskItem key={index} project={data.project} tasks={data.tasks} />
          ))}
        </div>
      )}

      {selectedTab === 'tasks' && (
        <div className={styles.taskList}>
          {tasksData.map((data, index) => (
            <TaskItem key={index} project={data.project} tasks={data.tasks} />
          ))}
        </div>
      )}
    </div>

  )
}