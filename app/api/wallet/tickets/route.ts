import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAccountAssets } from '@/lib/algorand'

// GET /api/wallet/tickets?address=WALLET_ADDRESS
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('address')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get all events to map ASA IDs to events
    const { data: events, error: eventsError } = await supabaseAdmin
      .from('events')
      .select('*')

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Get user's assets from Algorand Indexer
    const userAssets = await getAccountAssets(walletAddress)
    
    // Filter assets that match event ASA IDs
    const tickets = []
    for (const asset of userAssets) {
      // Check against both database ASA ID and environment ASA ID
      let matchingEvent = events?.find(e => e.asa_id === asset['asset-id'])
      
      // If no match and event has ASA ID 0, check against environment ASA ID
      if (!matchingEvent) {
        const envAsaId = process.env.EVENT_ASA_ID
        if (envAsaId && envAsaId !== 'REPLACE_WITH_ASA_ID') {
          const envAsaIdNum = parseInt(envAsaId)
          if (asset['asset-id'] === envAsaIdNum) {
            matchingEvent = events?.find(e => e.asa_id === 0 || !e.asa_id)
          }
        }
      }
      
      if (matchingEvent && asset.amount > 0) {
        // Check if ticket has been used
        const { data: checkIn } = await supabaseAdmin
          .from('checkins')
          .select('timestamp')
          .eq('event_id', matchingEvent.event_id)
          .eq('user_address', walletAddress)
          .single()

        tickets.push({
          event: {
            ...matchingEvent,
            asa_id: asset['asset-id'] // Use the actual ASA ID from blockchain
          },
          assetId: asset['asset-id'],
          amount: asset.amount,
          used: !!checkIn,
          usedAt: checkIn?.timestamp || null
        })
      }
    }

    return NextResponse.json({
      success: true,
      walletAddress,
      tickets
    })

  } catch (error) {
    console.error('Error fetching wallet tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}
