import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { 
  getSuggestedParams, 
  createPaymentTransaction, 
  createAssetTransferTransaction,
  groupTransactions
} from '@/lib/algorand'

const ORGANIZER_WALLET = process.env.ORGANIZER_WALLET_ADDRESS!
const TICKET_PRICE_MICROALGOS = 1000000 // 1 ALGO in microAlgos

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, eventId } = body

    // Validate required fields
    if (!walletAddress || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, eventId' },
        { status: 400 }
      )
    }

    // Get event details
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

    // Get suggested transaction parameters
    const suggestedParams = await getSuggestedParams()

    // Create payment transaction (user pays organizer)
    const paymentTxn = createPaymentTransaction(
      walletAddress,
      ORGANIZER_WALLET,
      TICKET_PRICE_MICROALGOS,
      suggestedParams,
      `Payment for ${event.name} ticket`
    )

    // Create ASA transfer transaction (organizer sends ticket to user)
    const assetTransferTxn = createAssetTransferTransaction(
      ORGANIZER_WALLET,
      walletAddress,
      event.asa_id,
      1, // Transfer 1 ticket
      suggestedParams,
      `Ticket for ${event.name}`
    )

    // Group the transactions
    const groupedTxns = groupTransactions([paymentTxn, assetTransferTxn])

    // Convert transactions to base64 for signing
    const txnsToSign = [
      {
        txn: Buffer.from(groupedTxns[0].toByte()).toString('base64'),
        signers: [walletAddress]
      },
      {
        txn: Buffer.from(groupedTxns[1].toByte()).toString('base64'),
        signers: [ORGANIZER_WALLET]
      }
    ]

    return NextResponse.json({
      success: true,
      txnsToSign,
      message: 'Transaction group created. Please sign with your wallet.',
      eventName: event.name,
      price: TICKET_PRICE_MICROALGOS / 1000000 // Convert to ALGO for display
    })

  } catch (error) {
    console.error('Error creating ticket purchase transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

// Endpoint to confirm transaction after signing
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, eventId, txId } = body

    if (!walletAddress || !eventId || !txId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create or update user profile
    await supabaseAdmin
      .from('users')
      .upsert({
        wallet_address: walletAddress,
        name: `User ${walletAddress.slice(0, 8)}...`
      })

    return NextResponse.json({
      success: true,
      message: 'Ticket purchase confirmed',
      txId
    })

  } catch (error) {
    console.error('Error confirming ticket purchase:', error)
    return NextResponse.json(
      { error: 'Failed to confirm purchase' },
      { status: 500 }
    )
  }
}
