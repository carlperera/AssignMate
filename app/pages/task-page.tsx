"use client";

import React from 'react';
import TaskList from '../components/TaskList';
import styles from '../styles/page.module.css';

const tasksData = [
  { 
    project: "<project name 1>",
    tasks: [
      { name: "Process Diagram", tags: ["#important"], description: "description goes here..."},
      { name: "FINAL Contribution Document", tags: [], description: "description goes here..."},
      { name: "Other Worldly Game Submission", tags: ["#important", "#today"], description: "description goes here..."}
    ],
  },
  { 
    project: "<no project / uncategorised>",
    tasks: [
      { name: "Process Diagram", tags: [], description: "description goes here..."},
      { name: "call mum", tags: ["#important"], description: "lorem ipsum"},
    ],
  },
];

export default function Tasks() {
  return (
    <div className={styles.pageContainer}>
      {tasksData.map((data, index) => (
        <div key={index}>
          <h2>{data.project}</h2>
          <TaskList tasks={data.tasks} />
        </div>
      ))}
    </div>
  );
}








//   return (
//     // <div className={styles.grid}>
//     //   {teams.map(team => (
//     //     <TeamCard key={team.name} name={team.name} color={team.color} />
//     //   ))}
//     // </div>
//     <div>
//       <Header setSelectedTab={setSelectedTab} selectedTab={selectedTab}/>
//       {/* Pass state and state setter to Header */}

//       {selectedTab === 'teams' && (
//         <div className={styles.taskList}>
//           {tasksData.map((data, index) => (
//             <TaskItem key={index} project={data.project} tasks={data.tasks} />
//           ))}
//         </div>
//       )}

//       {selectedTab === 'tasks' && (
//         <div className={styles.taskList}>
//           {tasksData.map((data, index) => (
//             <TaskItem key={index} project={data.project} tasks={data.tasks} />
//           ))}
//         </div>
//       )}
//     </div>

//   )
// }