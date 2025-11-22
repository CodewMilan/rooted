import { NextRequest, NextResponse } from 'next/server'
import algosdk from 'algosdk'
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

    console.log('Buy ticket request:', { walletAddress, eventId })

    // Validate required fields
    if (!walletAddress || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, eventId' },
        { status: 400 }
      )
    }

    // Validate wallet address format
    if (!algosdk.isValidAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Validate organizer wallet
    if (!ORGANIZER_WALLET || !algosdk.isValidAddress(ORGANIZER_WALLET)) {
      return NextResponse.json(
        { error: 'Invalid organizer wallet configuration' },
        { status: 500 }
      )
    }

    // Get event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .single()

    if (eventError || !event) {
      console.error('Event not found:', eventError)
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Use EVENT_ASA_ID from environment if event ASA ID is not set
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
          { error: 'Invalid ASA ID in environment configuration' },
          { status: 400 }
        )
      }
    }

    console.log('Event found:', { eventId, asaId })

    // Get suggested transaction parameters
    let suggestedParams
    try {
      suggestedParams = await getSuggestedParams()
      console.log('Suggested params obtained')
    } catch (error) {
      console.error('Failed to get suggested params:', error)
      return NextResponse.json(
        { error: 'Failed to connect to Algorand network' },
        { status: 500 }
      )
    }

    // Create payment transaction (user pays organizer)
    let paymentTxn
    try {
      paymentTxn = createPaymentTransaction(
        walletAddress,
        ORGANIZER_WALLET,
        TICKET_PRICE_MICROALGOS,
        suggestedParams,
        `Payment for ${event.name} ticket`
      )
      console.log('Payment transaction created')
    } catch (error) {
      console.error('Failed to create payment transaction:', error)
      return NextResponse.json(
        { error: 'Failed to create payment transaction' },
        { status: 500 }
      )
    }

    // Create ASA transfer transaction (organizer sends ticket to user)
    let assetTransferTxn
    try {
      assetTransferTxn = createAssetTransferTransaction(
        ORGANIZER_WALLET,
        walletAddress,
        asaId,
        1, // Transfer 1 ticket
        suggestedParams,
        `Ticket for ${event.name}`
      )
      console.log('Asset transfer transaction created')
    } catch (error) {
      console.error('Failed to create asset transfer transaction:', error)
      return NextResponse.json(
        { error: 'Failed to create asset transfer transaction' },
        { status: 500 }
      )
    }

    // Group the transactions
    let groupedTxns
    try {
      groupedTxns = groupTransactions([paymentTxn, assetTransferTxn])
      console.log('Transactions grouped')
    } catch (error) {
      console.error('Failed to group transactions:', error)
      return NextResponse.json(
        { error: 'Failed to group transactions' },
        { status: 500 }
      )
    }

    // Convert transactions to base64 for signing
    let txnsToSign
    try {
      txnsToSign = [
        {
          txn: Buffer.from(groupedTxns[0].toByte()).toString('base64'),
          signers: [walletAddress]
        },
        {
          txn: Buffer.from(groupedTxns[1].toByte()).toString('base64'),
          signers: [ORGANIZER_WALLET]
        }
      ]
      console.log('Transactions prepared for signing')
    } catch (error) {
      console.error('Failed to prepare transactions for signing:', error)
      return NextResponse.json(
        { error: 'Failed to prepare transactions for signing' },
        { status: 500 }
      )
    }

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
      { error: `Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// Endpoint to confirm transaction after signing
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, eventId, signedTransactions } = body

    if (!walletAddress || !eventId || !signedTransactions) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, eventId, signedTransactions' },
        { status: 400 }
      )
    }

    if (!Array.isArray(signedTransactions) || signedTransactions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid signed transactions format' },
        { status: 400 }
      )
    }

    // Get event details to get ASA ID
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

    // Use EVENT_ASA_ID from environment if event ASA ID is not set
    let asaId = event.asa_id
    if (!asaId || asaId === 0) {
      const envAsaId = process.env.EVENT_ASA_ID
      if (envAsaId && envAsaId !== 'REPLACE_WITH_ASA_ID') {
        asaId = parseInt(envAsaId)
      }
    }

    // Submit signed transactions to Algorand network
    const { algodClient } = await import('@/lib/algorand')
    const algosdk = await import('algosdk')
    
    let txId: string | null = null

    try {
      // Convert base64 signed transactions to Uint8Array
      const signedTxnsBytes = signedTransactions.map((txnBase64: string) => 
        Buffer.from(txnBase64, 'base64')
      )

      // Submit all transactions (grouped transactions must be submitted together)
      // Algorand accepts an array of transactions for grouped transactions
      const response = await algodClient.sendRawTransaction(signedTxnsBytes).do()
      
      // Get the transaction ID (for grouped transactions, this is the group ID)
      txId = (response as any).txId || (response as any).txid
      
      if (!txId) {
        throw new Error('No transaction ID returned from network')
      }

      console.log('Transactions submitted successfully. Transaction ID:', txId)

      // Wait for confirmation (optional, but good for ensuring transaction is processed)
      try {
        await algosdk.waitForConfirmation(algodClient, txId, 4)
        console.log('Transaction confirmed on network')
      } catch (confirmationError) {
        // Don't fail if confirmation times out - transaction might still be processing
        console.warn('Transaction confirmation timeout (transaction may still be processing):', confirmationError)
      }

    } catch (error) {
      console.error('Error submitting transactions:', error)
      return NextResponse.json(
        { 
          error: `Failed to submit transaction to network: ${error instanceof Error ? error.message : 'Unknown error'}` 
        },
        { status: 500 }
      )
    }

    // Store ticket purchase in database with the actual transaction ID
    const { error: ticketError } = await supabaseAdmin
      .from('tickets')
      .insert({
        user_address: walletAddress,
        event_id: eventId,
        asa_id: asaId,
        txid: txId,
        amount: 1
      })

    if (ticketError) {
      console.error('Error storing ticket:', ticketError)
      // Don't fail the request if we can't store the ticket, as the blockchain transaction succeeded
      // But log it for debugging
    } else {
      console.log('Ticket stored in database with txId:', txId)
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket purchase confirmed',
      txId,
      asaId
    })

  } catch (error) {
    console.error('Error confirming ticket purchase:', error)
    return NextResponse.json(
      { error: 'Failed to confirm purchase' },
      { status: 500 }
    )
  }
}
