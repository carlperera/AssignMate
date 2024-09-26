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
      <header className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/home-page">
              <h1 className="text-2xl font-bold text-gray-900">AssignMate</h1>
            </Link>
          </div>
        </header>
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
        <Link 
          href="/board-tab-page" 
          className={isActive('/board-tab-page')}
        >
          Board
        </Link>
      </nav>
      <input type="search" placeholder="Search" className={styles.searchInput} />
    </header>
  );
}