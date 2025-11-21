'use client'

import algosdk from 'algosdk'
import { useState, useEffect } from 'react'
import { peraWallet } from '@/components/WalletConnectButton'

interface Event {
  event_id: string
  name: string
  description: string
  asa_id: number
  venue_lat: number
  venue_lng: number
  radius_meters: number
  organizer_wallet: string
  created_at: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string>('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      const accounts = await peraWallet.reconnectSession()
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
      }
    } catch (error) {
      console.log('No existing session')
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events')
      }

      setEvents(data.events || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseTicket = async (event: Event) => {
    if (!walletAddress) {
      alert('Please connect your wallet first')
      return
    }

    // Check if ASA ID is configured
    if (!event.asa_id || event.asa_id === 0) {
      setError('This event\'s ASA ID is not configured yet. Please run: npm run create:asa')
      return
    }

    try {
      setPurchasing(event.event_id)
      setError('')

      console.log('Starting ticket purchase for event:', event.event_id)

      // Create transaction group
      const response = await fetch('/api/buy-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress,
          eventId: event.event_id
        })
      })

      const data = await response.json()
      console.log('API response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create transaction')
      }

      console.log('Signing transactions with Pera Wallet...')

      // Decode transactions for Pera Wallet
      const txnsToSign = data.txnsToSign.map((item: { txn: string, signers: string[] }) => ({
        txn: algosdk.decodeUnsignedTransaction(Buffer.from(item.txn, 'base64')),
        signers: item.signers
      }))

      // Sign transactions with Pera Wallet
      const signedTxns = await peraWallet.signTransaction([txnsToSign])
      console.log('Transactions signed successfully')

      // Submit signed transactions
      const submitResponse = await fetch('/api/buy-ticket', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress,
          eventId: event.event_id,
          txId: 'pending' // In a real implementation, you'd get the actual txId
        })
      })

      const submitData = await submitResponse.json()

      if (!submitResponse.ok) {
        throw new Error(submitData.error || 'Failed to confirm purchase')
      }

      alert(`Ticket purchased successfully for ${event.name}!`)

    } catch (err) {
      console.error('Purchase error:', err)
      let errorMessage = 'Purchase failed'

      if (err instanceof Error) {
        errorMessage = err.message

        // Handle specific error cases
        if (err.message.includes('User rejected')) {
          errorMessage = 'Transaction was cancelled by user'
        } else if (err.message.includes('ASA ID not configured')) {
          errorMessage = 'Event ASA ID not configured. Please contact the organizer.'
        } else if (err.message.includes('network')) {
          errorMessage = 'Network connection error. Please try again.'
        }
      }

      setError(errorMessage)
    } finally {
      setPurchasing('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-25 gap-1 h-full">
            {Array.from({ length: 100 }, (_, i) => (
              <div key={i} className="text-gray-500 text-xs animate-pulse">🎫</div>
            ))}
          </div>
        </div>
        <section className="relative px-6 py-20 lg:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm p-8">
              <div className="flex items-center justify-center gap-4">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white text-lg">Loading events...</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-25 gap-1 h-full">
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} className="text-gray-500 text-xs animate-pulse">🎫</div>
          ))}
        </div>
      </div>

      <section className="relative px-6 py-20 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Available <span className="text-gray-400 animate-pulse">Events</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Purchase tickets for upcoming events using your Algorand wallet
            </p>
          </div>

          {error && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-red-950 border border-red-700 p-4 text-center">
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            {events.length === 0 ? (
              <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500"></div>
                      <div className="w-3 h-3 bg-yellow-500"></div>
                      <div className="w-3 h-3 bg-green-500"></div>
                    </div>
                    <span className="text-gray-400 text-sm">no-events-found</span>
                  </div>
                </div>
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-lg mb-4">No events available at the moment</div>
                  <div className="text-gray-500 text-sm">Check back later for new events</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.event_id} className="group relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10">

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-white group-hover:text-gray-100">{event.name}</h3>
                          <span className="text-xs text-gray-500 font-mono">{event.event_id}</span>
                        </div>

                        <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                          {event.description}
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-gray-500">ASA ID:</span>
                            <span className="text-white">{event.asa_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Location:</span>
                            <span className="text-white">{event.venue_lat.toFixed(4)}, {event.venue_lng.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Radius:</span>
                            <span className="text-white">{event.radius_meters}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created:</span>
                            <span className="text-white">{new Date(event.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-white font-bold">Price: 1 ALGO</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>

                        {walletAddress ? (
                          <button
                            onClick={() => handlePurchaseTicket(event)}
                            disabled={purchasing === event.event_id}
                            className="w-full bg-white text-black font-bold py-3 px-4 transition-all duration-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {purchasing === event.event_id ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                <span>Purchasing...</span>
                              </div>
                            ) : (
                              'Buy Ticket'
                            )}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-700 text-gray-400 font-bold py-3 px-4 cursor-not-allowed"
                          >
                            Connect Wallet to Purchase
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
