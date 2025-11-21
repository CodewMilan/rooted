'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRDisplayProps {
  walletAddress: string
  eventId: string
  onError?: (error: string) => void
}

export default function QRDisplay({ walletAddress, eventId, onError }: QRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<number>(20)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            reject(new Error('Location access denied. Please enable location permissions in your browser settings to generate QR codes.'))
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            reject(new Error('Location information unavailable. Please check your device settings.'))
          } else if (error.code === error.TIMEOUT) {
            reject(new Error('Location request timed out. Please try again.'))
          } else {
            reject(new Error(`Location error: ${error.message}`))
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }

  const generateQRCode = async () => {
    try {
      setIsGenerating(true)
      setError('')

      // Get user's current location
      let location
      try {
        location = await getUserLocation()
      } catch (locationError) {
        throw locationError
      }

      // Call API to generate QR token
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress,
          eventId,
          userLat: location.lat,
          userLng: location.lng
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code')
      }

      // Generate QR code image from payload
      const qrString = JSON.stringify(data.qrPayload)
      const qrDataUrl = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      setQrDataUrl(qrDataUrl)
      setTimeLeft(20) // Reset timer to 20 seconds

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    // Generate initial QR code
    generateQRCode()

    // Set up refresh interval
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateQRCode()
          return 20
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [walletAddress, eventId])

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-red-950 border border-red-700 p-6 mb-4">
          <div className="text-red-400 text-lg mb-4">❌ QR Generation Failed</div>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={generateQRCode}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        {isGenerating ? (
          <div className="bg-gray-900 border border-gray-700 p-12 mb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white text-lg">Generating QR Code...</span>
            </div>
            <div className="text-gray-400 text-sm">Validating location and ticket ownership...</div>
          </div>
        ) : qrDataUrl ? (
          <div className="bg-white p-8 inline-block border-4 border-gray-300">
            <img src={qrDataUrl} alt="Entry QR Code" className="w-64 h-64 mx-auto" />
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 p-12 mb-4">
            <div className="text-gray-400 text-lg">QR Code will appear here</div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-center gap-4 mb-3">
          <span className="text-gray-400 text-sm">Refreshes in:</span>
          <span className="text-white text-xl font-bold font-mono">{timeLeft}s</span>
        </div>
        <div className="w-full bg-gray-800 h-2">
          <div
            className="bg-white h-2 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 20) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="text-gray-400 text-sm space-y-2">
        <p>• Show this QR code to the scanner at the venue entrance</p>
        <p>• Code refreshes every 20 seconds for security</p>
        <p>• Must be within venue radius to generate</p>
      </div>
    </div>
  )
}
