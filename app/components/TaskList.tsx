import React from "react";
import TaskItem from "./TaskItem";
import styles from "../styles/TaskList.module.css";

interface TaskListProps {
  tasks: Array<{
    name: string;
    tags: string[];
    description: string;
  }>;
}


export default function TaskList({ tasks }: TaskListProps) {
  return (
    <div className={styles.taskList}>
      {tasks.map((task, index) => (
        <TaskItem
          key={index}
          name={task.name}
          tags={task.tags}
          description={task.description}
        />
      ))}
    </div>
  );
}

