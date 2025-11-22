import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateQRToken, isWithinGeofence, calculateDistance } from '@/lib/crypto'
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

    // Convert user coordinates to numbers (they might come as strings from JSON)
    const userLatNum = typeof userLat === 'string' ? parseFloat(userLat) : Number(userLat)
    const userLngNum = typeof userLng === 'string' ? parseFloat(userLng) : Number(userLng)

    // Validate user coordinates are valid numbers
    if (isNaN(userLatNum) || isNaN(userLngNum)) {
      return NextResponse.json(
        { error: 'Invalid user coordinates. Please ensure location services are enabled.' },
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

    // Use environment variables for geofencing (env vars take priority over database)
    // This allows you to override database values with env vars
    let venueLat: number | null = null
    let venueLng: number | null = null
    let radiusMeters: number | null = null

    // First, try to get from environment variables
    const envLat = process.env.VENUE_LAT
    const envLng = process.env.VENUE_LNG
    const envRadius = process.env.RADIUS_METERS

    if (envLat) {
      venueLat = parseFloat(envLat)
      if (isNaN(venueLat)) {
        return NextResponse.json(
          { error: 'Invalid VENUE_LAT format. Must be a valid number.' },
          { status: 400 }
        )
      }
    }

    if (envLng) {
      venueLng = parseFloat(envLng)
      if (isNaN(venueLng)) {
        return NextResponse.json(
          { error: 'Invalid VENUE_LNG format. Must be a valid number.' },
          { status: 400 }
        )
      }
    }

    if (envRadius) {
      radiusMeters = parseInt(envRadius)
      if (isNaN(radiusMeters)) {
        return NextResponse.json(
          { error: 'Invalid RADIUS_METERS format. Must be a valid number.' },
          { status: 400 }
        )
      }
    }

    // Fallback to database values if env vars are not set
    if (venueLat === null) {
      venueLat = event.venue_lat
    }
    if (venueLng === null) {
      venueLng = event.venue_lng
    }
    if (radiusMeters === null) {
      radiusMeters = event.radius_meters
    }

    // Final validation - ensure we have all required values
    if (venueLat === null || venueLat === undefined || isNaN(venueLat)) {
      return NextResponse.json(
        { error: 'Venue latitude not configured. Please set VENUE_LAT in environment variables or in the event database.' },
        { status: 400 }
      )
    }

    if (venueLng === null || venueLng === undefined || isNaN(venueLng)) {
      return NextResponse.json(
        { error: 'Venue longitude not configured. Please set VENUE_LNG in environment variables or in the event database.' },
        { status: 400 }
      )
    }

    if (radiusMeters === null || radiusMeters === undefined || isNaN(radiusMeters)) {
      return NextResponse.json(
        { error: 'Venue radius not configured. Please set RADIUS_METERS in environment variables or in the event database.' },
        { status: 400 }
      )
    }

    // Log configuration source for debugging
    console.log('Venue configuration:', {
      source: {
        lat: envLat ? 'ENV' : 'DB',
        lng: envLng ? 'ENV' : 'DB',
        radius: envRadius ? 'ENV' : 'DB'
      },
      values: {
        venueLat,
        venueLng,
        radiusMeters
      },
      envVars: {
        VENUE_LAT: envLat || 'not set',
        VENUE_LNG: envLng || 'not set',
        RADIUS_METERS: envRadius || 'not set'
      },
      dbValues: {
        venue_lat: event.venue_lat,
        venue_lng: event.venue_lng,
        radius_meters: event.radius_meters
      }
    })

    // Validate that all coordinates are valid numbers
    if (isNaN(venueLat) || isNaN(venueLng) || isNaN(radiusMeters)) {
      return NextResponse.json(
        { error: 'Invalid venue coordinates or radius. Please check your configuration.' },
        { status: 400 }
      )
    }

    // Calculate distance for debugging
    const distance = calculateDistance(userLatNum, userLngNum, venueLat, venueLng)

    // Add GPS accuracy buffer (GPS can be off by 20-50 meters, so we add a buffer)
    const GPS_ACCURACY_BUFFER = 50 // meters
    const effectiveRadius = radiusMeters + GPS_ACCURACY_BUFFER

    // Check geofencing - user must be within venue radius (with GPS accuracy buffer)
    const withinGeofence = distance <= effectiveRadius

    // Log geofencing details for debugging (remove in production if needed)
    console.log('Geofencing check:', {
      userLocation: { lat: userLatNum, lng: userLngNum },
      venueLocation: { lat: venueLat, lng: venueLng },
      radiusMeters,
      gpsBuffer: GPS_ACCURACY_BUFFER,
      effectiveRadius,
      distanceMeters: parseFloat(distance.toFixed(2)),
      withinGeofence,
      distanceVsRadius: `${distance.toFixed(2)}m vs ${radiusMeters}m (effective: ${effectiveRadius}m)`
    })

    if (!withinGeofence) {
      return NextResponse.json(
        { 
          error: `You must be at the venue to generate a QR code. You are ${Math.round(distance)}m away (radius: ${radiusMeters}m)`,
          details: {
            distance: Math.round(distance),
            radius: radiusMeters,
            effectiveRadius,
            userLocation: { lat: userLatNum, lng: userLngNum },
            venueLocation: { lat: venueLat, lng: venueLng },
            needsToBeWithin: `${radiusMeters}m (with ${GPS_ACCURACY_BUFFER}m GPS buffer = ${effectiveRadius}m)`
          }
        },
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
      if (isNaN(asaId)) {
        return NextResponse.json(
          { error: 'Invalid EVENT_ASA_ID format. Must be a valid number.' },
          { status: 400 }
        )
      }
    }

    // Log ASA ID being checked
    console.log('Checking ticket ownership:', {
      walletAddress,
      eventId,
      asaId,
      asaIdSource: event.asa_id && event.asa_id !== 0 ? 'DB' : 'ENV'
    })

    // Check if user owns the required ASA (ticket)
    let ownsTicket = false
    let ownershipError: string | null = null
    try {
      ownsTicket = await checkAssetOwnership(walletAddress, asaId)
      
      // Get detailed asset info for debugging
      const { getAccountAssets } = await import('@/lib/algorand')
      const allAssets = await getAccountAssets(walletAddress)
      
      // Try both property names (asset-id and assetId)
      const matchingAsset = allAssets.find((a) => 
        a['asset-id'] === asaId || a.assetId === asaId
      )
      
      // Log first asset structure to see what properties exist (convert BigInt safely)
      const firstAsset = allAssets[0]
      const assetKeys = firstAsset ? Object.keys(firstAsset) : []
      
      // Safely convert asset for logging (handle BigInt)
      const safeFirstAsset = firstAsset ? {
        assetId: firstAsset.assetId,
        'asset-id': firstAsset['asset-id'],
        amount: firstAsset.amount,
        'is-frozen': firstAsset['is-frozen'] || firstAsset.isFrozen
      } : null
      
      console.log('Asset ownership check:', {
        walletAddress,
        asaId,
        ownsTicket,
        totalAssetsInWallet: allAssets.length,
        matchingAsset: matchingAsset ? {
          'asset-id': matchingAsset['asset-id'] || matchingAsset.assetId,
          amount: matchingAsset.amount,
          'is-frozen': matchingAsset['is-frozen'] || matchingAsset.isFrozen
        } : 'NOT FOUND',
        allAssetIds: allAssets.map((a) => a['asset-id'] || a.assetId).slice(0, 10),
        firstAssetKeys: assetKeys,
        firstAssetSample: safeFirstAsset
      })
    } catch (error) {
      ownershipError = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error checking asset ownership:', error)
    }

    if (!ownsTicket) {
      return NextResponse.json(
        { 
          error: 'You do not own a valid ticket for this event',
          details: {
            walletAddress,
            requiredAsaId: asaId,
            ownershipCheckError: ownershipError || null,
            hint: ownershipError 
              ? 'There was an error checking ownership. Please check your Algorand indexer configuration.'
              : 'Make sure you have purchased a ticket for this event and that it is in your wallet.'
          }
        },
        { status: 403 }
      )
    }

    // Check if ticket has already been used
    const { data: existingCheckIn } = await supabaseAdmin
      .from('checkins')
      .select('checkin_id')
      .eq('event_id', eventId)
      .eq('wallet_address', walletAddress)
      .maybeSingle()

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
