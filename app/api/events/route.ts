import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/events - Fetch all events
export async function GET() {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      events
    })

  } catch (error) {
    console.error('Error in events API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
