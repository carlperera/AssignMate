"use client";

import styles from '../styles/Header.module.css'

interface HeaderProps {
    setSelectedTab: (tab: string) => void;
    selectedTab: string;
}

export default function Header({setSelectedTab, selectedTab}: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1>AssignMate</h1>
      <nav>
        <a href="#" onClick={() => setSelectedTab('teams')} className={selectedTab === 'teams' ? styles.active : ''}>Your Teams</a>
        <a href="#" onClick={() => setSelectedTab('projects')} className={selectedTab === 'projects' ? styles.active : ''}>Your Projects</a>
        <a href="#" onClick={() => setSelectedTab('tasks')} className={selectedTab === 'tasks' ? styles.active : ''}>All Tasks</a>
      </nav>
      <input type="search" placeholder="Search" />
    </header>
  )
}