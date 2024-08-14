import React from "react";
import styles from '../styles/TaskItem.module.css';

interface TaskItemProps {
  name: string;
  tags: string[];
  description: string;
}

export default function TaskItem({ name, tags, description }: TaskItemProps) {
  return (
    <div className={styles.taskItem}>
      <h3 className={styles.name}>{name}</h3>
      <div className={styles.tags}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

