// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../app/supabase/database.types'; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (typeof supabaseUrl !== 'string' || typeof supabaseAnonKey !== 'string') {
  throw new Error(`Supabase URL and Key are required. ENV: ${process.env.NODE_ENV}`)
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)