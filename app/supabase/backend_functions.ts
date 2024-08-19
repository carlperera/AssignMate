import { User } from "@supabase/supabase-js";
import supabase  from "./supabaseClient";



const fetchAllTeams = async (): Promise<{ data: [] | null; error: any }> => {
    const { data, error } = await supabase
        .from('team')
        .select('*');

    return { data, error };
};


/* 




*/
// const fetchAllTeams = async (): Promise<{ data: Team[] | null; error: any }> => {
//     const { data, error } = await supabase
//         .from('team')
//         .select('*');

//     return { data, error };
// };



// const fetch = async () => {
//     const { data, error } = await supabase
//         .from('team')
//         .select('*');
    
// }

const addNewUser = async (user: User): Promise<{ data: User | null; error: any }> => {
    const {error } = await supabase
    .from('user')
      .insert([user]);
  
    return { data: data ? data[0] : null, error }; // Return the first user or null if no data
  };
