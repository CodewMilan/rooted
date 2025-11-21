import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, asaId } = body

    if (!eventId || !asaId) {
      return NextResponse.json(
        { error: 'Missing eventId or asaId' },
        { status: 400 }
      )
    }

    // Validate ASA ID is a positive number
    const asaIdNumber = parseInt(asaId)
    if (isNaN(asaIdNumber) || asaIdNumber <= 0) {
      return NextResponse.json(
        { error: 'Invalid ASA ID. Must be a positive number.' },
        { status: 400 }
      )
    }

    // Update the event with the new ASA ID
    const { data, error } = await supabaseAdmin
      .from('events')
      .update({ asa_id: asaIdNumber })
      .eq('event_id', eventId)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update database' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `ASA ID ${asaIdNumber} updated for event ${eventId}`,
      event: data[0]
    })

  } catch (error) {
    console.error('Error updating ASA ID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
