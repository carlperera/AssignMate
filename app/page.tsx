'use client';

import { useState } from 'react';
import Header from './components/Header';
import HomePage from './pages/home-page';
import Teams from './pages/team-page';
import Projects from './pages/project-page';
import Tasks from './pages/task-page';
import styles from "./styles/Layout.module.css";

export default function Home() {
  const [currentPage, setCurrentPage] = useState('/');

  return (
    <>
      <Header setCurrentPage={setCurrentPage} />
      <main className={styles.main}>
        {currentPage === '/' && <HomePage />}
        {currentPage === '/teams' && <Teams />}
        {currentPage === '/projects' && <Projects />}
        {currentPage === '/tasks' && <Tasks />}
      </main>
    </>
  );
}

