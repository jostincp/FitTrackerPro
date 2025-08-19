import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

// Create a single supabase client for interacting with your database
export const supabase = createClientComponentClient<Database>();

// Export the client for use in components
export default supabase;