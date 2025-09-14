import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://obcjikmsckzcrlhxqvlg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iY2ppa21zY2t6Y3JsaHhxdmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTgwNjgsImV4cCI6MjA3MzM5NDA2OH0.sDZgqA-Vv411pocU3qYv_lcWhWDnig7ddi376RN4thI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
