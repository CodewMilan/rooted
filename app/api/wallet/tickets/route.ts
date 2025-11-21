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

    // Get tickets from database
    const { data: dbTickets, error: ticketsError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('user_address', walletAddress)

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      )
    }

    // Format tickets for response
    const tickets = []

    if (dbTickets && dbTickets.length > 0) {
      for (const ticket of dbTickets) {
        // Get event details for this ticket
        const { data: eventData, error: eventError } = await supabaseAdmin
          .from('events')
          .select('*')
          .eq('event_id', ticket.event_id)
          .single()

        if (eventError) {
          console.error('Error fetching event:', eventError)
          continue
        }

        // Check if ticket has been used (checked in)
        const { data: checkIn } = await supabaseAdmin
          .from('checkins')
          .select('timestamp')
          .eq('event_id', ticket.event_id)
          .eq('user_address', walletAddress)
          .single()

        if (eventData) {
          tickets.push({
            id: ticket.id, // Add unique ticket ID
            event: {
              event_id: eventData.event_id,
              name: eventData.name,
              description: eventData.description,
              asa_id: ticket.asa_id // Use the ASA ID from the ticket record
            },
            assetId: ticket.asa_id,
            amount: ticket.amount,
            used: !!checkIn,
            usedAt: checkIn?.timestamp || null
          })
        }
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
