"use client";

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info } from "lucide-react";
import Header from '../components/Header';
import styles from '../styles/page.module.css';

interface Task {
  id: string;
  name: string;
  tags: string[];
  progress: number;
}

interface ProjectTasks {
  project: string;
  tasks: Task[];
}

interface TaskItemProps {
  task: Task;
}

const tasksData: ProjectTasks[] = [
  { 
    project: "Project 1",
    tasks: [
      { id: "1-1", name: "Process Diagram", tags: ["#important"], progress: 20 },
      { id: "1-2", name: "FINAL Contribution Document", tags: [], progress: 0 },
      { id: "1-3", name: "Other Worldly Game Submission", tags: ["#important"], progress: 50 },
      { id: "1-4", name: "Project Finance Report", tags: ["#in-office"], progress: 20 },
      { id: "1-5", name: "Business Case Proposal", tags: [], progress: 15 },
      { id: "1-6", name: "Project Delta Proposal", tags: [], progress: 0 },
    ],
  },
  { 
    project: "Project 2",
    tasks: [
      { id: "1-1", name: "Process Diagram", tags: ["#important"], progress: 20 },
      { id: "1-2", name: "FINAL Contribution Document", tags: [], progress: 0 },
      { id: "1-3", name: "Other Worldly Game Submission", tags: ["#important"], progress: 50 },
      { id: "1-4", name: "Project Finance Report", tags: ["#in-office"], progress: 20 },
      { id: "1-5", name: "Business Case Proposal", tags: [], progress: 15 },
      { id: "1-6", name: "Project Delta Proposal", tags: [], progress: 0 },
    ],
  },
  { 
    project: "Project 3",
    tasks: [
      { id: "1-1", name: "Process Diagram", tags: ["#important"], progress: 20 },
      { id: "1-2", name: "FINAL Contribution Document", tags: [], progress: 0 },
      { id: "1-3", name: "Other Worldly Game Submission", tags: ["#important"], progress: 50 },
      { id: "1-4", name: "Project Finance Report", tags: ["#in-office"], progress: 20 },
      { id: "1-5", name: "Business Case Proposal", tags: [], progress: 15 },
      { id: "1-6", name: "Project Delta Proposal", tags: [], progress: 0 },
    ],
  }
];

const TaskItem = ({ task }: TaskItemProps) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center space-x-2">
      <span>{task.name}</span>
      {task.tags.map((tag, index) => (
        <Badge key={index} variant="secondary">{tag}</Badge>
      ))}
    </div>
    <div className="flex items-center space-x-2">
      <Progress value={task.progress} className="w-[100px]" />
      <span>{task.progress}%</span>
      <Dialog>
        <DialogTrigger asChild>
          <Info
            className="cursor-pointer text-gray-500 hover:text-gray-700"
            size={20}
          />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{task.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Progress: {task.progress}%</p>
            <p>Tags: {task.tags.join(', ') || 'None'}</p>
            {/* Add more task details here */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
);

export default function Tasks() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (item: string) => {
    setOpenItems(prevItems =>
      prevItems.includes(item)
        ? prevItems.filter(i => i !== item)
        : [...prevItems, item]
    );
  };

  return (
    <div className="container mx-auto px-4">
    <div className={styles.pageContainer}>
      <Header />
      <h1 className="text-2xl font-bold my-6">All Tasks</h1>
      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
        {tasksData.map((project, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger 
              onClick={() => toggleItem(`item-${index}`)}
              className="text-xl font-semibold"
            >
              {project.project}
            </AccordionTrigger>
            <AccordionContent>
              {project.tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
    </div>
  );
}