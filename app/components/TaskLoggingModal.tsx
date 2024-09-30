import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WorkSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
}

interface TaskLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onLogSession: (taskId: string, session: WorkSession) => void;
  workSessions: WorkSession[];
}

export const TaskLoggingModal: React.FC<TaskLoggingModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  onLogSession,
  workSessions,
}) => {
  const [isLogging, setIsLogging] = useState(false);
  const [currentSession, setCurrentSession] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLogging && currentSession) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - currentSession.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLogging, currentSession]);

  const startLogging = () => {
    setIsLogging(true);
    setCurrentSession(new Date());
  };

  const stopLogging = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.getTime()) / 1000);
      const newSession: WorkSession = {
        id: Date.now().toString(),
        startTime: currentSession,
        endTime,
        duration,
      };
      onLogSession(taskId, newSession);
      setIsLogging(false);
      setCurrentSession(null);
      setElapsedTime(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalTimeLogged = workSessions.reduce((total, session) => total + session.duration, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Logging: {taskTitle}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="font-semibold">Total Time Logged: {formatDuration(totalTimeLogged)}</h3>
          {isLogging && (
            <div className="mt-2">
              <p>Current Session: {formatDuration(elapsedTime)}</p>
            </div>
          )}
          <h4 className="font-semibold mt-4 mb-2">Work Sessions:</h4>
          <ul className="max-h-40 overflow-y-auto">
            {workSessions.map((session) => (
              <li key={session.id} className="mb-2">
                {session.startTime.toLocaleString()} - {session.endTime.toLocaleString()} ({formatDuration(session.duration)})
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          {isLogging ? (
            <Button onClick={stopLogging} variant="destructive">
              Stop Work Session
            </Button>
          ) : (
            <Button onClick={startLogging}>Start Work Session</Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};