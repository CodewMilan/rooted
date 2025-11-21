'use client'

import { useState, useEffect } from 'react'
import WalletConnectButton, { peraWallet } from '@/components/WalletConnectButton'

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
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events')
      }
      
      setEvents(data.events)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleWalletConnect = (accounts: string[]) => {
    setWalletAddress(accounts[0])
  }

  const handleWalletDisconnect = () => {
    setWalletAddress('')
  }

  const handlePurchaseTicket = async (event: Event) => {
    if (!walletAddress) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setPurchasing(event.event_id)
      setError('')

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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create transaction')
      }

      // Sign transactions with Pera Wallet
      const signedTxns = await peraWallet.signTransaction([data.txnsToSign])

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
      setError(err instanceof Error ? err.message : 'Purchase failed')
    } finally {
      setPurchasing('')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <p>Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="events-page">
        <div className="page-header">
          <h1>Events</h1>
          <p>Purchase tickets for upcoming events</p>
        </div>

        <div className="wallet-section">
          <WalletConnectButton
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="events-section">
          {events.length === 0 ? (
            <div className="no-events">
              <p>No events available at the moment</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.event_id} className="event-card">
                  <div className="event-header">
                    <h3>{event.name}</h3>
                    <span className="event-id">ID: {event.event_id}</span>
                  </div>
                  
                  <div className="event-details">
                    <p>{event.description}</p>
                    <div className="event-meta">
                      <p><strong>ASA ID:</strong> {event.asa_id}</p>
                      <p><strong>Venue:</strong> {event.venue_lat.toFixed(4)}, {event.venue_lng.toFixed(4)}</p>
                      <p><strong>Radius:</strong> {event.radius_meters}m</p>
                      <p><strong>Created:</strong> {new Date(event.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="event-actions">
                    <div className="ticket-price">
                      <span>Price: 1 ALGO</span>
                    </div>
                    
                    {walletAddress ? (
                      <button 
                        onClick={() => handlePurchaseTicket(event)}
                        disabled={purchasing === event.event_id}
                        className="purchase-btn"
                      >
                        {purchasing === event.event_id ? 'Purchasing...' : 'Buy Ticket'}
                      </button>
                    ) : (
                      <button disabled className="connect-first-btn">
                        Connect Wallet to Purchase
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
