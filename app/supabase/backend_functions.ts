import supabase from "./supabaseClient";

// import type definitions
import {Project, Sprint, Task, Team, User, UserTeam} from './databaseTypes';  //database table row types
import {FetchProjectResponse, FetchSprintResponse, CreateSprintResponse, CreateProjectResponse} from './databaseResponseTypes'; //database table row reponse types
import {FetchTasksResponse, CreateTaskResponse} from './databaseResponseTypes';
import {ProjectStatusType} from './databaseTypes';
import {CreateTeamResponse, FetchTeamResponse} from './databaseResponseTypes';
import {CreateUserTeamResponse} from './databaseResponseTypes';
import {UserTeamRoleType} from './databaseTypes';
import { FetchUserTeamResponse, DeleteUserTeamResponse} from "./databaseResponseTypes";
import { UserResponse } from "@supabase/supabase-js";

// ---------------------------------------------------------------- PROJECT ----------------------------------------------------------------
// (Create) - create project 
const createProject = async (projName: string, teamId: string): Promise<CreateProjectResponse> => {
    const { error } = await supabase
    .from('project')
    .insert({ proj_name: projName, team_id: teamId}) // specify what team this project belongs to on creation + project name
    return error 
}

// (Read) - fetch project
const fetchProject = async (projName: string, teamId: string): Promise<FetchProjectResponse>=> {
    const { data, error } = await supabase
    .from('project')
    .select()
    .eq('proj_name', projName)
    .eq('team_id', teamId)

    return  {data, error}
}

// (Read) - fetch projects by id 
const fetchProjectsById = async (projId: string): Promise<FetchProjectResponse> => {
    const { data, error } = await supabase
    .from('project')
    .select()
    .eq('proj_id', projId)
    return {data, error}
}

const fetchProjectsForTeam = async (teamId: string): Promise<FetchProjectResponse>=> {
  const { data, error } = await supabase
  .from('project')
  .select()
  .eq('team_id', teamId)
  return  {data, error}
}

// (Update) - update project description 
const updateProjectDesc = async (projName: string, teamId: string, newProjectDesc: string) => {
    const { error } = await supabase
  .from('project')
  .update({ proj_desc: newProjectDesc })
  .eq('proj_name', projName)
  .eq('team_id', teamId)
}

const updateProjectDescById = async (projId: string, newProjectDesc: string) => {
    const { error } = await supabase
  .from('project')
  .update({ proj_desc: newProjectDesc })
  .eq('proj_id', projId)
}

// (Update) - update project name 
// TODO: make sure that the new project name does not conflict with existing project names
const updateProjectName = async (projName: string, teamId: string, newProjectName: string) => {
    const { error } = await supabase
  .from('project')
  .update({ proj_name: newProjectName })
  .eq('proj_name', projName)
  .eq('team_id', teamId)
  return error
}

const updateProjectNameById = async (projId: string, newProjectName: string) => {
    const { error } = await supabase
  .from('project')
  .update({ proj_name: newProjectName })
  .eq('proj_id', projId)
}


// (Delete) - remove project 
const deleteProject = async (projName: string, teamId: string) => {
    const { error } = await supabase
  .from('project')
  .delete()
  .eq('proj_name', projName)
  .eq('team_id', teamId)
}

const deleteProjectById = async (projId: string) => {
    const { error } = await supabase
  .from('project')
  .delete()
  .eq('proj_id', projId)
}

// ---------------------------------------------------------------- SPRINT ----------------------------------------------------------------
// (Create) - create sprint 
const createSprint = async (sprintId: string): Promise<CreateSprintResponse> => {
    const { error } = await supabase
    .from('sprint')
    .insert({ sprint_id: sprintId}) // specify what team this project belongs to on creation + project name
    return error
}

// (Read) - fetch sprint
const fetchSprintById = async (sprintId: string) => {
    const { data, error } = await supabase
    .from('sprint')
    .select()
    .eq('sprint_id', sprintId)

    return {data, error}
}

// (Update) - update project description 
const updateSprintDesc = async (sprintId: string, newSprintDesc: string | null) => {
    const { error } = await supabase
  .from('sprint')
  .update({ sprint_desc: newSprintDesc })
  .eq('sprint_id', sprintId)
}

// (Update) - update project name 
// TODO: make sure that the new project name does not conflict with existing project names
const updateSprintName = async (sprintId: string, newSprintName: string) => {
    const { error } = await supabase
                            .from('sprint')
                            .update({ sprint_name: newSprintName })
                            .eq('sprint_id', sprintId)
  return error
}

// (Delete) - remove project 
const deleteSprint = async (sprintId: string) => {
    const { error } = await supabase
  .from('sprint')
  .delete()
  .eq('sprint_id', sprintId)
  return error
}

// ---------------------------------------------------------------- TASK ----------------------------------------------------------------

// (Create) - create task 
const createTask = async (taskAssignee: string, taskDesc: string, taskDeadline: string, taskStatus: string, parentTaskId: string, taskPriority: string): Promise<CreateTaskResponse> => {
  const { error } = await supabase
  .from('task')
  .insert({task_assignee: taskAssignee, task_desc: taskDesc, task_deadline: taskDeadline, task_status: null, parent_task_id: parentTaskId, task_priority: null}) // initially you don't have to specify any of these 
  return error 
}

// (Read) - fetch a specific task
const fetchTaskById = async (taskId: string): Promise<FetchTasksResponse> => {
  const { data, error } = await supabase
                                .from('task')
                                .select()
                                .eq('task_id', taskId)
  return  {data, error} 
}

// (Read) - fetch all tasks for a specific project
const fetchTasksForProject = async (projId: string): Promise<FetchTasksResponse> => {
  const { data, error } = await supabase
                                .from('task')
                                .select()
                                .eq('proj_id', projId)
  return  {data, error} 
}

// (Read) - fetch all tasks for a project and for specific team member
const fetchTasksForProjectMember = async (projId: string, teamMemberId: string): Promise<FetchTasksResponse> => {
  const { data, error } = await supabase
                                .from('task')
                                .select()
                                .eq('proj_id', projId)
                                .eq('task_assignee', teamMemberId)
  return  {data, error} 
}

//update: update assignee property in task 
const updateTaskAssignee = async (taskId: string, newTeamMemberId: string) => {
  const { error } = await supabase
                          .from('task')
                          .update({ task_assignee: newTeamMemberId })
                          .eq('task_id', taskId )
  return error
}

//update: update task_status
const updateTaskStatus= async (taskId: string, newTaskStatus: ProjectStatusType) => {
  const { error } = await supabase
                          .from('task')
                          .update({ task_status: newTaskStatus })
                          .eq('task_id', taskId )
  return error
}

//TODO - delete task 
const deleteTask = async (taskId: string) => {
  const { error } = await supabase
  .from('task')
  .delete()
  .eq('task_id', taskId)
  return error
}

// ---------------------------------------------------------------- TEAM ----------------------------------------------------------------
// (Create) - create task 
const createTeam = async (teamName: string): Promise<CreateTeamResponse> => {
  const { error } = await supabase
  .from('team')
  .insert({team_name: teamName}) // initially you don't have to specify any of these 
  return error 
}

// (Read) - fetch a specific task
const fetchTeamById = async (teamId: string): Promise<FetchTeamResponse> => {
  const { data, error } = await supabase
                                .from('team')
                                .select()
                                .eq('teamid', teamId)
  return  {data, error} 
}

//update: update assignee property in task 
const updateTeamName = async (teamId: string, newTeamName: string) => {
  const { error } = await supabase
                          .from('team')
                          .update({ team_name: newTeamName })
                          .eq('team_id', teamId )
  return error
}

// (Delete) - delete team -- needs to delete the rest of the team stuff too 
const deleteTeam = async (teamId: string) => {
  const { error } = await supabase
  .from('team')
  .delete()
  .eq('team_id', teamId)
  return error
}

// ---------------------------------------------------------------- USER ----------------------------------------------------------------
const getCurrentUserId = async ():Promise<String | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return user.id;
  }
  return null
}

// ---------------------------------------------------------------- USER TEAM ----------------------------------------------------------------
// (Create) - create task 
const createUserTeam = async (userId: string, teamId: string, userTeamRole: UserTeamRoleType): Promise<CreateUserTeamResponse> => {
  const { error } = await supabase
  .from('user_team')
  .insert({user_id: userId, team_id: teamId, user_team_role: userTeamRole}) // initially you don't have to specify any of these 
  return error 
}

// (Read) - fetch a specific user team 
const fetchUserTeam = async (userId: string, teamId: string): Promise<FetchUserTeamResponse> => {
  const { data, error } = await supabase
                                .from('user_team')
                                .select()
                                .eq('user_id', userId)
                                .eq('team_id', teamId)
  return  {data, error} 
}

// (Read) - fetch a specific user team by user_team_id
const fetchUserTeamById = async (userTeamId: string): Promise<FetchUserTeamResponse> => {
  const { data, error } = await supabase
                                .from('user_team')
                                .select()
                                .eq('user_team_id', userTeamId)
  return  {data, error} 
}

// (Update) update user_team role 
const updateUserTeamRole = async (userId: string, teamId: string, newUserTeamRole: UserTeamRoleType) => {
  const { error } = await supabase
                          .from('user_team')
                          .update({ user_team_role: newUserTeamRole })
                          .eq('user_id', userId)
                          .eq('team_id', teamId)
  return error
}

const updateUserTeamRoleById = async (userTeamId: string, newUserTeamRole: UserTeamRoleType) => {
  const { error } = await supabase
                          .from('user_team')
                          .update({ user_team_role: newUserTeamRole })
                          .eq('user_team_id', userTeamId)
  return error
}

// (Delete) - delete user team 
const deleteUserTeamById = async (userTeamId: string): Promise<DeleteUserTeamResponse> => {
    const { error } = await supabase
    .from('team')
    .delete()
    .eq('user_team_id', userTeamId)
    return error
}

// (Delete) - delete user team  
const deleteUserTeamBy = async (userId: string, teamId: string): Promise<DeleteUserTeamResponse> => {
  const { error } = await supabase
  .from('team')
  .delete()
  .eq('user_id', userId)
  .eq('team_id', teamId)
  return error
}