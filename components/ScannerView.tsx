'use client'

import { useState, useRef, useEffect } from 'react'
import jsQR from 'jsqr'

interface ScanResult {
  valid: boolean
  user?: {
    wallet_address: string
    name: string
  }
  event?: {
    name: string
    description: string
  }
  error?: string
  message?: string
}

interface ScannerViewProps {
  onScanResult?: (result: ScanResult) => void
}

export default function ScannerView({ onScanResult }: ScannerViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)
      }
    } catch (err) {
      setError('Failed to access camera. Please allow camera permissions.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const scanQRCode = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || !isScanning) return

    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    
    if (code) {
      handleQRCodeDetected(code.data)
    }
  }

  const handleQRCodeDetected = async (qrData: string) => {
    try {
      setIsScanning(false) // Stop scanning while processing
      
      // Parse QR code data
      const qrPayload = JSON.parse(qrData)
      
      // Get scanner location (optional)
      let scannerLat, scannerLng
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 60000
          })
        })
        scannerLat = position.coords.latitude
        scannerLng = position.coords.longitude
      } catch (err) {
        console.log('Could not get scanner location:', err)
      }

      // Verify ticket with backend
      const response = await fetch('/api/verify-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qrPayload,
          scannerLat,
          scannerLng
        })
      })

      const result = await response.json()
      setScanResult(result)
      onScanResult?.(result)

      // Auto-restart scanning after 3 seconds if invalid
      if (!result.valid) {
        setTimeout(() => {
          setScanResult(null)
          setIsScanning(true)
        }, 3000)
      }

    } catch (err) {
      const errorResult: ScanResult = {
        valid: false,
        error: 'Invalid QR code format'
      }
      setScanResult(errorResult)
      onScanResult?.(errorResult)
      
      // Auto-restart scanning after 2 seconds
      setTimeout(() => {
        setScanResult(null)
        setIsScanning(true)
      }, 2000)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setIsScanning(true)
  }

  useEffect(() => {
    let animationFrame: number

    if (isScanning) {
      const scan = () => {
        scanQRCode()
        animationFrame = requestAnimationFrame(scan)
      }
      animationFrame = requestAnimationFrame(scan)
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isScanning])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (scanResult) {
    return (
      <div className={`scan-result ${scanResult.valid ? 'valid' : 'invalid'}`}>
        <div className="result-content">
          {scanResult.valid ? (
            <>
              <div className="success-icon">✅</div>
              <h2>Valid Ticket</h2>
              <div className="user-info">
                <p><strong>Name:</strong> {scanResult.user?.name}</p>
                <p><strong>Event:</strong> {scanResult.event?.name}</p>
                <p><strong>Wallet:</strong> {scanResult.user?.wallet_address.slice(0, 8)}...{scanResult.user?.wallet_address.slice(-8)}</p>
              </div>
              <p className="success-message">{scanResult.message}</p>
            </>
          ) : (
            <>
              <div className="error-icon">❌</div>
              <h2>Invalid Ticket</h2>
              <p className="error-message">{scanResult.error}</p>
            </>
          )}
        </div>
        
        <button onClick={resetScanner} className="scan-again-btn">
          Scan Another Ticket
        </button>
      </div>
    )
  }

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h2>Ticket Scanner</h2>
        <p>Point camera at QR code to verify ticket</p>
      </div>

      {error && (
        <div className="scanner-error">
          <p>{error}</p>
          <button onClick={startCamera} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        {isScanning && (
          <div className="scan-overlay">
            <div className="scan-frame"></div>
            <p className="scan-instruction">Align QR code within the frame</p>
          </div>
        )}
      </div>

      <div className="scanner-controls">
        {!isScanning && !error ? (
          <button onClick={startCamera} className="start-scan-btn">
            Start Scanning
          </button>
        ) : isScanning ? (
          <button onClick={stopCamera} className="stop-scan-btn">
            Stop Scanning
          </button>
        ) : null}
      </div>
    </div>
  )
}
