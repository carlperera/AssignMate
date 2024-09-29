"use client";

import React, { useState, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Folder, ChevronDown, X, User } from "lucide-react";
import Header from '../components/Header';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import { createTeamAndAddUser, createProject, fetchTeamsForUser, fetchProjectsForTeam, getCurrentUserId, deleteProject, deleteTeam, fetchUserTeamForTeam, fetchUser } from '../supabase/backendFunctions';
import supabase from '../supabase/supabaseClient';


interface Project {
  id: string;
  name: string;
  color: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface ProjectGroup {
  id: string;
  name: string;
  projects: Project[];
  members: TeamMember[];
}

const ProjectCard = ({ id, name, color, onDelete }: Project & { onDelete: () => void }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer relative">
      <IconButton
        onClick={onDelete}
        size="small"
        style={{ position: 'absolute', top: 5, right: 5 }}
      >
        <X size={16} />
      </IconButton>
      <Link href={`/projects-page/${id}`} passHref>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Folder className="mr-2" style={{ color }} />
            <span>{name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Project details</p>
        </CardContent>
      </Link>
    </Card>
  );
};

export default function Projects() {
  //state management - using a react hook "useState" here to add a state variable to our component
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [newProjectNames, setNewProjectNames] = useState<{[key: string]: string}>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        //get the user id of the currently signed in user 
        const userId = await getCurrentUserId();
        setCurrentUserId(userId); //set state

        //if user currently signed in (assumed)
        if (userId) {
          const { data: teams, error: teamsError } = await fetchTeamsForUser(userId);
          if (teamsError) throw new Error(`Error fetching teams: ${teamsError.message}`);

          if (teams) {
            const teamsWithProjectsAndMembers = await Promise.all(teams.map(async (team) => {
              const { data: projects, error: projectsError } = await fetchProjectsForTeam(team.team_id);
              if (projectsError) throw new Error(`Error fetching projects for team ${team.team_name}: ${projectsError.message}`);

              const { data: userTeams, error: membersError } = await fetchUserTeamForTeam(team.team_id);
              if (membersError) throw new Error(`Error fetching members for team ${team.team_name}: ${membersError.message}`);

              
              const members = await Promise.all(userTeams.map(async (userTeam) => {
                const { data: userData, error: userError } = await fetchUser(userTeam.user_id);
                if (userError) throw new Error(`Error fetching user data: ${userError.message}`);

                return {
                  id: userTeam.user_id,
                  firstName: userData.user_fname,
                  lastName: userData.user_lname,
                  role: userTeam.user_team_role
                };
              }));

              return {
                id: team.team_id,
                name: team.team_name,
                projects: projects ? projects.map(p => ({
                  id: p.proj_id,
                  name: p.proj_name,
                  color: 'gray'
                })) : [],
                members: members
              };
            }));

            setProjectGroups(teamsWithProjectsAndMembers);
            const initialProjectNames = teamsWithProjectsAndMembers.reduce((acc, team) => {
              acc[team.id] = '';
              return acc;
            }, {} as {[key: string]: string});
            setNewProjectNames(initialProjectNames);
            setOpenItems(teamsWithProjectsAndMembers.map(team => team.id));
          }
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const teamSubscription = supabase
      .channel('team-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team' }, handleTeamChange)
      .subscribe();
    
    // const userTeamSubscription = supabase
    // .channel('userTeam-changes')
    // .on('postgres_changes', { event: '*', schema: 'public', table: 'user_team' }, handleUserTeamChange)
    // .subscribe();

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
      setProjectGroups(prev => {
        const newGroup: ProjectGroup = { id: payload.new.team_id, name: payload.new.team_name, projects: [] };
        return [...prev, newGroup];
      });
      setNewProjectNames(prev => ({ ...prev, [payload.new.team_id]: '' }));
      // Optionally open the new team
      // setOpenItems(prev => [...prev, payload.new.team_id]);
    } else if (payload.eventType === 'UPDATE') {
      setProjectGroups(prev => prev.map(group => 
        group.id === payload.new.team_id ? { ...group, name: payload.new.team_name } : group
      ));
    } else if (payload.eventType === 'DELETE') {
      setProjectGroups(prev => prev.filter(group => group.id !== payload.old.team_id));
      setNewProjectNames(prev => {
        const { [payload.old.team_id]: _, ...rest } = prev;
        return rest;
      });
      setOpenItems(prev => prev.filter(id => id !== payload.old.team_id));
    }
  };

  // const handleUserTeamChange = async (payload: any) => {
  //   if (payload.eventType === 'INSERT') {
  //     setProjectGroups(prev => {
  //       const newGroup: ProjectGroup = { id: payload.new.team_id, name: payload.new.team_name, projects: [] };
  //       return [...prev, newGroup];
  //     });
  //     setNewProjectNames(prev => ({ ...prev, [payload.new.team_id]: '' }));
  //     // Optionally open the new team
  //     // setOpenItems(prev => [...prev, payload.new.team_id]);
  //   } else if (payload.eventType === 'UPDATE') {
  //     setProjectGroups(prev => prev.map(group => 
  //       group.id === payload.new.team_id ? { ...group, name: payload.new.team_name } : group
  //     ));
  //   } else if (payload.eventType === 'DELETE') {
  //     setProjectGroups(prev => prev.filter(group => group.id !== payload.old.team_id));
  //     setNewProjectNames(prev => {
  //       const { [payload.old.team_id]: _, ...rest } = prev;
  //       return rest;
  //     });
  //     setOpenItems(prev => prev.filter(id => id !== payload.old.team_id));
  //   }
  // };


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

  const handleCreateTeam = async () => {
    if (newTeamName.trim()) {
      try {
        const { success, error, teamId } = await createTeamAndAddUser(newTeamName);
        if (success && teamId) {
          setMessage(`Team "${newTeamName}" has been created successfully.`);
          setNewTeamName('');
        } else {
          throw new Error(error || "Failed to create team");
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  };

  const handleCreateProject = async (teamId: string) => {
    const projectName = newProjectNames[teamId];
    if (projectName && projectName.trim()) {
      try {
        const { data: newProject, error } = await createProject(projectName, teamId);
        if (error) throw error;
        if (newProject) {
          setMessage(`Project "${projectName}" has been created successfully.`);
          setNewProjectNames(prev => ({ ...prev, [teamId]: '' }));
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>, action: () => void) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      action();
    }
  };

  const handleDeleteProject = async (teamId: string, projectId: string) => {
    try {
      const error = await deleteProject(projectId);
      if (error) throw error;
      setProjectGroups(prev => 
        prev.map(group => 
          group.id === teamId 
            ? { ...group, projects: group.projects.filter(p => p.id !== projectId) }
            : group
        )
      );
      setMessage("Project deleted successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const error = await deleteTeam(teamId);
      if (error) throw error;
      setProjectGroups(prev => prev.filter(group => group.id !== teamId));
      setMessage("Team deleted successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  //check if current user is the admin of a team - so that if they are they are can delete the team, or any projects in the team
  const isUserAdmin = (teamId: string) => {
    const team = projectGroups.find(group => group.id === teamId);
    return team?.members.some(member => member.id === currentUserId && member.role === 'admin');
  };

  const toggleItem = (teamId: string) => {
    setOpenItems(prevItems =>
      prevItems.includes(teamId)
        ? prevItems.filter(id => id !== teamId)
        : [...prevItems, teamId]
    );
  };

  const collapseAll = () => {
    setOpenItems([]);
  };

  const expandAll = () => {
    setOpenItems(projectGroups.map(group => group.id));
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
      <div className="mb-4">
        <Button onClick={expandAll} variant="outlined" style={{ marginRight: '8px' }}>Expand All</Button>
        <Button onClick={collapseAll} variant="outlined">Collapse All</Button>
      </div>
      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
        {projectGroups.map((group) => (
          <AccordionItem value={group.id} key={group.id}>
            <AccordionTrigger 
              onClick={() => toggleItem(group.id)}
              className="text-xl font-semibold bg-gray-100 p-4 rounded-t-lg"
            >
              <div className="flex items-center w-full justify-between">
                <span>{group.name}</span>
                <ChevronDown size={24} className={`transition-transform duration-200 ${openItems.includes(group.id) ? 'transform rotate-180' : ''}`} />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 p-4 rounded-b-lg">
                <TableContainer component={Paper} style={{ marginBottom: '1rem' }}>
                  <Table aria-label="team members table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Member</TableCell>
                        <TableCell>Full Name</TableCell>
                        <TableCell>Role</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <Avatar><User /></Avatar>
                          </TableCell>
                          <TableCell>{`${member.firstName} ${member.lastName}`}</TableCell>
                          <TableCell>{member.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {group.projects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      {...project} 
                      onDelete={() => isUserAdmin(group.id) && handleDeleteProject(group.id, project.id)}
                    />
                  ))}
                </div>
                <div className="flex items-center">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="New project name"
                    value={newProjectNames[group.id] || ''}
                    onChange={(e) => setNewProjectNames(prev => ({ ...prev, [group.id]: e.target.value }))}
                    onKeyPress={(e) => handleKeyPress(e, () => handleCreateProject(group.id))}
                    style={{ marginRight: '8px', flexGrow: 1 }}
                  />
                  <Button 
                    onClick={() => handleCreateProject(group.id)}
                    variant="contained" 
                    disabled={!newProjectNames[group.id]?.trim()}
                  >
                    Add Project
                  </Button>
                </div>
                {isUserAdmin(group.id) && (
                  <Button 
                    onClick={() => handleDeleteTeam(group.id)}
                    variant="outlined" 
                    color="secondary"
                    style={{ marginTop: '1rem' }}
                  >
                    Delete Team
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-6 flex items-center">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="New team name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, handleCreateTeam)}
          style={{ marginRight: '8px', flexGrow: 1 }}
        />
        <Button 
          onClick={handleCreateTeam}
          variant="contained" 
          disabled={!newTeamName.trim()}
        >
          Add Team
        </Button>
      </div>
    </div>
  );
}