import CryptoJS from 'crypto-js'

const HMAC_SECRET = process.env.HMAC_SECRET_FOR_QR_TOKENS!

export interface QRPayload {
  walletAddress: string
  eventId: string
  token: string
  expires: number
}

export function generateQRToken(
  walletAddress: string,
  eventId: string,
  timeWindow: number = 20000 // 20 seconds in milliseconds
): QRPayload {
  const now = Date.now()
  const expires = now + timeWindow
  
  // Create HMAC token with wallet, event, and time window
  const data = `${walletAddress}:${eventId}:${Math.floor(expires / timeWindow)}`
  const token = CryptoJS.HmacSHA256(data, HMAC_SECRET).toString()
  
  return {
    walletAddress,
    eventId,
    token,
    expires
  }
}

export function validateQRToken(
  payload: QRPayload,
  timeWindow: number = 20000 // 20 seconds in milliseconds
): boolean {
  const now = Date.now()
  
  // Check if token has expired
  if (now > payload.expires) {
    return false
  }
  
  // Recreate the expected token
  const timeSlot = Math.floor(payload.expires / timeWindow)
  const data = `${payload.walletAddress}:${payload.eventId}:${timeSlot}`
  const expectedToken = CryptoJS.HmacSHA256(data, HMAC_SECRET).toString()
  
  // Compare tokens
  return payload.token === expectedToken
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Haversine formula for calculating distance between two points
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c // Distance in meters
}

export function isWithinGeofence(
  userLat: number,
  userLng: number,
  venueLat: number,
  venueLng: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLat, userLng, venueLat, venueLng)
  return distance <= radiusMeters
}
