"use client" // Renders this component on the client/frontend, not just on the server/backend.

import { useRouter } from 'next/navigation' // app router 
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, Calendar, LucideIcon } from 'lucide-react';
import Header from '../components/Header';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
}

// export default function DashboardPage() {
//   const router = useRouter();


  


// }
const DashboardCard = ({ title, children }: DashboardCardProps) => (
  <Card className="col-span-1">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

interface TaskItemProps {
  task: string;
  icon: LucideIcon;
  colourClass: string;
}

const TaskItem = ({ task, icon: Icon, colourClass }: TaskItemProps) => (
  <div className={`flex items-center p-2 ${colourClass}`}>
    <Icon className="mr-2" size={16} />
    <span>{task}</span>
  </div>
);

const UpcomingDeadlines = () => (
  <DashboardCard title="Upcoming Deadlines">
    <TaskItem icon={AlertCircle} task="Project A Report Due" colourClass="text-red-600" />
    <TaskItem icon={Clock} task="Team Meeting in 2 hours" colourClass="text-yellow-600" />
    <TaskItem icon={Calendar} task="Project B Milestone on Friday" colourClass="text-blue-600" />
  </DashboardCard>
);

const RecentActivity = () => (
  <DashboardCard title="Recent Activity">
    <p>Team Alpha added a new member</p>
    <p>You completed 3 tasks in Project C</p>
    <p>New comment on your task in Project A</p>
  </DashboardCard>
);

const QuickActions = () => (
  <DashboardCard title="Quick Actions">
    <button className="bg-purple-600 text-white p-2 rounded mb-2 w-full">Create New Task</button>
    <button className="bg-purple-600 text-white p-2 rounded mb-2 w-full">Schedule Meeting</button>
    <button className="bg-purple-600 text-white p-2 rounded w-full">Start New Project</button>
  </DashboardCard>
);

const YourTeams = () => (
  <DashboardCard title="Your Teams">
    <p>Team Alpha: 2 active projects</p>
    <p>Team Beta: 1 active project</p>
    <p>Team Gamma: 3 active projects</p>
  </DashboardCard>
);

const PersonalTaskList = () => (
  <DashboardCard title="Personal Task List">
    <TaskItem icon={CheckCircle} task="Review Project A documentation" colourClass="text-green-600" />
    <TaskItem icon={CheckCircle} task="Prepare for team meeting" colourClass="text-green-600" />
    <TaskItem icon={CheckCircle} task="Update Project B timeline" colourClass="text-green-600" />
  </DashboardCard>
);

export default function AssignMateHomeDashboard() {
  return (
    <div className="container mx-auto px-4">
      <Header />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Welcome back, User!</h1>
        <div className="grid grid-cols-3 gap-6">
          <UpcomingDeadlines />
          <RecentActivity />
          <QuickActions />
          <YourTeams />
          <PersonalTaskList />
        </div>
      </div>
    </div>
  );
}