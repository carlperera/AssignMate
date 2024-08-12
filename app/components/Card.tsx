import React from "react";
import styles from "../styles/Card.module.css";

interface CardProps {
  name: string;
  color: string;
  onClick: () => void;
}

const Card = ({ name, color, onClick }: CardProps) => {
  return (
    <div
      className={styles.card}
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      {name}
    </div>
  );
};

export default Card;
