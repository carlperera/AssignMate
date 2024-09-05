'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Header.module.css';

export default function Header() {
  const [activePage, setActivePage] = useState('/home-page');

  const isActive = (path: string): string => {
    return activePage === path ? styles.active : styles.inactive;
  };

  const handleNavClick = (path: string) => {
    setActivePage(path);
  };

  return (
    <header className={styles.header}>
      <Link href="/home-page" onClick={() => handleNavClick('/home-page')}>
        <h1>AssignMate</h1>
      </Link>
      <nav className={styles.nav}>
        <Link 
          href="/home-page" 
          className={isActive('/home-page')}
          onClick={() => handleNavClick('/home-page')}
        >
          Dashboard
        </Link>
        <Link 
          href="/projects" 
          className={isActive('/projects')}
          onClick={() => handleNavClick('/projects')}
        >
          Projects
        </Link>
        <Link 
          href="/tasks-page" 
          className={isActive('/tasks-page')}
          onClick={() => handleNavClick('/tasks-page')}
        >
          Tasks
        </Link>
      </nav>
      <input type="search" placeholder="Search" />
    </header>
  );
}