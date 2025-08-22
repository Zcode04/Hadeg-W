// ============================================
// /app/lib/supabase-client.ts - App directory client
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/app/lib/supabase'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )











