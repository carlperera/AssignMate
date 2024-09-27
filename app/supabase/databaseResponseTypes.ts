import { PostgrestError } from '@supabase/supabase-js';
import {Project, Sprint, Task, Team, User, UserTeam, TaskStatus} from './databaseTypes';


export type DeleteRowResponse = PostgrestError | null;
export type UpdateRowResponse = PostgrestError | null;
export type CreateRowResponse = PostgrestError | null;
export type FetchUserIdResponse = string | null;

export type DatabaseSingleResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
}

export type DatabaseMultiResponse<T> = {
  data: T[] | null;
  error: PostgrestError | null;
}

//  ---------------------------------------------------------------- PROJECT  ----------------------------------------------------------------
export type ProjectMultiResponse = DatabaseMultiResponse<Project>
export type ProjectSingleResponse = DatabaseSingleResponse<Project>

//  ---------------------------------------------------------------- SPRINT  ----------------------------------------------------------------
export type SprintMultiResponse = DatabaseMultiResponse<Sprint>
export type SprintSingleResponse = DatabaseSingleResponse<Sprint>

//  ---------------------------------------------------------------- TASK  ----------------------------------------------------------------
export type TaskMultiResponse = DatabaseMultiResponse<Task>
export type TaskSingleResponse = DatabaseSingleResponse<Task>

//  ---------------------------------------------------------------- TASK STATUS  ----------------------------------------------------------------
export type TaskStatusMultiResponse = DatabaseMultiResponse<TaskStatus>
export type TaskStatusSingleResponse = DatabaseSingleResponse<TaskStatus>


// ---------------------------------------------------------------- TEAM ----------------------------------------------------------------
export type TeamMultiResponse = DatabaseMultiResponse<Team>
export type TeamSingleResponse = DatabaseSingleResponse<Team>

// ---------------------------------------------------------------- USER ----------------------------------------------------------------
export type UserMultiResponse = DatabaseMultiResponse<User>
export type UserSingleResponse = DatabaseSingleResponse<User>

// ---------------------------------------------------------------- USER TEAM ----------------------------------------------------------------
export type UserTeamMultiResponse = DatabaseMultiResponse<UserTeam>
export type UserTeamSingleResponse = DatabaseSingleResponse<UserTeam>
