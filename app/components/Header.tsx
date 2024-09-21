'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles/Header.module.css';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string): string => {
    return pathname === path ? styles.active : '';
  };

  return (
    <header className={styles.header}>
      <Link href="/home-page">
        <h1>AssignMate</h1>
      </Link>
      <nav className={styles.nav}>
        <Link 
          href="/dashboard-page" 
          className={isActive('/dashboard-page')}
        >
          Home
        </Link>
        <Link 
          href="/projects-page" 
          className={isActive('/projects-page')}
        >
          Projects
        </Link>
        <Link 
          href="/tasks-page" 
          className={isActive('/tasks-page')}
        >
          Tasks
        </Link>
      </nav>
      <input type="search" placeholder="Search" className={styles.searchInput} />
    </header>
  );
}