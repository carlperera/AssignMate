import styles from '../styles/Header.module.css';
import Link from 'next/link';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" legacyBehavior>
        <a>
          <h1>AssignMate</h1>
        </a>
      </Link>
      <nav>
        <Link href="/teams" legacyBehavior>
          <a>Your Teams</a>
        </Link>
        <Link href="/projects" legacyBehavior>
          <a>Your Projects</a>
        </Link>
        <Link href="/tasks" legacyBehavior>
          <a>Your Tasks</a>
        </Link>
      </nav>
      <input type="search" placeholder="Search" />
    </header>
  );
}
