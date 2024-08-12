'use client'; // notifies the frontend/client side to also render, not only backend

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
      <Link href="/" legacyBehavior>
        <a>
          <h1>AssignMate</h1>
        </a>
      </Link>
      <nav className={styles.nav}>
        <Link href="/teams" legacyBehavior>
          <a className={isActive('/teams')}>Your Teams</a>
        </Link>
        <Link href="/projects" legacyBehavior>
          <a className={isActive('/projects')}>Your Projects</a>
        </Link>
        <Link href="/tasks" legacyBehavior>
          <a className={isActive('/tasks')}>Your Tasks</a>
        </Link>
      </nav>
      
      {/* Search input */}
      <input type="search" placeholder="Search" />
    </header>
  );
}