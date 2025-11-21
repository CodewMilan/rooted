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

    // Update events with ASA ID from environment if not set in database
    const updatedEvents = events?.map(event => {
      let asaId = event.asa_id
      if (!asaId || asaId === 0) {
        const envAsaId = process.env.EVENT_ASA_ID
        if (envAsaId && envAsaId !== 'REPLACE_WITH_ASA_ID') {
          asaId = parseInt(envAsaId)
        }
      }
      return {
        ...event,
        asa_id: asaId
      }
    })

    return NextResponse.json({
      success: true,
      events: updatedEvents
    })

  } catch (error) {
    console.error('Error in events API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
