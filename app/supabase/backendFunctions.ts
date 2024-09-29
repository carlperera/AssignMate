import { createClient } from '@supabase/supabase-js'
import { PostgrestError } from '@supabase/supabase-js';;
import { Database } from '../../app/supabase/database.types'
import { 
  Project, Sprint, Task, Team, User, UserTeam,
  ProjectStatus, UserTeamRole,
  AddUserNameToTeam,
} from './databaseTypes'
import { 
  FetchUserIdResponse,
  CreateRowResponse,
  UpdateRowResponse,
  DeleteRowResponse,
  ProjectMultiResponse,
  ProjectSingleResponse,
  SprintMultiResponse,
  SprintSingleResponse,
  TaskMultiResponse,
  TaskSingleResponse,
  TaskStatusMultiResponse,
  TaskStatusSingleResponse,
  TeamMultiResponse,
  TeamSingleResponse,
  UserMultiResponse,
  UserSingleResponse,
  UserTeamMultiResponse,
  UserTeamSingleResponse,
  FetchUserResponse,
  CheckTeamMemberResponse,
} from './databaseResponseTypes'

import supabase from "./supabaseClient";


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ (AUTH) +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ---------------------------------------------------------------- (AUTH) USER ----------------------------------------------------------------
export const getCurrentUserId = async (): Promise<FetchUserIdResponse> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export const getCurrentAuthUser = async (): Promise<FetchUserResponse> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ (STORAGE) +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/* storage is used to store any images 
1. user profile pictures
2. any other media relevant to a team - could be the team picture or the project picture
*/


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ (DATABASE) +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ---------------------------------------------------------------- PROJECT ----------------------------------------------------------------
// (Create) - create project 
export const createProject = async (projName: string, teamId: string): Promise<ProjectSingleResponse> => {
  const { data, error } = await supabase
    .from('project')
    .insert({ proj_name: projName, team_id: teamId })
    .select()
    .single()
  return  { data, error }
}

// (Read) - fetch project
export const fetchProject = async (projName: string, teamId: string): Promise<ProjectSingleResponse> => {
  const { data, error } = await supabase
    .from('project')
    .select()
    .eq('proj_name', projName)
    .eq('team_id', teamId)
    .single()   // there should only be one matching entry
  return { data, error } 
}

// (Read) - fetch projects by id 
export const fetchProjectById = async (projId: string): Promise<ProjectSingleResponse> => {
  const { data, error } = await supabase
    .from('project')
    .select()
    .eq('proj_id', projId)
    .single()
  return { data, error }
}

export const fetchProjectsForTeam = async (teamId: string): Promise<ProjectMultiResponse> => {
  const { data, error } = await supabase
    .from('project')
    .select()
    .eq('team_id', teamId)
  return { data, error }
}
// (Update) - update project description 
export const updateProjectDesc = async (projId: string, newProjectDesc: string): Promise<ProjectSingleResponse> => {
  const { data, error } = await supabase
    .from('project')
    .update({ proj_desc: newProjectDesc })
    .eq('proj_id', projId)
    .select()
    .single()
  return { data, error }
}

export const updateProjectName = async (projId: string, newProjectName: string): Promise<ProjectSingleResponse> => {
  const { data, error } = await supabase
    .from('project')
    .update({ proj_name: newProjectName })
    .eq('proj_id', projId)
    .select()
    .single()
  return { data, error }
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
export const createSprint = async (sprintName: string, projId: string): Promise<SprintSingleResponse> => {
  const { data, error } = await supabase
    .from('sprint')
    .insert({ sprint_name: sprintName, proj_id: projId })
  return { data, error }
}

export const fetchSprintById = async (sprintId: string): Promise<SprintSingleResponse> => {
  const { data, error } = await supabase
    .from('sprint')
    .select()
    .eq('sprint_id', sprintId)
    .select()
    .single()
  return { data, error }
}

export const updateSprintDesc = async (sprintId: string, newSprintDesc: string | null): Promise<SprintSingleResponse> => {
  const { data, error } = await supabase
    .from('sprint')
    .update({ sprint_desc: newSprintDesc })
    .eq('sprint_id', sprintId)
    .select()
    .single()
  return { data, error }
}

export const updateSprintName = async (sprintId: string, newSprintName: string): Promise<SprintSingleResponse> => {
  const { data, error } = await supabase
    .from('sprint')
    .update({ sprint_name: newSprintName })
    .eq('sprint_id', sprintId)
    .select()
    .single()
  return { data, error }
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
  taskStatusId?: string
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
      task_status: taskStatusId
    })
  return error
}

export const fetchTaskById = async (taskId: string): Promise<TaskSingleResponse> => {
  const { data, error } = await supabase
    .from('task')
    .select()
    .eq('task_id', taskId)
    .select()
    .single()
  return { data, error }
}

export const fetchTasksForProject = async (projId: string): Promise<TaskMultiResponse> => {
  const { data, error } = await supabase
    .from('task')
    .select()
    .eq('proj_id', projId)
    .select()
  return { data, error }
}

export const fetchTasksForProjectMember = async (projId: string, teamMemberId: string): Promise<TaskMultiResponse> => {
  const { data, error } = await supabase
    .from('task')
    .select()
    .eq('proj_id', projId)
    .eq('task_assignee', teamMemberId)
    .select()
  return { data, error }
}

export const updateTaskAssignee = async (taskId: string, newTeamMemberId: string): Promise<TaskSingleResponse> => {
  const { data, error } = await supabase
    .from('task')
    .update({ task_assignee: newTeamMemberId })
    .eq('task_id', taskId)
    .select()
    .single()
  return { data, error }
}

export const updateTaskStatus = async (taskId: string, newTaskStatusId: string): Promise<TaskSingleResponse> => {
  const { data, error } = await supabase
    .from('task')
    .update({ task_status: newTaskStatusId })
    .eq('task_id', taskId)
    .select()
    .single()
  return { data, error }
}

export const deleteTask = async (taskId: string): Promise<DeleteRowResponse> => {
  const { error } = await supabase
    .from('task')
    .delete()
    .eq('task_id', taskId)
  return error
}


// ---------------------------------------------------------------- TASK STATUS ----------------------------------------------------------------
export const fetchTaskStatusById = async (taskStatusId: string): Promise<TaskStatusSingleResponse> => {
    const { data, error } = await supabase
      .from('task_status')
      .select()
      .eq('task_status_id', taskStatusId)
      .select()
      .single()
    return { data, error }
  }

export const updateTaskStatusName = async (taskStatusId: string, newTaskStatusName: string): Promise<TaskStatusSingleResponse> => {
    const { data, error } = await supabase
      .from('task_status')
      .update({ task_status_name: newTaskStatusName })
      .eq('task_status_id', taskStatusId)
      .select()
      .single()
    return { data, error }
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
export const createTeam = async (teamName: string): Promise<TeamSingleResponse> => {
  const { data, error } = await supabase
    .from('team')
    .insert({ team_name: teamName })
    .select()
    .single()
  return { data, error }
}

export const fetchTeamById = async (teamId: string): Promise<TeamSingleResponse> => {
  const { data, error } = await supabase
    .from('team')
    .select()
    .eq('team_id', teamId)
    .select()
    .single()
  return { data, error }
}

export const updateTeamName = async (teamId: string, newTeamName: string): Promise<TeamSingleResponse> => {
  const { data, error } = await supabase
    .from('team')
    .update({ team_name: newTeamName })
    .eq('team_id', teamId)
  return { data, error }
}

export const deleteTeam = async (teamId: string): Promise<DeleteRowResponse> => {
  const { error } = await supabase
    .from('team')
    .delete()
    .eq('team_id', teamId)
  return error
}

export const fetchTeamsForUser = async (userId: string): Promise<TeamMultiResponse> => {
  try {
    // Step 1: Get all user_team's for the user from user_team table
    const { data: userTeams, error: userTeamError } = await fetchAllUserTeamsForUser(userId);

    //error fetching the user's teams
    if (userTeamError) {
      return { data: null, error: userTeamError };
    }
    
    //user belongs to no teams right now 
    if (!userTeams || userTeams.length === 0) {
      return { data: [], error: null };
    }

    // Step 2: Fetch team details from the team table
    const teamPromises = userTeams.map(async (userTeam: UserTeam) => {

      const { data: team, error: teamError } = await fetchTeamById(userTeam.team_id as string);

      if (teamError) {
        throw teamError; // This error will be caught in the catch block below
      }

      return team as Team;
    });

    // Wait for all team fetches to complete
    const teams = await Promise.all(teamPromises);

    return { data: teams, error: null };

  } catch (error) {
    console.error('Error in fetchTeamsForUser:', error);
    // Ensure we're returning a PostgrestError or null
    if (error instanceof Error) {
      const postgrestError: PostgrestError = {
        message: error.message,
        details: '',
        hint: '',
        code: 'CUSTOM_ERROR'
      };
      return { data: null, error: postgrestError };
    }
    return { data: null, error: error as PostgrestError };
  }
};



// ---------------------------------------------------------------- USER ----------------------------------------------------------------

export const createUser = async (userId: string, userFirstName: string, userLastName: string, userUserName: string): Promise<UserSingleResponse> => {
  const { data, error } = await supabase
    .from('user')
    .insert({ user_id: userId, user_fname: userFirstName, user_lname: userLastName, user_username: userUserName})
    .select()
    .single()
  return { data, error }
}

export const fetchUser = async (userId: string): Promise<UserSingleResponse> => {
  const { data, error } = await supabase
    .from('user')
    .select()
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const fetchUserByUserName = async (userUserName: string): Promise<UserSingleResponse> => {
  const { data, error } = await supabase
    .from('user')
    .select()
    .eq('user_username', userUserName)
    .single()
  return { data, error }
}

export const fetchUserByUserNameMulti = async (userUserName: string): Promise<UserMultiResponse> => {
  const { data, error } = await supabase
    .from('user')
    .select()
    .eq('user_username', userUserName)
  return { data, error }
}

export const checkUserNameAvailable = async (userUserName: string): Promise<boolean> => {
  const { data, error } = await fetchUserByUserNameMulti(userUserName)

  if (error) {
    console.error('Error checking username availability:', error);
    return false; // Assume username is not available if there's an error
  }

  if(!data) {
    return false;
  }

  // If data is an empty array, the username is available
  return data.length === 0;
}

//adding a new team member to a team
export const checkNewTeamMember = async (newTeamMemberUserName: string, teamId: string): Promise<CheckTeamMemberResponse> => {
  const { data: dataUser, error: errorUser } = await fetchUserByUserName(newTeamMemberUserName)

  // Step 1: check if valid user
  if (errorUser || !dataUser) {
    return AddUserNameToTeam.invalidUserName
  }

  // Step 2: user_team rows for this user with userUserName - look up the user_team instances for this user and check if any of them have team_id == teamId
  const {data: dataUserTeam, error: errorUserTeam} = await fetchAllUserTeamsForUser(dataUser.user_id)

  if (errorUserTeam) {
    return AddUserNameToTeam.error
  }
  
  if (!dataUserTeam) {
    console.log('No teams found for this user.');
    return AddUserNameToTeam.validToAdd;  // If no teams found, user can be added to this team
  }
  
  // Step 3: Process the fetched data (dataUserTeam is now a valid array of UserTeam objects)
  const isAlreadyInTeam = dataUserTeam.some(team => team.team_id === teamId);
  
  if (isAlreadyInTeam) {
    return AddUserNameToTeam.alreadyInTeam;
  }

  return AddUserNameToTeam.validToAdd;
}


// ---------------------------------------------------------------- USER TEAM ----------------------------------------------------------------
export const createUserTeam = async (userId: string, teamId: string, userTeamRole: UserTeamRole): Promise<UserTeamSingleResponse> => {
  const { data, error } = await supabase
    .from('user_team')
    .insert({ user_id: userId, team_id: teamId, user_team_role: userTeamRole })
    .select()
    .single()
  return { data, error }
}



export const fetchAllUserTeamsForUser = async (userId: string): Promise<UserTeamMultiResponse> => {
  const { data, error } = await supabase
    .from('user_team')
    .select()
    .eq('user_id', userId)
    .select()
  return { data, error }
}

export const fetchUserTeam = async (userId: string, teamId: string): Promise<UserTeamSingleResponse> => {
  const { data, error } = await supabase
    .from('user_team')
    .select()
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .select()
    .single()
  return { data, error }
}

export const updateUserTeamRole = async (userId: string, teamId: string, newUserTeamRole: UserTeamRole): Promise<UserTeamSingleResponse> => {
  const { data, error } = await supabase
    .from('user_team')
    .update({ user_team_role: newUserTeamRole })
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .select()
    .single()
  return { data, error }
}

//remove a member from the team
export const deleteUserTeam = async (userId: string, teamId: string): Promise<DeleteRowResponse> => {
  const { error } = await supabase
    .from('user_team')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId)
  return error
}


// main function to use when you create a new team (automatically adds the user to the new team)
export const createTeamAndAddUser = async (teamName: string): Promise<{ success: boolean; error: string | null; teamId: string | null }> => {
  
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "No user is currently logged in", teamId: null };
    }

    const { data: newTeam, error: teamError } = await createTeam(teamName);
    if (teamError) {
      return { success: false, error: teamError.message, teamId: null };
    }
    if (!newTeam) {
      return { success: false, error: "Failed to create team: No data returned", teamId: null };
    }

    const { data: newUserTeam, error: userTeamError } = await createUserTeam(userId, newTeam.team_id, UserTeamRole.admin);
    if (userTeamError) {

      // If adding the user fails, delete the created team
      await deleteTeam(newTeam.team_id);
      return { success: false, error: userTeamError.message, teamId: null };
    }
    if (!newUserTeam) {
      // If no data was returned, it's an unexpected error
      await deleteTeam(newTeam.team_id);
      return { success: false, error: "Failed to add user to team: No data returned", teamId: null };
    }

    return { success: true, error: null, teamId: newTeam.team_id };

}



export const fetchAllUserTeamForTeam = async (teamId: string): Promise<UserTeamMultiResponse> => {
  const { data, error } = await supabase
    .from('user_team')
    .select()
    .eq('team_id', teamId)
    .select()
  return { data, error }
}




