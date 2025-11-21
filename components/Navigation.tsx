'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import WalletConnectButton from './WalletConnectButton'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/tickets', label: 'My Tickets' },
    { href: '/scanner', label: 'Scanner' },
    { href: '/profile', label: 'Profile' },
    { href: '/contact', label: 'Contact Us' }
  ]

  return (
    <nav className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm p-4 relative z-10 sticky top-0">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">AuthenTIX</span>
            <span className="text-gray-400 text-sm hidden lg:inline">Algorand</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 absolute left-1/2 transform -translate-x-1/2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors cursor-pointer relative group whitespace-nowrap text-sm lg:text-base ${pathname === item.href
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <span>{item.label}</span>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></div>
            </Link>
          ))}
        </div>

        {/* Right: Wallet Button and TestNet indicator */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>TestNet</span>
          </div>

          <WalletConnectButton />

          <button className="md:hidden text-gray-400 hover:text-white transition-colors">
            <div className="w-6 h-6 flex flex-col justify-center gap-1">
              <div className="w-full h-0.5 bg-current transition-all duration-300"></div>
              <div className="w-full h-0.5 bg-current transition-all duration-300"></div>
              <div className="w-full h-0.5 bg-current transition-all duration-300"></div>
            </div>
          </button>
        </div>
      </div>
    </nav>
  )
}
