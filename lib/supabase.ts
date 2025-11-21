import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_PROJECT_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/client-side operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface User {
  wallet_address: string
  name: string
  email?: string
  created_at: string
}

export interface Event {
  event_id: string
  name: string
  description?: string
  asa_id: number
  venue_lat: number
  venue_lng: number
  radius_meters: number
  organizer_wallet: string
  created_at: string
}

export interface CheckIn {
  checkin_id: string
  event_id: string
  wallet_address: string
  timestamp: string
  scanner_location_lat?: number
  scanner_location_lng?: number
}

export interface QRToken {
  token: string
  wallet_address: string
  event_id: string
  expires_at: string
  created_at: string
}
