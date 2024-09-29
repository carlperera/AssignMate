"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Folder, ChevronDown, User, X, UserPlus, ChevronUp } from "lucide-react";
import Header from '../components/Header';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { createTeamAndAddUser, createProject, fetchTeamsForUser, fetchProjectsForTeam, getCurrentUserId, fetchAllUserTeamForTeam, fetchUser, checkNewTeamMember, deleteProject, deleteTeam, createUserTeam, fetchUserByUserName, deleteUserTeam, updateUserTeamRole } from '../supabase/backendFunctions';
import supabase from '../supabase/supabaseClient';
import { AddUserNameToTeam, UserTeamRole } from '../supabase/databaseTypes';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  role: 'admin' | 'member';
  teamId: string;
}

interface Team {
  id: string;
  name: string;
  projects: Project[];
  members: TeamMember[];
}

const ProjectCard = ({ id, name, color, onDelete, isAdmin }: Project & { onDelete: () => void, isAdmin: boolean }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer relative">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Folder className="mr-2" style={{ color }} />
            <span>{name}</span>
          </div>
          {isAdmin && (
            <IconButton
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              size="small"
              style={{ 
                color: '#ef4444',
                padding: '4px',
                marginRight: '-8px',
                marginTop: '-8px'
              }}
            >
              <X size={16} />
            </IconButton>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Project details</p>
      </CardContent>
    </Card>
  );
};

const TeamMemberCard = ({ 
  id, 
  firstName, 
  lastName, 
  userName, 
  role, 
  teamId,
  onDelete, 
  onRoleChange,
  isCurrentUser,
  isAdmin 
}: TeamMember & { 
  onDelete: () => void, 
  onRoleChange: (newRole: 'admin' | 'member') => void,
  isCurrentUser: boolean,
  isAdmin: boolean
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 relative">
      <CardContent className="flex items-center p-4">
        <User className="mr-2" />
        <div className="flex-grow">
          <p className="font-semibold">{firstName} {lastName}</p>
          <p className="text-sm text-muted-foreground">@{userName}</p>
          <div className="flex items-center">
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
            {!isCurrentUser && isAdmin && (
              role === 'member' ? (
                <IconButton onClick={() => onRoleChange('admin')} size="small" style={{ color: 'green', padding: 0, marginLeft: '4px' }}>
                  <ChevronUp size={16} />
                </IconButton>
              ) : (
                <IconButton onClick={() => onRoleChange('member')} size="small" style={{ color: 'red', padding: 0, marginLeft: '4px' }}>
                  <ChevronDown size={16} />
                </IconButton>
              )
            )}
          </div>
        </div>
        {isAdmin && !isCurrentUser && (
          <IconButton
            onClick={onDelete}
            size="small"
            style={{ color: '#ef4444', position: 'absolute', top: '4px', right: '4px' }}
          >
            <X size={16} />
          </IconButton>
        )}
      </CardContent>
    </Card>
  );
};


export default function Projects() {
  const [projectGroups, setTeams] = useState<Team[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [newProjectNames, setNewProjectNames] = useState<{[key: string]: string}>({});

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMemberUsernames, setNewMemberUsernames] = useState<{[key: string]: string}>({});
  const [newMemberRoles, setNewMemberRoles] = useState<{[key: string]: UserTeamRole}>({});
  const [newMemberFeedback, setNewMemberFeedback] = useState<{[key: string]: string}>({});



  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userId = await getCurrentUserId();
        if (userId) {
          const { data: fetchedTeams, error: teamsError } = await fetchTeamsForUser(userId);
          if (teamsError) throw new Error(`Error fetching teams: ${teamsError.message}`);

          if (fetchedTeams) {
            const teamsWithProjectsAndMembers: Team[] = await Promise.all(fetchedTeams.map(async (team) => {
              const { data: projects, error: projectsError } = await fetchProjectsForTeam(team.team_id);
              if (projectsError) throw new Error(`Error fetching projects for team ${team.team_name}: ${projectsError.message}`);

              const { data: teamMembers, error: teamMembersError } = await fetchAllUserTeamForTeam(team.team_id);
              if (teamMembersError) throw new Error(`Error fetching team members for team ${team.team_name}: ${teamMembersError.message}`);

              const members: TeamMember[] = await Promise.all((teamMembers || []).map(async (member) => {
                const { data: userData, error: userError } = await fetchUser(member.user_id);
                if (userError) throw new Error(`Error fetching user data for user ${member.user_id}: ${userError.message}`);

                return {
                  id: userData?.user_id || '',
                  firstName: userData?.user_fname || '',
                  lastName: userData?.user_lname || '',
                  userName: userData?.user_username || '',
                  role: member.user_team_role,
                  teamId: team.team_id  // Make sure to include this
                };
              }));

              return {
                id: team.team_id,
                name: team.team_name,
                projects: projects ? projects.map(p => ({
                  id: p.proj_id,
                  name: p.proj_name,
                  color: 'gray' // You might want to assign colors based on some logic
                })) : [],
                members: members
              };
            }));

            setTeams(teamsWithProjectsAndMembers);
            // Initialize newProjectNames state
            const initialProjectNames = teamsWithProjectsAndMembers.reduce((acc, team) => {
              acc[team.id] = '';
              return acc;
            }, {} as {[key: string]: string});
            setNewProjectNames(initialProjectNames);
            // Set all items to be open by default
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

    // Set up real-time subscriptions
    const teamSubscription = supabase
      .channel('team-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team' }, handleTeamChange)
      .subscribe();

    const projectSubscription = supabase
      .channel('project-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project' }, handleProjectChange)
      .subscribe();

    const userTeamSubscription = supabase
      .channel('user-team-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_team' }, handleUserTeamChange)
      .subscribe();

    return () => {
      supabase.removeChannel(teamSubscription);
      supabase.removeChannel(projectSubscription);
      supabase.removeChannel(userTeamSubscription);
    };
  }, []);

  const handleTeamChange = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setTeams(prev => {
        const newGroup: Team = { id: payload.new.team_id, name: payload.new.team_name, projects: [] , members: []};
        return [...prev, newGroup];
      });
      setNewProjectNames(prev => ({ ...prev, [payload.new.team_id]: '' }));
    } else if (payload.eventType === 'UPDATE') {
      setTeams(prev => prev.map(group => 
        group.id === payload.new.team_id ? { ...group, name: payload.new.team_name } : group
      ));
    } else if (payload.eventType === 'DELETE') {
      setTeams(prev => prev.filter(group => group.id !== payload.old.team_id));
      setNewProjectNames(prev => {
        const { [payload.old.team_id]: _, ...rest } = prev;
        return rest;
      });
      setOpenItems(prev => prev.filter(id => id !== payload.old.team_id));
    }
  };

  const handleProjectChange = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newProject: Project = { id: payload.new.proj_id, name: payload.new.proj_name, color: 'gray' };
      setTeams(prev => prev.map(group => 
        group.id === payload.new.team_id 
          ? { ...group, projects: [...group.projects, newProject] }
          : group
      ));
    } else if (payload.eventType === 'UPDATE') {
      setTeams(prev => prev.map(group => ({
        ...group,
        projects: group.projects.map(project => 
          project.id === payload.new.proj_id 
            ? { ...project, name: payload.new.proj_name }
            : project
        )
      })));
    } else if (payload.eventType === 'DELETE') {
      setTeams(prev => prev.map(group => ({
        ...group,
        projects: group.projects.filter(project => project.id !== payload.old.proj_id)
      })));
    }
  };

  const handleUserTeamChange = async (payload: any) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const { data: userData, error: userError } = await fetchUser(payload.new.user_id);
      if (userError) {
        console.error(`Error fetching user data: ${userError.message}`);
        return;
      }
  
      const newMember: TeamMember = {
        id: userData?.user_id || '',
        firstName: userData?.user_fname || '',
        lastName: userData?.user_lname || '',
        userName: userData?.user_username || '',
        role: payload.new.user_team_role,
        teamId: payload.new.team_id  // Add this line to include the teamId
      };
  
      setTeams(prev => prev.map(team => 
        team.id === payload.new.team_id 
          ? { 
              ...team, 
              members: [...team.members.filter(m => m.id !== newMember.id), newMember]
            }
          : team
      ));
    } else if (payload.eventType === 'DELETE') {
      setTeams(prev => prev.map(team => ({
        ...team,
        members: team.members.filter(member => member.id !== payload.old.user_id || team.id !== payload.old.team_id)
      })));
    }
  };

  const handleDeleteTeamMember = async (userId: string, teamId: string) => {
    try {
      const error = await deleteUserTeam(userId, teamId);
      if (error) throw error;
      setMessage(`Team member removed successfully.`);
      setTeams(prev => prev.map(team => 
        team.id === teamId
          ? { ...team, members: team.members.filter(member => member.id !== userId) }
          : team
      ));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const handleChangeTeamMemberRole = async (userId: string, teamId: string, newRole: UserTeamRole) => {
    try {
      const { data, error } = await updateUserTeamRole(userId, teamId, newRole);
      if (error) throw error;
      setMessage(`Team member role updated successfully.`);
      setTeams(prev => prev.map(team => 
        team.id === teamId
          ? { 
              ...team, 
              members: team.members.map(member => 
                member.id === userId ? { ...member, role: newRole } : member
              ) 
            }
          : team
      ));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };
  
  


  const toggleItem = (teamId: string) => {
    setOpenItems(prevItems =>
      prevItems.includes(teamId)
        ? prevItems.filter(id => id !== teamId)
        : [...prevItems, teamId]
    );
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

  const handleDeleteProject = async (projectId: string, teamId: string) => {
    try {
      const  error = await deleteProject(projectId);
      if (error) throw error;
      setMessage(`Project deleted successfully.`);
      setTeams(prev => prev.map(team => 
        team.id === teamId
          ? { ...team, projects: team.projects.filter(p => p.id !== projectId) }
          : team
      ));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const  error  = await deleteTeam(teamId);
      if (error) throw error;
      setMessage(`Team deleted successfully.`);
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const handleAddMember = async (teamId: string) => {
    const username = newMemberUsernames[teamId];
    const role = newMemberRoles[teamId] || UserTeamRole.member;
    if (username && role) {
      try {
        const checkResult = await checkNewTeamMember(username, teamId);
        if (checkResult === AddUserNameToTeam.validToAdd) {
          const { data: userData } = await fetchUserByUserName(username);
          if (userData) {
            await createUserTeam(userData.user_id, teamId, role);
            setMessage(`User "${username}" has been added to the team successfully.`);
            setNewMemberUsernames(prev => ({ ...prev, [teamId]: '' }));
            setNewMemberRoles(prev => ({ ...prev, [teamId]: UserTeamRole.member }));
            setNewMemberFeedback(prev => ({ ...prev, [teamId]: '' }));
          }
        } else {
          setNewMemberFeedback(prev => ({ ...prev, [teamId]: getAddMemberFeedback(checkResult) }));
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  };

  const handleNewMemberUsernameChange = async (teamId: string, username: string) => {
    setNewMemberUsernames(prev => ({ ...prev, [teamId]: username }));
    if (username.trim()) {
      const checkResult = await checkNewTeamMember(username, teamId);
      setNewMemberFeedback(prev => ({ ...prev, [teamId]: getAddMemberFeedback(checkResult) }));
    } else {
      setNewMemberFeedback(prev => ({ ...prev, [teamId]: '' }));
    }
  };

  const getAddMemberFeedback = (result: AddUserNameToTeam) => {
    switch (result) {
      case AddUserNameToTeam.invalidUserName:
        return "Username does not exist.";
      case AddUserNameToTeam.alreadyInTeam:
        return "User is already in this team.";
      case AddUserNameToTeam.error:
        return "An error occurred. Please try again.";
      default:
        return "";
    }
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
        {projectGroups.map((group) => {
          const isAdmin = group.members.some(member => member.id === currentUserId && member.role === 'admin');
          return (
            <AccordionItem value={group.id} key={group.id}>
              <AccordionTrigger 
                onClick={() => toggleItem(group.id)}
                className="text-xl font-semibold bg-gray-100 p-4 rounded-t-lg"
              >
                <div className="flex items-center w-full justify-between">
                  <span>{group.name}</span>
                  <div className="flex items-center">
                    <ChevronDown size={24} className={`transition-transform duration-200 ${openItems.includes(group.id) ? 'transform rotate-180' : ''}`} />
                    {isAdmin && (
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); handleDeleteTeam(group.id); }}
                        size="small"
                        style={{ marginLeft: '8px', color: '#ef4444' }}
                      >
                        <X size={16} />
                      </IconButton>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-gray-50 p-4 rounded-b-lg">
                  <h3 className="text-lg font-semibold mb-4">Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    {group.projects.map(project => (
                      <ProjectCard 
                        key={project.id} 
                        {...project} 
                        onDelete={() => handleDeleteProject(project.id, group.id)}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                  <div className="flex items-center mb-6">
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="New project name"
                      value={newProjectNames[group.id] || ''}
                      onChange={(e) => setNewProjectNames(prev => ({ ...prev, [group.id]: e.target.value }))}
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
                  <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.members.map(member => (
                      <TeamMemberCard 
                        key={member.id} 
                        {...member} 
                        teamId={group.id}
                        onDelete={() => handleDeleteTeamMember(member.id, group.id)}
                        onRoleChange={(newRole) => handleChangeTeamMemberRole(member.id, group.id, newRole as UserTeamRole)}
                        isCurrentUser={member.id === currentUserId}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                  {isAdmin && (
                    <div className="mt-4 flex items-center">
                      <TextField
                        variant="outlined"
                        size="small"
                        placeholder="New member username"
                        value={newMemberUsernames[group.id] || ''}
                        onChange={(e) => handleNewMemberUsernameChange(group.id, e.target.value)}
                        style={{ marginRight: '8px', flexGrow: 1 }}
                      />
                      <Select
                        value={newMemberRoles[group.id] || UserTeamRole.member}
                        onChange={(e) => setNewMemberRoles(prev => ({ ...prev, [group.id]: e.target.value as UserTeamRole }))}
                        style={{ marginRight: '8px', minWidth: '100px' }}
                        size="small"
                      >
                        <MenuItem value={UserTeamRole.member}>Member</MenuItem>
                        <MenuItem value={UserTeamRole.admin}>Admin</MenuItem>
                      </Select>
                      <IconButton
                        onClick={() => handleAddMember(group.id)}
                        disabled={!newMemberUsernames[group.id]?.trim() || !!newMemberFeedback[group.id]}
                        color="primary"
                      >
                        <UserPlus />
                      </IconButton>
                    </div>
                  )}
                  {newMemberFeedback[group.id] && (
                    <p className="text-red-500 mt-2">{newMemberFeedback[group.id]}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <div className="mt-6 flex items-center">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="New team name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
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