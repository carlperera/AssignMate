"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Folder, Plus } from "lucide-react";
import Header from '../components/Header';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { createTeamAndAddUser, createProject, fetchTeamsForUser, fetchProjectsForTeam, getCurrentUserId } from '../supabase/backendFunctions';
import supabase from '../supabase/supabaseClient';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface ProjectGroup {
  id: string;
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
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userId = await getCurrentUserId();
        if (userId) {
          const { data: teams, error: teamsError } = await fetchTeamsForUser(userId);
          if (teamsError) throw new Error(`Error fetching teams: ${teamsError.message}`);

          if (teams) {
            const teamsWithProjects = await Promise.all(teams.map(async (team) => {
              const { data: projects, error: projectsError } = await fetchProjectsForTeam(team.team_id);
              if (projectsError) throw new Error(`Error fetching projects for team ${team.team_name}: ${projectsError.message}`);

              return {
                id: team.team_id,
                name: team.team_name,
                projects: projects ? projects.map(p => ({
                  id: p.proj_id,
                  name: p.proj_name,
                  color: 'gray' // You might want to assign colors based on some logic
                })) : []
              };
            }));

            setProjectGroups(teamsWithProjects);
          }
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const teamSubscription = supabase
      .channel('team-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team' }, handleTeamChange)
      .subscribe();

    const projectSubscription = supabase
      .channel('project-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project' }, handleProjectChange)
      .subscribe();

    return () => {
      supabase.removeChannel(teamSubscription);
      supabase.removeChannel(projectSubscription);
    };
  }, []);

  const handleTeamChange = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newTeam: ProjectGroup = { id: payload.new.team_id, name: payload.new.team_name, projects: [] };
      setProjectGroups(prev => [...prev, newTeam]);
    } else if (payload.eventType === 'UPDATE') {
      setProjectGroups(prev => prev.map(group => 
        group.id === payload.new.team_id ? { ...group, name: payload.new.team_name } : group
      ));
    } else if (payload.eventType === 'DELETE') {
      setProjectGroups(prev => prev.filter(group => group.id !== payload.old.team_id));
    }
  };

  const handleProjectChange = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newProject: Project = { id: payload.new.proj_id, name: payload.new.proj_name, color: 'gray' };
      setProjectGroups(prev => prev.map(group => 
        group.id === payload.new.team_id 
          ? { ...group, projects: [...group.projects, newProject] }
          : group
      ));
    } else if (payload.eventType === 'UPDATE') {
      setProjectGroups(prev => prev.map(group => ({
        ...group,
        projects: group.projects.map(project => 
          project.id === payload.new.proj_id 
            ? { ...project, name: payload.new.proj_name }
            : project
        )
      })));
    } else if (payload.eventType === 'DELETE') {
      setProjectGroups(prev => prev.map(group => ({
        ...group,
        projects: group.projects.filter(project => project.id !== payload.old.proj_id)
      })));
    }
  };

  const toggleItem = (item: string) => {
    setOpenItems(prevItems =>
      prevItems.includes(item)
        ? prevItems.filter(i => i !== item)
        : [...prevItems, item]
    );
  };

  const handleCreateTeam = async () => {
    const teamName = prompt("Enter the new team name:");
    if (teamName) {
      try {
        const { success, error, teamId } = await createTeamAndAddUser(teamName);
        if (success && teamId) {
          setMessage(`Team "${teamName}" has been created successfully.`);
        } else {
          throw new Error(error || "Failed to create team");
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  };

  const handleCreateProject = async (teamId: string) => {
    const projectName = prompt("Enter the new project name:");
    if (projectName) {
      try {
        const { data: newProject, error } = await createProject(projectName, teamId);
        if (error) throw error;
        if (newProject) {
          setMessage(`Project "${projectName}" has been created successfully.`);
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <Header />
      <h1 className="text-2xl font-bold my-6">Your Projects</h1>
      {message && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
          <p>{message}</p>
        </div>
      )}
      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
        {projectGroups.map((group, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger 
              onClick={() => toggleItem(`item-${index}`)}
              className="text-xl font-semibold"
            >
              <div className="flex items-center w-full">
                <IconButton
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleCreateProject(group.id);
                  }}
                  size="small"
                  style={{ marginRight: '8px' }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                {group.name}
              </div>
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
      <Button 
        onClick={handleCreateTeam} 
        variant="contained" 
        style={{ marginTop: '24px' }}
      >
        Add Team
      </Button>
    </div>
  );
}