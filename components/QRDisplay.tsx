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
          reject(new Error(`Location error: ${error.message}`))
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
      const location = await getUserLocation()

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
      setTimeLeft(20) // Reset timer

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
      <div className="qr-error">
        <p className="error-message">{error}</p>
        <button onClick={generateQRCode} className="retry-btn">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="qr-display">
      <div className="qr-container">
        {isGenerating ? (
          <div className="qr-loading">
            <div className="loading-spinner"></div>
            <p>Generating QR Code...</p>
          </div>
        ) : qrDataUrl ? (
          <img src={qrDataUrl} alt="Entry QR Code" className="qr-image" />
        ) : (
          <div className="qr-placeholder">
            <p>QR Code will appear here</p>
          </div>
        )}
      </div>
      
      <div className="qr-timer">
        <p>Refreshes in: <span className="timer-count">{timeLeft}s</span></p>
        <div className="timer-bar">
          <div 
            className="timer-progress" 
            style={{ width: `${(timeLeft / 20) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="qr-instructions">
        <p>Show this QR code to the scanner at the venue entrance.</p>
        <p>The code refreshes every 20 seconds for security.</p>
      </div>
    </div>
  )
}
