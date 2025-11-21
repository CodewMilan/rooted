'use client'

import { useState, useEffect } from 'react'
import WalletConnectButton from '@/components/WalletConnectButton'
import QRDisplay from '@/components/QRDisplay'

interface Ticket {
  event: {
    event_id: string
    name: string
    description: string
    asa_id: number
  }
  assetId: number
  amount: number
  used: boolean
  usedAt: string | null
}

export default function TicketsPage() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState('')

  const fetchTickets = async (address: string) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/wallet/tickets?address=${address}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tickets')
      }
      
      setTickets(data.tickets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleWalletConnect = (accounts: string[]) => {
    const address = accounts[0]
    setWalletAddress(address)
    fetchTickets(address)
  }

  const handleWalletDisconnect = () => {
    setWalletAddress('')
    setTickets([])
    setSelectedTicket(null)
  }

  const handleShowQR = (ticket: Ticket) => {
    if (ticket.used) {
      alert('This ticket has already been used')
      return
    }
    setSelectedTicket(ticket)
  }

  const handleCloseQR = () => {
    setSelectedTicket(null)
  }

  if (selectedTicket) {
    return (
      <div className="page-container">
        <div className="qr-page">
          <div className="qr-header">
            <button onClick={handleCloseQR} className="back-btn">
              ← Back to Tickets
            </button>
            <h1>{selectedTicket.event.name}</h1>
            <p>{selectedTicket.event.description}</p>
          </div>
          
          <QRDisplay
            walletAddress={walletAddress}
            eventId={selectedTicket.event.event_id}
            onError={(error) => {
              setError(error)
              setSelectedTicket(null)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="tickets-page">
        <div className="page-header">
          <h1>My Tickets</h1>
          <p>Connect your wallet to view your event tickets</p>
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

        {walletAddress && (
          <div className="tickets-section">
            {loading ? (
              <div className="loading">
                <p>Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="no-tickets">
                <p>No tickets found in your wallet</p>
                <p>Purchase tickets from the events page</p>
              </div>
            ) : (
              <div className="tickets-grid">
                {tickets.map((ticket) => (
                  <div 
                    key={`${ticket.event.event_id}-${ticket.assetId}`}
                    className={`ticket-card ${ticket.used ? 'used' : 'active'}`}
                  >
                    <div className="ticket-header">
                      <h3>{ticket.event.name}</h3>
                      <span className={`ticket-status ${ticket.used ? 'used' : 'active'}`}>
                        {ticket.used ? 'Used' : 'Active'}
                      </span>
                    </div>
                    
                    <div className="ticket-details">
                      <p>{ticket.event.description}</p>
                      <p><strong>ASA ID:</strong> {ticket.assetId}</p>
                      <p><strong>Quantity:</strong> {ticket.amount}</p>
                      {ticket.used && ticket.usedAt && (
                        <p><strong>Used:</strong> {new Date(ticket.usedAt).toLocaleString()}</p>
                      )}
                    </div>

                    <div className="ticket-actions">
                      {!ticket.used ? (
                        <button 
                          onClick={() => handleShowQR(ticket)}
                          className="show-qr-btn"
                        >
                          Show QR Code
                        </button>
                      ) : (
                        <button disabled className="used-btn">
                          Ticket Used
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
