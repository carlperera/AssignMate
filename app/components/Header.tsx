'use client'; // notifies the frontend/client side to also render, not only backend

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
      <input type="search" placeholder="Search" />
    </header>
  );
}