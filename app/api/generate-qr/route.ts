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

    // Use environment variables for geofencing if not in database
    const venueLat = event.venue_lat || parseFloat(process.env.VENUE_LAT!)
    const venueLng = event.venue_lng || parseFloat(process.env.VENUE_LNG!)
    const radiusMeters = event.radius_meters || parseInt(process.env.RADIUS_METERS!)

    // Check geofencing - user must be within venue radius
    const withinGeofence = isWithinGeofence(
      userLat,
      userLng,
      venueLat,
      venueLng,
      radiusMeters
    )

    if (!withinGeofence) {
      return NextResponse.json(
        { error: 'You must be at the venue to generate a QR code' },
        { status: 403 }
      )
    }

    // Get ASA ID - use EVENT_ASA_ID from environment if event ASA ID is not set
    let asaId = event.asa_id
    if (!asaId || asaId === 0) {
      const envAsaId = process.env.EVENT_ASA_ID
      if (!envAsaId || envAsaId === 'REPLACE_WITH_ASA_ID') {
        return NextResponse.json(
          { error: 'Event ASA ID not configured. Please create ASA first using: npm run create:asa' },
          { status: 400 }
        )
      }
      asaId = parseInt(envAsaId)
    }

    // Check if user owns the required ASA (ticket)
    const ownsTicket = await checkAssetOwnership(walletAddress, asaId)
    if (!ownsTicket) {
      return NextResponse.json(
        { error: 'You do not own a valid ticket for this event' },
        { status: 403 }
      )
    }

    // Check if ticket has already been used
    const { data: existingCheckIn } = await supabaseAdmin
      .from('checkins')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_address', walletAddress)
      .single()

    if (existingCheckIn) {
      return NextResponse.json(
        { error: 'Ticket has already been used' },
        { status: 409 }
      )
    }

    // Generate QR token (20-second time window)
    const qrPayload = generateQRToken(walletAddress, eventId, 20000)

    // Cache the token in database
    await supabaseAdmin
      .from('qr_tokens')
      .insert({
        user_address: walletAddress,
        event_id: eventId,
        token_hash: qrPayload.token,
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
