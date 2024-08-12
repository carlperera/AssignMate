'use client';

import { useState } from 'react';
import Header from './components/Header';
import Teams from './teams/page';
import Projects from './projects/page';
import Tasks from './tasks/page';
import styles from "./styles/Layout.module.css";

export default function Home() {
  const [currentPage, setCurrentPage] = useState('/');

  return (
    <>
      <Header setCurrentPage={setCurrentPage} />
      <main className={styles.main}>
        {currentPage === '/' && <h1>Welcome to AssignMate</h1>}
        {currentPage === '/teams' && <Teams />}
        {currentPage === '/projects' && <Projects />}
        {currentPage === '/tasks' && <Tasks />}
      </main>
    </>
  );
}