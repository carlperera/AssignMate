import { createClient } from '@supabase/supabase-js'
import { Database } from '../../app/supabase/database.types'
import { 
  Project, Sprint, Task, Team, User, UserTeam,
  ProjectStatus, UserTeamRole
} from './databaseTypes'
import { 
  FetchUserIdResponse,
  CreateRowResponse,
  UpdateRowResponse,
  DeleteRowResponse,
  FetchProjectResponse, 
  FetchSprintResponse, 
  FetchTasksResponse, 
  FetchTaskStatusResponse,
  FetchTeamResponse,
  FetchUserTeamResponse, 
} from './databaseResponseTypes'

import {supabase} from "./supabaseClient";


// ---------------------------------------------------------------- PROJECT ----------------------------------------------------------------
// (Create) - create project 
export const createProject = async (projName: string, teamId: string): Promise<CreateRowResponse> => {
  const { error } = await supabase
    .from('project')
    .insert({ proj_name: projName, team_id: teamId })
  return error
}

// (Read) - fetch project
export const fetchProject = async (projName: string, teamId: string): Promise<FetchProjectResponse> => {
  const { data, error } = await supabase
    .from('project')
    .select()
    .eq('proj_name', projName)
    .eq('team_id', teamId)
  return { data, error }
}
// (Read) - fetch projects by id 
export const fetchProjectsById = async (projId: string): Promise<FetchProjectResponse> => {
  const { data, error } = await supabase
    .from('project')
    .select()
    .eq('proj_id', projId)
  return { data, error }
}

export const fetchProjectsForTeam = async (teamId: string): Promise<FetchProjectResponse> => {
  const { data, error } = await supabase
    .from('project')
    .select()
    .eq('team_id', teamId)
  return { data, error }
}
// (Update) - update project description 
export const updateProjectDesc = async (projId: string, newProjectDesc: string): Promise<UpdateRowResponse> => {
  const { error } = await supabase
    .from('project')
    .update({ proj_desc: newProjectDesc })
    .eq('proj_id', projId)
  return error
}

export const updateProjectName = async (projId: string, newProjectName: string): Promise<UpdateRowResponse> => {
  const { error } = await supabase
    .from('project')
    .update({ proj_name: newProjectName })
    .eq('proj_id', projId)
  return error
}

export const deleteProject = async (projId: string): Promise<DeleteRowResponse> => {
  const { error } = await supabase
    .from('project')
    .delete()
    .eq('proj_id', projId)
  return error
}

// ---------------------------------------------------------------- SPRINT ----------------------------------------------------------------
// SPRINT functions
export const createSprint = async (sprintName: string, projId: string): Promise<CreateRowResponse> => {
  const { error } = await supabase
    .from('sprint')
    .insert({ sprint_name: sprintName, proj_id: projId })
  return error
}

export const fetchSprintById = async (sprintId: string): Promise<FetchSprintResponse> => {
  const { data, error } = await supabase
    .from('sprint')
    .select()
    .eq('sprint_id', sprintId)
  return { data, error }
}

export const updateSprintDesc = async (sprintId: string, newSprintDesc: string | null): Promise<UpdateRowResponse> => {
  const { error } = await supabase
    .from('sprint')
    .update({ sprint_desc: newSprintDesc })
    .eq('sprint_id', sprintId)
  return error
}

export const updateSprintName = async (sprintId: string, newSprintName: string): Promise<UpdateRowResponse> => {
  const { error } = await supabase
    .from('sprint')
    .update({ sprint_name: newSprintName })
    .eq('sprint_id', sprintId)
  return error
}

export const deleteSprint = async (sprintId: string): Promise<DeleteRowResponse> => {
  const { error } = await supabase
    .from('sprint')
    .delete()
    .eq('sprint_id', sprintId)
  return error
}

// ---------------------------------------------------------------- TASK ----------------------------------------------------------------
// TASK functions
export const createTask = async (
  taskAssignee: string, 
  taskDesc: string, 
  taskDeadline: string, 
  projId: string,
  parentTaskId?: string, 
  taskPriority?: Database['public']['Enums']['task_priority '],
  taskStatus?: Database['public']['Enums']['task_status']
): Promise<CreateRowResponse> => {
  const { error } = await supabase
    .from('task')
    .insert({
      task_assignee: taskAssignee, 
      task_desc: taskDesc, 
      task_deadline: taskDeadline,
      proj_id: projId,
      parent_task_id: parentTaskId,
      task_priority: taskPriority,
      task_status: taskStatus
    })
  return error
}

export const fetchTaskById = async (taskId: string): Promise<FetchTasksResponse> => {
  const { data, error } = await supabase
    .from('task')
    .select()
    .eq('task_id', taskId)
  return { data, error }
}

export const fetchTasksForProject = async (projId: string): Promise<FetchTasksResponse> => {
  const { data, error } = await supabase
    .from('task')
    .select()
    .eq('proj_id', projId)
  return { data, error }
}

export const fetchTasksForProjectMember = async (projId: string, teamMemberId: string): Promise<FetchTasksResponse> => {
  const { data, error } = await supabase
    .from('task')
    .select()
    .eq('proj_id', projId)
    .eq('task_assignee', teamMemberId)
  return { data, error }
}

export const updateTaskAssignee = async (taskId: string, newTeamMemberId: string): Promise<UpdateRowResponse> => {
  const { error } = await supabase
    .from('task')
    .update({ task_assignee: newTeamMemberId })
    .eq('task_id', taskId)
  return error
}

export const updateTaskStatus = async (taskId: string, newTaskStatusId: string): Promise<UpdateRowResponse> => {
  const { error } = await supabase
    .from('task')
    .update({ task_status: newTaskStatusId })
    .eq('task_id', taskId)
  return error
}

export const deleteTask = async (taskId: string): Promise<DeleteRowResponse> => {
  const { error } = await supabase
    .from('task')
    .delete()
    .eq('task_id', taskId)
  return error
}


// ---------------------------------------------------------------- TASK STATUS ----------------------------------------------------------------
export const fetchTaskStatusById = async (taskStatusId: string): Promise<FetchTaskStatusResponse> => {
    const { data, error } = await supabase
      .from('task_status')
      .select()
      .eq('task_status_id', taskStatusId)
    return { data, error }
  }

export const updateTaskStatusName = async (taskStatusId: string, newTaskStatusName: string): Promise<UpdateRowResponse> => {
    const { error } = await supabase
      .from('task_status')
      .update({ task_status_name: newTaskStatusName })
      .eq('task_status_id', taskStatusId)
    return error
}

export const deleteTaskStatus = async (taskStatusId: string): Promise<DeleteRowResponse> => {
    const { error } = await supabase
      .from('task_status')
      .delete()
      .eq('task_status_id', taskStatusId)
    return error
}

// ---------------------------------------------------------------- TEAM ----------------------------------------------------------------

// TEAM functions
export const createTeam = async (teamName: string): Promise<CreateRowResponse> => {
  const { error } = await supabase
    .from('team')
    .insert({ team_name: teamName })
  return error
}

export const fetchTeamById = async (teamId: string): Promise<FetchTeamResponse> => {
  const { data, error } = await supabase
    .from('team')
    .select()
    .eq('team_id', teamId)
  return { data, error }
}

export const updateTeamName = async (teamId: string, newTeamName: string): Promise<UpdateRowResponse> => {
  const { error } = await supabase
    .from('team')
    .update({ team_name: newTeamName })
    .eq('team_id', teamId)
  return error
}

export const deleteTeam = async (teamId: string): Promise<DeleteRowResponse> => {
  const { error } = await supabase
    .from('team')
    .delete()
    .eq('team_id', teamId)
  return error
}

// ---------------------------------------------------------------- USER ----------------------------------------------------------------
export const getCurrentUserId = async (): Promise<FetchUserIdResponse> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ---------------------------------------------------------------- USER TEAM ----------------------------------------------------------------
export const createUserTeam = async (userId: string, teamId: string, userTeamRole: UserTeamRole): Promise<CreateRowResponse> => {
  const { error } = await supabase
    .from('user_team')
    .insert({ user_id: userId, team_id: teamId, user_team_role: userTeamRole })
  return error
}

export const fetchUserTeam = async (userId: string, teamId: string): Promise<FetchUserTeamResponse> => {
  const { data, error } = await supabase
    .from('user_team')
    .select()
    .eq('user_id', userId)
    .eq('team_id', teamId)
  return { data, error }
}

export const updateUserTeamRole = async (userId: string, teamId: string, newUserTeamRole: UserTeamRole): Promise<UpdateRowResponse> => {
  const { error } = await supabase
    .from('user_team')
    .update({ user_team_role: newUserTeamRole })
    .eq('user_id', userId)
    .eq('team_id', teamId)
  return error
}

export const deleteUserTeam = async (userId: string, teamId: string): Promise<DeleteRowResponse> => {
  const { error } = await supabase
    .from('user_team')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId)
  return error
}