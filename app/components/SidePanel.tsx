import React, { useState, useEffect, useCallback } from "react";
import styles from "../styles/SidePanel.module.css";

interface SidePanelProps {
  team: {
    name: string;
    color: string;
    // Add more team properties as needed
  } | null;
  onClose: () => void;
}

const SidePanel = ({ team, onClose }: SidePanelProps) => {
  const [width, setWidth] = useState(550); // Initial width
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newWidth = window.innerWidth - e.clientX;
        setWidth(Math.max(550, Math.min(newWidth, 1200))); // Min 550px, max 1200px
      }
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!team) return null;

  return (
    <div className={styles.sidePanel} style={{ width: `${width}px` }}>
      <div className={styles.resizeHandle} onMouseDown={handleMouseDown}></div>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
      <h2>{team.name}</h2>
      <div>
        Color:{" "}
        <span style={{ backgroundColor: team.color, padding: "2px 10px" }}>
          {team.color}
        </span>
      </div>
      {/* Add more team details here */}
    </div>
  );
};

export default SidePanel;
