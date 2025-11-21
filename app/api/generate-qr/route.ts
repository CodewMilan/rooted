import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateQRToken, isWithinGeofence } from '@/lib/crypto'
import { checkAssetOwnership } from '@/lib/algorand'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, eventId, userLat, userLng } = body

    // Validate required fields
    if (!walletAddress || !eventId || userLat === undefined || userLng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, eventId, userLat, userLng' },
        { status: 400 }
      )
    }

    // Get event details from database
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check geofencing - user must be within venue radius
    const withinGeofence = isWithinGeofence(
      userLat,
      userLng,
      event.venue_lat,
      event.venue_lng,
      event.radius_meters
    )

    if (!withinGeofence) {
      return NextResponse.json(
        { error: 'You must be at the venue to generate a QR code' },
        { status: 403 }
      )
    }

    // Check if user owns the required ASA (ticket)
    const ownsTicket = await checkAssetOwnership(walletAddress, event.asa_id)
    if (!ownsTicket) {
      return NextResponse.json(
        { error: 'You do not own a valid ticket for this event' },
        { status: 403 }
      )
    }

    // Check if ticket has already been used
    const { data: existingCheckIn } = await supabaseAdmin
      .from('checkins')
      .select('checkin_id')
      .eq('event_id', eventId)
      .eq('wallet_address', walletAddress)
      .single()

    if (existingCheckIn) {
      return NextResponse.json(
        { error: 'Ticket has already been used' },
        { status: 409 }
      )
    }

    // Generate QR token (20-second time window)
    const qrPayload = generateQRToken(walletAddress, eventId, 20000)

    // Optionally cache the token in database
    await supabaseAdmin
      .from('qr_tokens')
      .insert({
        token: qrPayload.token,
        wallet_address: walletAddress,
        event_id: eventId,
        expires_at: new Date(qrPayload.expires).toISOString()
      })

    return NextResponse.json({
      success: true,
      qrPayload,
      message: 'QR code generated successfully'
    })

  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
