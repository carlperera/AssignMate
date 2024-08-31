import { User } from "@supabase/supabase-js";
import supabase  from "./supabaseClient";

/*
 1. fetch all teams
 2. fetch all projects
 2. fetch all projects for a specific team
 3. fetch all members/users for a specific team 
 4. fetch all tasks for a specific team 
 5. fetch all 

*/


const fetchAllTeams = async (): Promise<{ data: Team[] | null; error: any }> => {
    const { data, error } = await supabase
        .from('team')
        .select('*');

    return { data, error };
};


