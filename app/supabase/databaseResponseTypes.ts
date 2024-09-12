import { PostgrestError } from '@supabase/supabase-js';
import {Project, Sprint, Task, Team, User, UserTeam} from './databaseTypes';

//  ---------------------------------------------------------------- PROJECT  ----------------------------------------------------------------
export type FetchProjectResponse = {
    data: Project[] | null;
    error: any; // Replace with a more specific type if needed
  };

//  ---------------------------------------------------------------- SPRINT  ----------------------------------------------------------------

// (Create) - sprint
export type CreateSprintResponse = PostgrestError | null

// (Read) - sprint
export type FetchSprintResponse = {
    data: Sprint[] | null;
    error: any; // Replace with a more specific type if needed
  };

export type DeleteSprintResponse = PostgrestError | null;

export type CreateProjectResponse = PostgrestError | null;

export type CreateTaskResponse = PostgrestError | null;

export type CreateTeamResponse = PostgrestError | null

export type CreateUserTeamResponse = PostgrestError | null;



export type FetchTasksResponse = {
  data: Task[] | null;
  error: any;
}

export type FetchTeamResponse = {
  data: Team[] | null;
  error: any;
}


export type FetchUserTeamResponse = {
  data: UserTeam[] | null;
  error: any;
}


// ---------------------------------------------------------------- TASK ----------------------------------------------------------------



// ---------------------------------------------------------------- TEAM ----------------------------------------------------------------



// ---------------------------------------------------------------- USER ----------------------------------------------------------------



// ---------------------------------------------------------------- USER TEAM ----------------------------------------------------------------

export type DeleteUserTeamResponse = PostgrestError | null;