"use client";

import React, { useState, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Folder, X, User, UserPlus } from "lucide-react";
import Header from '../components/Header';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { createTeamAndAddUser, createProject, fetchTeamsForUser, fetchProjectsForTeam, getCurrentUserId, deleteProject, deleteTeam, fetchUserTeamForTeam, fetchUser, fetchAllUserTeamsForUser, checkUserNameAvailable, createUserTeam } from '../supabase/backendFunctions';
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
  username: string;
  role: string;
}

interface ProjectGroup {
  id: string;
  name: string;
  description: string;
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
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [newProjectNames, setNewProjectNames] = useState<{[key: string]: string}>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMemberUsername, setNewMemberUsername] = useState<{[key: string]: string}>({});
  const [newMemberRole, setNewMemberRole] = useState<{[key: string]: string}>({});
  const [isUsernameValid, setIsUsernameValid] = useState<{[key: string]: boolean | null}>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userId = await getCurrentUserId();
        setCurrentUserId(userId);
        if (userId) {
          const { data: userTeams, error: userTeamsError } = await fetchAllUserTeamsForUser(userId);
          if (userTeamsError) throw new Error(`Error fetching user teams: ${userTeamsError.message}`);

          if (userTeams) {
            const teamsWithDetails = await Promise.all(userTeams.map(async (userTeam) => {
              const { data: team, error: teamError } = await fetchTeamsForUser(userTeam.team_id);
              if (teamError) throw new Error(`Error fetching team: ${teamError.message}`);

              const { data: projects, error: projectsError } = await fetchProjectsForTeam(userTeam.team_id);
              if (projectsError) throw new Error(`Error fetching projects: ${projectsError.message}`);

              const { data: teamMembers, error: membersError } = await fetchUserTeamForTeam(userTeam.team_id);
              if (membersError) throw new Error(`Error fetching team members: ${membersError.message}`);

              const membersWithDetails = await Promise.all(teamMembers.map(async (member) => {
                const { data: userData, error: userError } = await fetchUser(member.user_id);
                if (userError) throw new Error(`Error fetching user data: ${userError.message}`);

                return {
                  id: userData.user_id,
                  firstName: userData.user_fname,
                  lastName: userData.user_lname,
                  username: userData.user_username,
                  role: member.user_team_role
                };
              }));

              return {
                id: team.team_id,
                name: team.team_name,
                description: team.team_desc || '',
                projects: projects ? projects.map(p => ({
                  id: p.proj_id,
                  name: p.proj_name,
                  color: 'gray'
                })) : [],
                members: membersWithDetails
              };
            }));

            setProjectGroups(teamsWithDetails);
            setOpenItems(teamsWithDetails.map(team => team.id));
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
    // Implement real-time team changes here
  };

  const handleProjectChange = async (payload: any) => {
    // Implement real-time project changes here
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

  const isUserAdmin = (teamId: string) => {
    const team = projectGroups.find(group => group.id === teamId);
    return team?.members.some(member => member.id === currentUserId && member.role === 'admin');
  };

  const handleCheckUsername = async (teamId: string, username: string) => {
    const isValid = await checkUserNameAvailable(username);
    setIsUsernameValid(prev => ({ ...prev, [teamId]: !isValid })); // Username is valid if it's not available (i.e., it exists)
  };

  const handleAddTeamMember = async (teamId: string) => {
    const username = newMemberUsername[teamId];
    const role = newMemberRole[teamId];
    if (username && role && isUsernameValid[teamId]) {
      try {
        const { data: userData, error: userError } = await fetchUser(username);
        if (userError) throw userError;
        if (userData) {
          const { error: createError } = await createUserTeam(userData.user_id, teamId, role as any);
          if (createError) throw createError;
          setMessage(`User ${username} added to the team successfully.`);
          // Refresh the team members list
          // You might want to implement a function to fetch just the new member and add it to the state
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  };

  const toggleItem = (teamId: string) => {
    setOpenItems(prevItems =>
      prevItems.includes(teamId)
        ? prevItems.filter(id => id !== teamId)
        : [...prevItems, teamId]
    );
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
        {projectGroups.map((group) => (
          <AccordionItem value={group.id} key={group.id}>
            <AccordionTrigger 
              onClick={() => toggleItem(group.id)}
              className="text-xl font-semibold bg-gray-100 p-4 rounded-t-lg"
            >
              <div className="flex items-center w-full justify-between">
                <span>{group.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 p-4 rounded-b-lg">
                <p className="text-gray-600 mb-4">{group.description}</p>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Team Members</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 bg-white p-2 rounded">
                        <Avatar><User /></Avatar>
                        <div>
                          <p className="font-medium">{`${member.firstName} ${member.lastName}`}</p>
                          <p className="text-sm text-gray-500">{member.username}</p>
                          <p className="text-xs text-gray-400">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {isUserAdmin(group.id) && (
                    <div className="mt-4 flex items-center space-x-2">
                      <TextField
                        size="small"
                        placeholder="Username"
                        value={newMemberUsername[group.id] || ''}
                        onChange={(e) => {
                          setNewMemberUsername(prev => ({ ...prev, [group.id]: e.target.value }));
                          handleCheckUsername(group.id, e.target.value);
                        }}
                        error={isUsernameValid[group.id] === false}
                        helperText={isUsernameValid[group.id] === false ? "Username not found" : ""}
                      />
                      <Select
                        size="small"
                        value={newMemberRole[group.id] || ''}
                        onChange={(e) => setNewMemberRole(prev => ({ ...prev, [group.id]: e.target.value }))}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select Role</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="member">Member</MenuItem>
                      </Select>
                      <IconButton
                        onClick={() => handleAddTeamMember(group.id)}
                        disabled={!isUsernameValid[group.id] || !newMemberRole[group.id]}
                      >
                        <UserPlus />
                      </IconButton>
                    </div>
                  )}
                </div>
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
                    