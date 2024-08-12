'use client'; // tell Next.js that this is a Client Component

import { useState } from 'react';
import styles from '../styles/Header.module.css';

// interface for the Header component
interface HeaderProps {
  setCurrentPage?: (page: string) => void; // update current page
}

// Header component
export default function Header({ setCurrentPage }: HeaderProps) {
  // State to keep track of the active page
  const [activePage, setActivePage] = useState<string>('/');

  // handle navigation clicks
  const handleNavClick = (page: string) => {
    setActivePage(page); // Update the local state
    if (setCurrentPage) {
      setCurrentPage(page); // Update the parent component's state 
    }
  };

  // determine if a nav item is active
  const isActive = (path: string): string => {
    return activePage === path ? styles.active : styles.inactive;
  };

  // Render the header
  return (
    <header className={styles.header}>
      {/* Logo/Home link */}
      <h1 onClick={() => handleNavClick('/')}>AssignMate</h1>
      
      {/* Navigation menu */}
      <nav className={styles.nav}>
        {/* Teams nav item */}
        <span 
          className={isActive('/teams')} 
          onClick={() => handleNavClick('/teams')}
        >
          Your Teams
        </span>
        {/* Projects nav item */}
        <span 
          className={isActive('/projects')} 
          onClick={() => handleNavClick('/projects')}
        >
          Your Projects
        </span>
        {/* Tasks nav item */}
        <span 
          className={isActive('/tasks')} 
          onClick={() => handleNavClick('/tasks')}
        >
          Your Tasks
        </span>
      </nav>
      
      {/* Search input */}
      <input type="search" placeholder="Search" />
    </header>
  );
}