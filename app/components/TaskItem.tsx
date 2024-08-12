import React from "react";
import styles from '../styles/TeamCard.module.css'

interface TaskItemProps {
    name: string;
    tags: string[];
    description: string;
}

export default function TaskItem({ name, tags, description }: TaskItemProps) {
    return (
        <div className="task-item">
            <span className="name">{name}</span>
            <span className="tags">{tags}</span>
            <span className="description">{description}</span>
        </div>
    )
}
