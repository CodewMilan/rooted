'use client'

import { useState, useEffect } from 'react'
import { PeraWalletConnect } from '@perawallet/connect'

const peraWallet = new PeraWalletConnect({
  chainId: parseInt(process.env.NEXT_PUBLIC_ALGORAND_CHAIN_ID || '416002')
})

interface WalletConnectButtonProps {
  onConnect?: (accounts: string[]) => void
  onDisconnect?: () => void
}

export default function WalletConnectButton({ onConnect, onDisconnect }: WalletConnectButtonProps) {
  const [accountAddress, setAccountAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Reconnect to session if it exists
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        if (accounts.length > 0) {
          setAccountAddress(accounts[0])
          onConnect?.(accounts)
        }
      })
      .catch((error) => {
        console.log('No existing session:', error)
      })
  }, [onConnect])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      const accounts = await peraWallet.connect()
      
      if (accounts.length > 0) {
        setAccountAddress(accounts[0])
        onConnect?.(accounts)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    peraWallet.disconnect()
    setAccountAddress(null)
    onDisconnect?.()
  }

  if (accountAddress) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-label">Connected:</span>
          <span className="wallet-address">
            {accountAddress.slice(0, 8)}...{accountAddress.slice(-8)}
          </span>
        </div>
        <button 
          onClick={handleDisconnect}
          className="disconnect-btn"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={isConnecting}
      className="connect-btn"
    >
      {isConnecting ? 'Connecting...' : 'Connect Pera Wallet'}
    </button>
  )
}

// Export peraWallet instance for use in other components
export { peraWallet }
