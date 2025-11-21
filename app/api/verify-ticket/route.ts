import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateQRToken, QRPayload } from '@/lib/crypto'
import { checkAssetOwnership } from '@/lib/algorand'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrPayload, scannerLat, scannerLng, verifiedBy } = body

    // Validate QR payload structure
    if (!qrPayload || !qrPayload.walletAddress || !qrPayload.eventId || !qrPayload.token) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Invalid QR code format' 
        },
        { status: 400 }
      )
    }

    const payload: QRPayload = qrPayload

    // Validate QR token (time window and HMAC)
    const isValidToken = validateQRToken(payload, 20000)
    if (!isValidToken) {
      return NextResponse.json({
        valid: false,
        error: 'QR code has expired or is invalid'
      })
    }

    // Get event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('event_id', payload.eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({
        valid: false,
        error: 'Event not found'
      })
    }

    // Check if ticket has already been used
    const { data: existingCheckIn } = await supabaseAdmin
      .from('checkins')
      .select('id')
      .eq('event_id', payload.eventId)
      .eq('user_address', payload.walletAddress)
      .single()

    if (existingCheckIn) {
      return NextResponse.json({
        valid: false,
        error: 'Ticket has already been used'
      })
    }

    // Get ASA ID - use EVENT_ASA_ID from environment if event ASA ID is not set
    let asaId = event.asa_id
    if (!asaId || asaId === 0) {
      const envAsaId = process.env.EVENT_ASA_ID
      if (!envAsaId || envAsaId === 'REPLACE_WITH_ASA_ID') {
        return NextResponse.json({
          valid: false,
          error: 'Event ASA ID not configured'
        })
      }
      asaId = parseInt(envAsaId)
    }

    // Verify current ASA ownership (anti-resell protection)
    const ownsTicket = await checkAssetOwnership(payload.walletAddress, asaId)
    if (!ownsTicket) {
      return NextResponse.json({
        valid: false,
        error: 'Ticket is no longer owned by this wallet'
      })
    }

    // Mark ticket as used (create check-in record)
    const { error: checkInError } = await supabaseAdmin
      .from('checkins')
      .insert({
        user_address: payload.walletAddress,
        event_id: payload.eventId,
        verified_by: verifiedBy || 'scanner',
        scanner_location_lat: scannerLat,
        scanner_location_lng: scannerLng
      })

    if (checkInError) {
      console.error('Error creating check-in record:', checkInError)
      return NextResponse.json({
        valid: false,
        error: 'Failed to process check-in'
      })
    }

    // Clean up expired QR tokens (optional)
    await supabaseAdmin
      .from('qr_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString())

    return NextResponse.json({
      valid: true,
      name: `User ${payload.walletAddress.slice(0, 8)}...`,
      address: payload.walletAddress,
      timestamp: new Date().toISOString(),
      user: { 
        wallet_address: payload.walletAddress,
        name: `User ${payload.walletAddress.slice(0, 8)}...`
      },
      event: {
        name: event.name,
        description: event.description
      },
      message: 'Ticket verified successfully'
    })

  } catch (error) {
    console.error('Error verifying ticket:', error)
    return NextResponse.json({
      valid: false,
      error: 'Internal server error'
    })
  }
}
