import { PostgrestError } from '@supabase/supabase-js';
import {Project, Sprint, Task, Team, User, UserTeam, TaskStatus} from './databaseTypes';


export type DeleteRowResponse = PostgrestError | null;
export type UpdateRowResponse = PostgrestError | null;
export type CreateRowResponse = PostgrestError | null;
export type FetchUserIdResponse = string | null;

//  ---------------------------------------------------------------- PROJECT  ----------------------------------------------------------------
export type FetchProjectResponse = {
    data: Project[] | null;
    error: any; // Replace with a more specific type if needed
  };

//  ---------------------------------------------------------------- SPRINT  ----------------------------------------------------------------
export type FetchSprintResponse = {
    data: Sprint[] | null;
    error: any; // Replace with a more specific type if needed
};

//  ---------------------------------------------------------------- TASK  ----------------------------------------------------------------
export type FetchTasksResponse = {
  data: Task[] | null;
  error: any;
}

//  ---------------------------------------------------------------- TASK STATUS  ----------------------------------------------------------------
export type FetchTaskStatusResponse = {
  data: TaskStatus[] | null;
  error: any;
}


// ---------------------------------------------------------------- TEAM ----------------------------------------------------------------
export type FetchTeamResponse = {
  data: Team[] | null;
  error: any;
}

// ---------------------------------------------------------------- USER ----------------------------------------------------------------
export type FetchUserResponse = {
  data: User[] | null;
  error: any;
}

// ---------------------------------------------------------------- USER TEAM ----------------------------------------------------------------
export type FetchUserTeamResponse = {
  data: UserTeam[] | null;
  error: any;
}
