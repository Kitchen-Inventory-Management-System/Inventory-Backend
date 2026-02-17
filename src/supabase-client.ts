import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js'


const supabaseKey = process.env.supabaseKey as string;

const supabaseUrl = process.env.supabaseUrl as string;

const supabase = createClient(supabaseUrl, supabaseKey);
