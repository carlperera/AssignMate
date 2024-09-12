import { Tables } from '../../app/supabase/database.types'; 

// ------------------------------------------ DATABASE TABLE TYPES ------------------------------------------
export type Project = Tables<'project'>;
export type Sprint = Tables<'sprint'>;
export type Task = Tables<'task'>;
export type Team = Tables<'team'>;
export type User = Tables<'user'>;
export type UserTeam = Tables<'user_team'>;


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