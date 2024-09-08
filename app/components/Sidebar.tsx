"use client";

import React, { useState, ReactNode } from 'react';
import { ChevronDown, BarChart2, Layout, CheckSquare, Target, MessageSquare, Users, Calendar, Bot, FileText, Settings, LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label }) => (
  <li className="flex items-center space-x-2 py-2 px-4 hover:bg-purple-100 cursor-pointer">
    <Icon size={20} className="text-gray-600" />
    <span className="text-gray-700">{label}</span>
  </li>
);

interface AssignMateUIProps {
  children: ReactNode;
}

const AssignMateUI: React.FC<AssignMateUIProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('Timeline');

  const tabs: string[] = ['Timeline', 'Board', 'Backlog', 'Sprints', 'Goals'];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-purple-600">AssignMate</h1>
        </div>
        <nav>
          <ul>
            <SidebarItem icon={BarChart2} label="Timeline" />
            <SidebarItem icon={Layout} label="Board" />
            <SidebarItem icon={CheckSquare} label="Backlog" />
            <SidebarItem icon={Target} label="Sprints" />
            <SidebarItem icon={Target} label="Goals" />
            <SidebarItem icon={MessageSquare} label="Chat" />
            <SidebarItem icon={Users} label="Meetings" />
            <SidebarItem icon={Calendar} label="Meeting Schedule" />
            <SidebarItem icon={Bot} label="Smart Assistant" />
            <SidebarItem icon={FileText} label="Project Pages" />
            <SidebarItem icon={Settings} label="Settings" />
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button className="font-semibold text-gray-700">Main</button>
              <button className="flex items-center space-x-1 text-gray-600">
                <span>Teams</span>
                <ChevronDown size={16} />
              </button>
              <button className="flex items-center space-x-1 text-gray-600">
                <span>Projects</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex space-x-4 px-4 border-b">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`py-2 px-1 -mb-px ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* Page content */}
        {children}
      </main>
    </div>
  );
};

export default AssignMateUI;