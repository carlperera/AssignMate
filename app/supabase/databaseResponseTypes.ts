import { PostgrestError } from '@supabase/supabase-js';
import {Project, Task, Team, User, UserTeam, ProjectTaskStatus, AuthUser, AddUserNameToTeam, TaskLog} from './databaseTypes';
import { checkNewTeamMember } from './backendFunctions';


export type DeleteRowResponse = PostgrestError | null;
export type UpdateRowResponse = PostgrestError | null;
export type CreateRowResponse = PostgrestError | null;
export type FetchUserIdResponse = string | null;
export type FetchUserResponse = AuthUser | null;

export type DatabaseSingleResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
}

export type DatabaseMultiResponse<T> = {
  data: T[] | null;
  error: PostgrestError | null;
}

export type EnumValues<T> = T[keyof T];
export type CheckTeamMemberResponse = EnumValues<typeof AddUserNameToTeam>


//  ---------------------------------------------------------------- PROJECT  ----------------------------------------------------------------
export type ProjectMultiResponse = DatabaseMultiResponse<Project>
export type ProjectSingleResponse = DatabaseSingleResponse<Project>

//  ---------------------------------------------------------------- TASK  ----------------------------------------------------------------
export type TaskMultiResponse = DatabaseMultiResponse<Task>
export type TaskSingleResponse = DatabaseSingleResponse<Task>

//  ---------------------------------------------------------------- PROJECT TASK STATUS  ----------------------------------------------------------------
export type ProjectTaskStatusMultiResponse = DatabaseMultiResponse<ProjectTaskStatus>
export type ProjectTaskStatusSingleResponse = DatabaseSingleResponse<ProjectTaskStatus>


// ---------------------------------------------------------------- TEAM ----------------------------------------------------------------
export type TeamMultiResponse = DatabaseMultiResponse<Team>
export type TeamSingleResponse = DatabaseSingleResponse<Team>

// ---------------------------------------------------------------- USER ----------------------------------------------------------------
export type UserMultiResponse = DatabaseMultiResponse<User>
export type UserSingleResponse = DatabaseSingleResponse<User>

// ---------------------------------------------------------------- USER TEAM ----------------------------------------------------------------
export type UserTeamMultiResponse = DatabaseMultiResponse<UserTeam>
export type UserTeamSingleResponse = DatabaseSingleResponse<UserTeam>

// ---------------------------------------------------------------- TASK LOG ----------------------------------------------------------------
export type TaskLogMultiResponse = DatabaseMultiResponse<TaskLog>
export type TaskLogSingleResponse = DatabaseSingleResponse<TaskLog>