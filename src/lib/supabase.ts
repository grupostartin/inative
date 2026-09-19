import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcpelappplvlcekjjxby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcGVsYXBwcGx2bGNla2pqeGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3ODcwMzgsImV4cCI6MjEwNTM2MzAzOH0.yPXDV19MmDTcCiDVREKuNSHV0L2L0QKWqDj-VYYDxtk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
