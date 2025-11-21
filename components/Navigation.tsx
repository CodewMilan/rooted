'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/tickets', label: 'My Tickets' },
    { href: '/scanner', label: 'Scanner' }
  ]

  return (
    <nav className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm p-4 relative z-10 sticky top-0">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">AuthenTIX</span>
              <span className="text-gray-400 text-sm">Algorand</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors cursor-pointer relative group ${
                  pathname === item.href 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                <div className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                  pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>TestNet</span>
          </div>

          <div className="group relative cursor-pointer">
            <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
            <div className="relative border border-gray-400 bg-transparent text-white font-medium px-6 py-2 text-sm transition-all duration-300 group-hover:border-white group-hover:bg-gray-900/30 transform translate-x-0.5 translate-y-0.5 group-hover:translate-x-0 group-hover:translate-y-0">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🎫</span>
                <span>Smart Tickets</span>
              </div>
            </div>
          </div>

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
