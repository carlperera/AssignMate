import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import { Tables } from '../../app/supabase/database.types'; 
import supabase from '../supabase/supabaseClient';
import {User as AuthUserTemp} from '@supabase/supabase-js';

// ------------------------------------------ DATABASE TABLE TYPES ------------------------------------------
export type Project = Tables<'project'>;
export type Sprint = Tables<'sprint'>;
export type Task = Tables<'task'>;
export type TaskStatus = Tables<'task_status'>;
export type Team = Tables<'team'>;
export type User = Tables<'user'>;
export type UserTeam = Tables<'user_team'>;
export type AuthUser = AuthUserTemp;

// ------------------------------------------ ENUMS ------------------------------------------
export enum ProjectStatus {
    Doing = "doing",
    Blocked = "blocked",
    Done = "done",
}
export type ProjectStatusType = ProjectStatus | null | undefined;


export enum UserTeamRole {
    admin = "admin",
    member = "member",
}

export type UserTeamRoleType = UserTeamRole | undefined;

export enum AddUserNameToTeam {
    alreadyInTeam = "userNameAlreadyInTeam",
    validToAdd = "userNameValidToAdd",
    invalidUserName = "invalidUserName",
    error = "error",
}