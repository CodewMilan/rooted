import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const envLat = process.env.VENUE_LAT
    const envLng = process.env.VENUE_LNG
    const envRadius = process.env.RADIUS_METERS

    return NextResponse.json({
      environmentVariables: {
        VENUE_LAT: envLat || 'NOT SET',
        VENUE_LNG: envLng || 'NOT SET',
        RADIUS_METERS: envRadius || 'NOT SET'
      },
      parsedValues: {
        venueLat: envLat ? parseFloat(envLat) : null,
        venueLng: envLng ? parseFloat(envLng) : null,
        radiusMeters: envRadius ? parseInt(envRadius) : null
      },
      isValid: {
        lat: envLat ? !isNaN(parseFloat(envLat)) : false,
        lng: envLng ? !isNaN(parseFloat(envLng)) : false,
        radius: envRadius ? !isNaN(parseInt(envRadius)) : false
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read environment variables' },
      { status: 500 }
    )
  }
}

