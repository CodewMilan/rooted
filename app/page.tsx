'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      {/* Matrix background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-25 gap-1 h-full">
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} className="text-gray-500 text-xs animate-pulse">
              🎫
            </div>
          ))}
        </div>
      </div>

      {/* Hero section */}
      <section className="relative px-6 py-20 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-8">
              <pre className="text-white text-lg lg:text-xl font-bold leading-none inline-block">
{`
 █████╗ ██╗   ██╗████████╗██╗  ██╗███████╗███╗   ██╗████████╗██╗██╗  ██╗
██╔══██╗██║   ██║╚══██╔══╝██║  ██║██╔════╝████╗  ██║╚══██╔══╝██║╚██╗██╔╝
███████║██║   ██║   ██║   ███████║█████╗  ██╔██╗ ██║   ██║   ██║ ╚███╔╝ 
██╔══██║██║   ██║   ██║   ██╔══██║██╔══╝  ██║╚██╗██║   ██║   ██║ ██╔██╗ 
██║  ██║╚██████╔╝   ██║   ██║  ██║███████╗██║ ╚████║   ██║   ██║██╔╝ ██╗
╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═╝
`}
              </pre>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Smart Ticketing on <span className="text-gray-400 animate-pulse">Algorand</span>,
              <br />
              Secured by{" "}
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Blockchain</span>.
          </h1>

            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Revolutionary event ticketing system using Algorand ASAs, dynamic QR codes, and geofencing. 
              Anti-resell protection built-in. Powered by Pera Wallet integration.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/events" className="group relative cursor-pointer w-full sm:w-auto">
                <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
                <div className="relative border border-white bg-white text-black font-bold px-6 sm:px-10 py-4 text-base sm:text-lg transition-all duration-300 group-hover:bg-gray-100 group-hover:text-black transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 text-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-gray-600 text-sm sm:text-base">🎫</span>
                    <span className="text-sm sm:text-base">Buy Tickets</span>
                  </div>
                </div>
              </Link>

              <Link href="/scanner" className="group relative cursor-pointer w-full sm:w-auto">
                <div className="absolute inset-0 border-2 border-dashed border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
                <div className="relative border-2 border-dashed border-gray-400 bg-transparent text-white font-bold px-10 py-4 text-lg transition-all duration-300 group-hover:border-white group-hover:bg-gray-900/30 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">📱</span>
                    <span>Scan Tickets</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Features showcase */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                  </div>
                  <span className="text-gray-400 text-sm">authentix-system</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-xs">LIVE</span>
                </div>
              </div>

              <div className="p-6 min-h-[300px] bg-black">
                <div className="space-y-3 text-sm">
                  <div className="text-green-400">✅ Algorand ASA-based tickets</div>
                  <div className="text-green-400">✅ Dynamic QR codes (20s refresh)</div>
                  <div className="text-green-400">✅ Geofencing protection</div>
                  <div className="text-green-400">✅ Anti-resell mechanisms</div>
                  <div className="text-green-400">✅ Pera Wallet integration</div>
                  <div className="text-green-400">✅ Real-time verification</div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <div className="text-gray-400 mb-2">System Status:</div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Network:</span>
                        <span className="text-white">Algorand TestNet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tickets Issued:</span>
                        <span className="text-white">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Events Active:</span>
                        <span className="text-white">1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Security:</span>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="px-6 py-20 lg:px-12 border-t border-gray-800 bg-gray-950/30">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">How AuthenTIX Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Secure, transparent, and fraud-proof ticketing using Algorand blockchain technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-gray-800">
                      <span className="text-lg font-mono text-white group-hover:text-gray-100">01</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Purchase</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Connect Pera Wallet and buy tickets using Algorand ASAs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-gray-800">
                      <span className="text-lg font-mono text-white group-hover:text-gray-100">02</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Generate QR</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      At venue, generate dynamic QR codes with geofencing validation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative h-full md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-gray-800">
                      <span className="text-lg font-mono text-white group-hover:text-gray-100">03</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Verify Entry</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Scanner validates ownership and marks ticket as used
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Link href="/events" className="group relative cursor-pointer inline-block w-full sm:w-auto">
              <div className="absolute inset-0 border-2 border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
              <div className="relative border-2 border-white bg-white text-black font-bold px-8 sm:px-16 py-4 sm:py-5 text-lg sm:text-xl transition-all duration-300 group-hover:bg-gray-100 group-hover:text-black transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 text-center">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-gray-600 text-base sm:text-lg">🎫</span>
                  <span className="text-base sm:text-lg">Start Using AuthenTIX</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-12 lg:px-12 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-gray-600 text-lg mb-4">Built on Algorand. Secured by blockchain.</div>
            <div className="text-gray-700 text-sm">© 2025 AuthenTIX. Smart ticketing for the future.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}