"use client";
import React, { useState, useEffect } from 'react';
import { ClientKanbanWrapper } from '../../components/ClientKanbanWrapper';
import {
  fetchProjectById,
  fetchAllTaskStatusForProject,
  fetchTasksForProject,
  fetchAllUserTeamForTeam,
  fetchUser
} from '@/supabase/backendFunctions';
import { Project, ProjectTaskStatus, Task, UserTeam, User } from '@/supabase/databaseTypes';

export default function BoardTabPage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<ProjectTaskStatus[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project
        const { data: projectData } = await fetchProjectById(params.projectId);
        if (projectData) {
          setProject(projectData);
          setTeam(projectData.team_id)
        }
        // Fetch columns (project task status)
        const { data: columnsData } = await fetchAllTaskStatusForProject(params.projectId);
        if (columnsData) setColumns(columnsData.sort((a, b) => a.proj_status_order - b.proj_status_order));

        // Fetch tasks
        const { data: tasksData } = await fetchTasksForProject(params.projectId);
        if (tasksData) setTasks(tasksData);

        // Fetch team members
        if (projectData) {
          const { data: userTeamData } = await fetchAllUserTeamForTeam(projectData.team_id);
          if (userTeamData) {
            const teamMembersPromises = userTeamData.map(async (userTeam: UserTeam) => {
              const { data: userData } = await fetchUser(userTeam.user_id);
              return userData;
            });
            const teamMembersData = await Promise.all(teamMembersPromises);
            setTeamMembers(teamMembersData.filter((user): user is User => user !== null));
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.projectId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen overflow-hidden">
      <ClientKanbanWrapper
        projectId={params.projectId}
        initialColumns={columns}
        initialTasks={tasks}
        teamMembers={teamMembers}
        teamId={team}
      />
    </div>
  );
}