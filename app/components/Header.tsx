'use client';

import styles from '../styles/Header.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? styles.active : styles.inactive;
  };

  return (
    <header className={styles.header}>
      <Link href="/">
        <h1>AssignMate</h1>
      </Link>
      <nav className={styles.nav}>
        <Link href="/teams" className={isActive('/teams')}>
          Your Teams
        </Link>
        <Link href="/projects" className={isActive('/projects')}>
          Your Projects
        </Link>
        <Link href="/tasks" className={isActive('/tasks')}>
          Your Tasks
        </Link>
      </nav>
      <input type="search" placeholder="Search" />
    </header>
  );
}