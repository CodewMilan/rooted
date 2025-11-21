'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { peraWallet } from '@/components/WalletConnectButton'
import QRDisplay from '@/components/QRDisplay'

interface Ticket {
  id: number
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

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      const accounts = await peraWallet.reconnectSession()
      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        fetchTickets(address)
      }
    } catch (error) {
      console.log('No existing session')
    }
  }

  const fetchTickets = async (address: string) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/wallet/tickets?address=${address}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tickets')
      }

      setTickets(data.tickets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
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
      <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-25 gap-1 h-full">
            {Array.from({ length: 100 }, (_, i) => (
              <div key={i} className="text-gray-500 text-xs animate-pulse">🎫</div>
            ))}
          </div>
        </div>

        <section className="relative px-6 py-20 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <button
                onClick={handleCloseQR}
                className="group relative cursor-pointer mb-6"
              >
                <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white"></div>
                <div className="relative border border-gray-400 bg-transparent text-white font-medium px-4 py-2 text-sm transition-all duration-300 group-hover:border-white group-hover:bg-gray-900/30 transform translate-x-0.5 translate-y-0.5 group-hover:translate-x-0 group-hover:translate-y-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">←</span>
                    <span>Back to Tickets</span>
                  </div>
                </div>
              </button>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{selectedTicket.event.name}</h1>
              <p className="text-lg text-gray-300">{selectedTicket.event.description}</p>
            </div>

            <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500"></div>
                    <div className="w-3 h-3 bg-yellow-500"></div>
                    <div className="w-3 h-3 bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-sm">qr-generator</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-xs">ACTIVE</span>
                </div>
              </div>

              <div className="p-8">
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
              My <span className="text-gray-400 animate-pulse">Tickets</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              {walletAddress ? 'Manage your event tickets and generate QR codes for entry' : 'Connect your wallet to view your event tickets'}
            </p>
          </div>

          {error && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-red-950 border border-red-700 p-4 text-center">
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          {!walletAddress ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500"></div>
                      <div className="w-3 h-3 bg-yellow-500"></div>
                      <div className="w-3 h-3 bg-green-500"></div>
                    </div>
                    <span className="text-gray-400 text-sm">wallet-required</span>
                  </div>
                </div>
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-lg mb-6">Wallet Connection Required</div>
                  <div className="text-gray-500 text-sm mb-8">Connect your Pera Wallet to view and manage your tickets</div>
                  <Link href="/events" className="group relative cursor-pointer inline-block">
                    <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white"></div>
                    <div className="relative border border-white bg-white text-black font-bold px-8 py-4 text-lg transition-all duration-300 group-hover:bg-gray-100 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">🎫</span>
                        <span>Browse Events</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm p-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white text-lg">Loading tickets...</span>
                </div>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500"></div>
                      <div className="w-3 h-3 bg-yellow-500"></div>
                      <div className="w-3 h-3 bg-green-500"></div>
                    </div>
                    <span className="text-gray-400 text-sm">no-tickets-found</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                  </div>
                </div>
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-lg mb-4">No tickets found in your wallet</div>
                  <div className="text-gray-500 text-sm mb-8">Purchase tickets from the events page to get started</div>
                  <Link href="/events" className="group relative cursor-pointer inline-block">
                    <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white"></div>
                    <div className="relative border border-white bg-white text-black font-bold px-8 py-4 text-lg transition-all duration-300 group-hover:bg-gray-100 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">🎫</span>
                        <span>Buy Tickets</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="group relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                    <div className={`relative bg-black border p-6 h-full flex flex-col justify-between transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10 ${ticket.used
                      ? 'border-red-700 hover:border-red-500'
                      : 'border-gray-700 hover:border-white'
                      }`}>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-white group-hover:text-gray-100">{ticket.event.name}</h3>
                          <span className={`text-xs font-mono px-2 py-1 ${ticket.used
                            ? 'bg-red-900 text-red-400 border border-red-700'
                            : 'bg-green-900 text-green-400 border border-green-700'
                            }`}>
                            {ticket.used ? 'USED' : 'ACTIVE'}
                          </span>
                        </div>

                        <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                          {ticket.event.description}
                        </p>

                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-gray-500">ASA ID:</span>
                            <span className="text-white">{ticket.assetId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Quantity:</span>
                            <span className="text-white">{ticket.amount}</span>
                          </div>
                          {ticket.used && ticket.usedAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Used:</span>
                              <span className="text-white">{new Date(ticket.usedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-800">
                        {!ticket.used ? (
                          <button
                            onClick={() => handleShowQR(ticket)}
                            className="w-full bg-white text-black font-bold py-3 px-4 transition-all duration-300 hover:bg-gray-100"
                          >
                            Generate QR Code
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-700 text-gray-400 font-bold py-3 px-4 cursor-not-allowed"
                          >
                            Ticket Used
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
