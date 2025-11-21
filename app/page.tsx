'use client'

import { useEffect, useState } from "react"
import Link from 'next/link'

export default function Home() {
  const [currentCommand, setCurrentCommand] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [matrixChars, setMatrixChars] = useState<string[]>([])
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [currentTyping, setCurrentTyping] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const commands = [
    "npm run create:asa",
    "authentix connect --pera-wallet",
    "authentix generate-qr --geofence",
    "authentix scan --verify --blockchain",
  ]

  const terminalSequences = [
    {
      command: "npm run create:asa",
      outputs: [
        "🎫 Creating AuthenTIX ASA...",
        "🔗 Connecting to Algorand TestNet...",
        "🏗️  Minting 1000 tickets...",
        "✅ ASA created successfully!",
      ],
    },
    {
      command: "authentix connect --pera-wallet",
      outputs: [
        "🔐 Initializing Pera Wallet...",
        "📱 Connecting to wallet...",
        "🛡️  Verifying permissions...",
        "✨ Wallet connected!",
      ],
    },
    {
      command: "authentix generate-qr --geofence",
      outputs: [
        "📍 Checking venue location...",
        "🔒 Generating secure QR token...",
        "⏱️  Setting 20-second expiry...",
        "🎯 QR code ready for scanning!",
      ],
    },
    {
      command: "authentix scan --verify --blockchain",
      outputs: [
        "📱 Starting ticket scanner...",
        "🔍 Verifying ASA ownership...",
        "🛡️  Checking anti-resell status...",
        "🎉 Entry granted!",
      ],
    },
  ]

  const heroAsciiText = ` █████╗ ██╗   ██╗████████╗██╗  ██╗███████╗███╗   ██╗████████╗██╗██╗  ██╗
██╔══██╗██║   ██║╚══██╔══╝██║  ██║██╔════╝████╗  ██║╚══██╔══╝██║╚██╗██╔╝
███████║██║   ██║   ██║   ███████║█████╗  ██╔██╗ ██║   ██║   ██║ ╚███╔╝ 
██╔══██║██║   ██║   ██║   ██╔══██║██╔══╝  ██║╚██╗██║   ██║   ██║ ██╔██╗ 
██║  ██║╚██████╔╝   ██║   ██║  ██║███████╗██║ ╚████║   ██║   ██║██╔╝ ██╗
╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═╝`

  useEffect(() => {
    const chars = "AUTHENTIX🎫🔗🛡️📱⚡█▓▒░▄▀■□▪▫".split("")
    const newMatrixChars = Array.from({ length: 100 }, () => chars[Math.floor(Math.random() * chars.length)])
    setMatrixChars(newMatrixChars)

    const interval = setInterval(() => {
      setMatrixChars((prev) => prev.map(() => chars[Math.floor(Math.random() * chars.length)]))
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const sequence = terminalSequences[currentCommand]
    const timeouts: NodeJS.Timeout[] = []

    const runSequence = async () => {
      setTerminalLines([])
      setCurrentTyping("")
      setIsExecuting(false)

      const command = sequence.command
      for (let i = 0; i <= command.length; i++) {
        timeouts.push(
          setTimeout(() => {
            setCurrentTyping(command.slice(0, i))
          }, i * 50),
        )
      }

      timeouts.push(
        setTimeout(
          () => {
            setIsExecuting(true)
            setCurrentTyping("")
            setTerminalLines((prev) => [...prev, `user@authentix:~/project$ ${command}`])
          },
          command.length * 50 + 500,
        ),
      )

      sequence.outputs.forEach((output, index) => {
        timeouts.push(
          setTimeout(
            () => {
              setTerminalLines((prev) => [...prev, output])
            },
            command.length * 50 + 1000 + index * 800,
          ),
        )
      })

      timeouts.push(
        setTimeout(
          () => {
            setCurrentCommand((prev) => (prev + 1) % commands.length)
          },
          command.length * 50 + 1000 + sequence.outputs.length * 800 + 2000,
        ),
      )
    }

    runSequence()

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [currentCommand])

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      {/* Matrix background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-25 gap-1 h-full">
          {matrixChars.map((char, i) => (
            <div key={i} className="text-gray-500 text-xs animate-pulse">
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* Hero section */}
      <section className="relative px-6 py-20 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-8">
              <pre className="text-white text-lg lg:text-xl font-bold leading-none inline-block">{heroAsciiText}</pre>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Built to help you <span className="text-gray-400 animate-pulse">ticket</span>,
              <br />
              right from your{" "}
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">blockchain</span>.
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Revolutionary event ticketing on Algorand. Dynamic QR codes, geofencing, and anti-resell protection. 
              Full control from your terminal.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div
                className="group relative cursor-pointer w-full sm:w-auto"
                onClick={() => copyToClipboard("npm run create:asa", "hero-install")}
              >
                <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
                <div className="relative border border-white bg-white text-black font-bold px-6 sm:px-10 py-4 text-base sm:text-lg transition-all duration-300 group-hover:bg-gray-100 group-hover:text-black transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 text-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {copiedStates["hero-install"] ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-600">📋</span>
                    )}
                    <span className="text-gray-600 text-sm sm:text-base">$</span>
                    <span className="text-sm sm:text-base">npm run create:asa</span>
                  </div>
                </div>
              </div>

              <Link href="/events" className="group relative cursor-pointer w-full sm:w-auto">
                <div className="absolute inset-0 border-2 border-dashed border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
                <div className="relative border-2 border-dashed border-gray-400 bg-transparent text-white font-bold px-10 py-4 text-lg transition-all duration-300 group-hover:border-white group-hover:bg-gray-900/30 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">🎫</span>
                    <span>View Events</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Terminal showcase */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                  </div>
                  <span className="text-gray-400 text-sm">authentix-terminal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-xs">LIVE</span>
                </div>
              </div>

              <div className="p-6 min-h-[300px] bg-black">
                <div className="space-y-2 text-sm">
                  {terminalLines.map((line, index) => (
                    <div
                      key={index}
                      className={`${line.startsWith("user@authentix") ? "text-white" : "text-gray-300"} ${line.includes("✅") || line.includes("✨") || line.includes("🎉") ? "text-green-400" : ""}`}
                    >
                      {line}
                    </div>
                  ))}

                  {!isExecuting && (
                    <div className="text-white">
                      <span className="text-green-400">user@authentix</span>
                      <span className="text-gray-500">:</span>
                      <span className="text-blue-400">~/project</span>
                      <span className="text-white">$ </span>
                      <span className="text-white">{currentTyping}</span>
                      <span className={`text-white ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity`}>
                        █
                      </span>
                    </div>
                  )}

                  {isExecuting && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs">Processing...</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Commands executed:</span>
                    <span className="text-white">{currentCommand + 1}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Blockchain:</span>
                    <span className="text-gray-500">Algorand TestNet</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-gray-500">{isExecuting ? "Running" : "Ready"}</span>
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
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to ticket smarter?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Create ASAs, generate QR codes, and verify tickets. All secured by Algorand blockchain technology.
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
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Create ASA</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Generate Algorand Standard Assets for your event tickets
                    </p>
                  </div>
                  <div
                    className="bg-gray-900 border border-gray-700 p-2.5 font-mono text-xs text-left group-hover:border-gray-500 transition-colors group-hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                    onClick={() => copyToClipboard("npm run create:asa", "create-cmd")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$ </span>
                      <span className="text-white group-hover:text-gray-100">npm run create:asa</span>
                    </div>
                    {copiedStates["create-cmd"] ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-400 hover:text-white transition-colors">📋</span>
                    )}
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
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Buy Tickets</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Purchase tickets using Pera Wallet and Algorand blockchain
                    </p>
                  </div>
                  <Link href="/events" className="bg-gray-900 border border-gray-700 p-2.5 font-mono text-xs text-left group-hover:border-gray-500 transition-colors group-hover:bg-gray-800 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">→ </span>
                      <span className="text-white group-hover:text-gray-100">View Events</span>
                    </div>
                  </Link>
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
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Scan & Verify</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Generate QR codes and verify entry with blockchain validation
                    </p>
                  </div>
                  <Link href="/scanner" className="bg-gray-900 border border-gray-700 p-2.5 font-mono text-xs text-left group-hover:border-gray-500 transition-colors group-hover:bg-gray-800 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📱 </span>
                      <span className="text-white group-hover:text-gray-100">Open Scanner</span>
                    </div>
                  </Link>
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
                  <span className="text-base sm:text-lg">Get Started Now</span>
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