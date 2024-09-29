import React from "react";
import styles from '../styles/TaskItem.module.css';

interface TaskItemProps {
  id: string;
  title: string;
  tag?: string;
  dueDate?: string;
  assignee: string | null;
}

export default function TaskItem({ id, title, tag, dueDate, assignee }: TaskItemProps) {
  return (
    <div className={styles.taskItem}>
      <h3 className={styles.title}>{title}</h3>
      {tag && <span className={styles.tag}>{tag}</span>}
      {dueDate && <p className={styles.dueDate}>Due: {new Date(dueDate).toLocaleDateString()}</p>}
      {assignee && <p className={styles.assignee}>Assignee: {assignee}</p>}
    </div>
  );
}
