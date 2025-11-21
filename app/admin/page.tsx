'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [asaId, setAsaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdateASA = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!asaId.trim()) {
      setError('Please enter an ASA ID')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/update-asa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: 'EVT1',
          asaId: asaId.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update ASA ID')
      }

      setMessage(`✅ Successfully updated ASA ID to ${asaId}`)
      setAsaId('')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-25 gap-1 h-full">
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} className="text-gray-500 text-xs animate-pulse">⚙️</div>
          ))}
        </div>
      </div>

      <section className="relative px-6 py-20 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Admin <span className="text-gray-400 animate-pulse">Panel</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Update event configuration and ASA IDs
            </p>
          </div>

          <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500"></div>
                  <div className="w-3 h-3 bg-yellow-500"></div>
                  <div className="w-3 h-3 bg-green-500"></div>
                </div>
                <span className="text-gray-400 text-sm">asa-configurator</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-gray-500 text-xs">ADMIN</span>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleUpdateASA} className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    ASA ID for Event EVT1
                  </label>
                  <input
                    type="text"
                    value={asaId}
                    onChange={(e) => setAsaId(e.target.value)}
                    placeholder="Enter ASA ID (e.g., 123456789)"
                    className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 font-mono focus:border-white focus:outline-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-950 border border-red-700 p-4">
                    <span className="text-red-400">❌ {error}</span>
                  </div>
                )}

                {message && (
                  <div className="bg-green-950 border border-green-700 p-4">
                    <span className="text-green-400">{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-bold py-3 px-4 transition-all duration-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update ASA ID'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <h3 className="text-white font-bold mb-4">Instructions:</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>1. Create your ASA on Algorand TestNet</p>
                  <p>2. Copy the ASA ID from the transaction result</p>
                  <p>3. Paste it in the field above and click "Update ASA ID"</p>
                  <p>4. The event will then be ready for ticket purchases</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
