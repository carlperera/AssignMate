"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Folder } from "lucide-react";
import Header from '../../components/Header';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface ProjectGroup {
  name: string;
  projects: Project[];
}

const ProjectCard = ({ id, name, color }: Project) => {
  return (
    <Link href={`/projects-page/${id}`} passHref>
      <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Folder className="mr-2" style={{ color }} />
            <span>{name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Project details</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function Projects() {
  const projectGroups: ProjectGroup[] = [
    {
      name: "Team 1",
      projects: [
        { id: 'alpha', name: 'Project Alpha', color: 'blue' },
        { id: 'beta', name: 'Project Beta', color: '#ff99ff' },
      ]
    },
    {
      name: "Team 2",
      projects: [
        { id: 'gamma', name: 'Project Gamma', color: 'red' },
        { id: 'delta', name: 'Project Delta', color: 'green' },
        { id: 'epsilon', name: 'Project Epsilon', color: 'purple' },
      ]
    },
    {
      name: "Team 3",
      projects: [
        { id: 'zeta', name: 'Project Zeta', color: 'orange' },
        { id: 'eta', name: 'Project Eta', color: 'pink' },
      ]
    }
  ];

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
      <Header />
      <h1 className="text-2xl font-bold my-6">Your Projects</h1>
      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
        {projectGroups.map((group, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger 
              onClick={() => toggleItem(`item-${index}`)}
              className="text-xl font-semibold"
            >
              {group.name}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {group.projects.map(project => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}