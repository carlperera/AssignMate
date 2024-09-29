"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Folder, ChevronDown, UserMinus, UserPlus } from "lucide-react";
import Header from '../components/Header';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import { 
  createTeamAndAddUser, 
  createProject, 
  fetchTeamsForUser, 
  fetchProjectsForTeam, 
  getCurrentUserId, 
  fetchUserTeamForTeam, 
  fetchUser, 
  checkUserNameAvailable, 
  createUserTeam,
  deleteUserTeam
} from '../supabase/backendFunctions';
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
  projects: Project[];
  members: TeamMember[];
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

const TeamMemberCard = ({ member, isAdmin, currentUserId, onRemove }: { member: TeamMember; isAdmin: boolean; currentUserId: string; onRemove: () => void }) => {
  return (
    <Card className="flex items-center space-x-2 bg-white p-2 rounded">
      <Avatar>{member.firstName[0]}{member.lastName[0]}</Avatar>
      <div className="flex-grow">
        <p className="font-medium">{`${member.firstName} ${member.lastName}`}</p>
        <p className="text-sm text-gray-500">{member.username}</p>
        <p className="text-xs text-gray-400">{member.role}</p>
      </div>
      {isAdmin && member.id !== currentUserId && (
        <IconButton onClick={onRemove} size="small">
          <UserMinus size={16} />
        </IconButton>
      )}
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
          const { data: teams, error: teamsError } = await fetchTeamsForUser(userId);
          if (teamsError) throw new Error(`Error fetching teams: ${teamsError.message}`);

          if (teams) {
            const teamsWithDetails = await Promise.all(teams.map(async (team) => {
              const { data: projects, error: projectsError } = await fetchProjectsForTeam(team.team_id);
              if (projectsError) throw new Error(`Error fetching projects for team ${team.team_name}: ${projectsError.message}`);

              const { data: teamMembers, error: membersError } = await fetchUserTeamForTeam(team.team_id);
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

              // Sort members to put current user first
              membersWithDetails.sort((a, b) => {
                if (a.id === userId) return -1;
                if (b.id === userId) return 1;
                return 0;
              });

              return {
                id: team.team_id,
                name: team.team_name,
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
      setProjectGroups(prev => {
        const newGroup: ProjectGroup = { id: payload.new.team_id, name: payload.new.team_name, projects: [] };
        return [...prev, newGroup];
      });
      setNewProjectNames(prev => ({ ...prev, [payload.new.team_id]: '' }));
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

  const handleUserTeamChange = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const { data: userData, error: userError } = await fetchUser(payload.new.user_id);
      if (userError) {
        console.error('Error fetching new user data:', userError);
        return;
      }
      const newMember: TeamMember = {
        id: userData.user_id,
        firstName: userData.user_fname,
        lastName: userData.user_lname,
        username: userData.user_username,
        role: payload.new.user_team_role
      };
      setProjectGroups(prev => prev.map(group => 
        group.id === payload.new.team_id
          ? { ...group, members: [...group.members, newMember] }
          : group
      ));
    } else if (payload.eventType === 'DELETE') {
      setProjectGroups(prev => prev.map(group => 
        group.id === payload.old.team_id
          ? { ...group, members: group.members.filter(member => member.id !== payload.old.user_id) }
          : group
      ));
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

  const isUserAdmin = (teamId: string) => {
    const team = projectGroups.find(group => group.id === teamId);
    return team?.members.some(member => member.id === currentUserId && member.role === 'admin');
  };

  const handleCheckUsername = async (teamId: string, username: string) => {
    if (!username.trim()) {
      setIsUsernameValid(prev => ({ ...prev, [teamId]: null }));
      return;
    }
    const isAvailable = await checkUserNameAvailable(username);
    if (isAvailable) {
      setIsUsernameValid(prev => ({ ...prev, [teamId]: false }));
      setMessage(`User ${username} does not exist.`);
    } else {
      const team = projectGroups.find(group => group.id === teamId);
      const isAlreadyMember = team?.members.some(member => member.username === username);
      if (isAlreadyMember) {
        setIsUsernameValid(prev => ({ ...prev, [teamId]: false }));
        setMessage(`User ${username} is already a member of this team.`);
      } else {
        setIsUsernameValid(prev => ({ ...prev, [teamId]: true }));
        setMessage(null);
      }
    }
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
          setNewMemberUsername(prev => ({ ...prev, [teamId]: '' }));
          setNewMemberRole(prev => ({ ...prev, [teamId]: '' }));
          setIsUsernameValid(prev => ({ ...prev, [teamId]: null }));
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  };

  const handleRemoveTeamMember = async (teamId: string, userId: string) => {
    try {
      const error = await deleteUserTeam(userId, teamId);
      if (error) throw error;
      setMessage("Team member removed successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
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
        {projectGroups.map((group) => (
          <AccordionItem value={group.id} key={group.id}>
            <AccordionTrigger 
              onClick={() => setOpenItems(prev => 
                prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id]
              )}
              className="text-xl font-semibold bg-gray-100 p-4 rounded-t-lg"
            >
              <div className="flex items-center w-full justify-between">
                <span>{group.name}</span>
                <ChevronDown size={24} className={`transition-transform duration-200 ${openItems.includes(group.id) ? 'transform rotate-180' : ''}`} />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 p-4 rounded-b-lg">
                <h3 className="text-lg font-semibold mb-2">Team Members</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {group.members.map((member) => (
                    <TeamMemberCard 
                      key={member.id} 
                      member={member} 
                      isAdmin={isUserAdmin(group.id)} 
                      currentUserId={currentUserId || ''}
                      onRemove={() => handleRemoveTeamMember(group.id, member.id)}
                    />
                  ))}
                </div>
                {isUserAdmin(group.id) && (
                  <div className="mb-4 flex items-center space-x-2">
                    <TextField
                      size="small"
                      placeholder="Username"
                      value={newMemberUsername[group.id] || ''}
                      onChange={(e) => {
                        setNewMemberUsername(prev => ({ ...prev, [group.id]: e.target.value }));
                        handleCheckUsername(group.id, e.target.value);
                      }}
                      error={isUsernameValid[group.id] === false}
                      helperText={isUsernameValid[group.id] === false ? "Invalid username" : ""}
                    />
                    <Select
                      size="small"
                      value={newMemberRole[group.id] || ''}
                      onChange={(e) => setNewMemberRole(prev => ({ ...prev, [group.id]: e.target.value as string }))}
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