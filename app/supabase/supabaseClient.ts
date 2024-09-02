// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types'

//supabaseURL and supabaseKey
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key are required');
}


//create the client - with the database types imported 
const supabase = createClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string
)
export default supabase;

