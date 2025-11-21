"use client"

import { useEffect, useState } from "react"
import { Copy, Check } from "lucide-react"

export default function TerminalIDE() {
  const [currentCommand, setCurrentCommand] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [matrixChars, setMatrixChars] = useState<string[]>([])
  const [animatedBoxes, setAnimatedBoxes] = useState<boolean[]>([])
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [currentTyping, setCurrentTyping] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStep, setExecutionStep] = useState(0)
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
    "hexa-cli init --ai-powered",
    "hexa-cli generate --model gpt-5 --context full",
    "hexa-cli review --agent claude-4 --interactive",
    "hexa-cli deploy --env production --optimize",
  ]

  const terminalSequences = [
    {
      command: "hexa-cli init --ai-powered",
      outputs: [
        "🚀 Initializing HEXA CLI project...",
        "📦 Installing dependencies...",
        "🤖 Configuring AI models...",
        "✅ Project initialized successfully!",
      ],
    },
    {
      command: "hexa-cli generate --model gpt-5 --context full",
      outputs: [
        "🧠 Loading GPT-5 model...",
        "📊 Analyzing codebase context...",
        "⚡ Generating optimized code...",
        "✨ Code generation complete!",
      ],
    },
    {
      command: "hexa-cli review --agent claude-4 --interactive",
      outputs: [
        "👁️  Starting interactive review...",
        "🔍 Claude-4 analyzing changes...",
        "💡 Suggesting improvements...",
        "🎯 Review session active!",
      ],
    },
    {
      command: "hexa-cli deploy --env production --optimize",
      outputs: [
        "🏗️  Building for production...",
        "⚡ Optimizing bundle size...",
        "🌐 Deploying to production...",
        "🎉 Deployment successful!",
      ],
    },
  ]

  const heroAsciiText = `██╗  ██╗███████╗██╗  ██╗ █████╗     ██████╗██╗     ██╗
██║  ██║██╔════╝╚██╗██╔╝██╔══██╗   ██╔════╝██║     ██║
███████║█████╗   ╚███╔╝ ███████║   ██║     ██║     ██║
██╔══██║██╔══╝   ██╔██╗ ██╔══██║   ██║     ██║     ██║
██║  ██║███████╗██╔╝ ██╗██║  ██║   ╚██████╗███████╗██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═════╝╚══════╝╚═╝`

  useEffect(() => {
    const chars = "HEXACLI01010101ABCDEF█▓▒░▄▀■□▪▫".split("")
    const newMatrixChars = Array.from({ length: 100 }, () => chars[Math.floor(Math.random() * chars.length)])
    setMatrixChars(newMatrixChars)

    const interval = setInterval(() => {
      setMatrixChars((prev) => prev.map(() => chars[Math.floor(Math.random() * chars.length)]))
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const boxes = Array.from({ length: 6 }, () => Math.random() > 0.5)
    setAnimatedBoxes(boxes)

    const interval = setInterval(() => {
      setAnimatedBoxes((prev) => prev.map(() => Math.random() > 0.3))
    }, 2000)

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
      setExecutionStep(0)

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
            setTerminalLines((prev) => [...prev, `user@dev:~/project$ ${command}`])
          },
          command.length * 50 + 500,
        ),
      )

      sequence.outputs.forEach((output, index) => {
        timeouts.push(
          setTimeout(
            () => {
              setExecutionStep(index + 1)
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
      {/* ... existing nav code ... */}
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
                <span className="text-white font-bold text-lg">HEXA</span>
                <span className="text-gray-400 text-sm">CLI</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8 ml-8">
              <a
                href="#features"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
              >
                <span>Features</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a
                href="#models"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
              >
                <span>AI Models</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a
                href="#integrations"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
              >
                <span>Integrations</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a
                href="/docs"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
              >
                <span>Docs</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>v2.1.0</span>
            </div>

            <div
              className="group relative cursor-pointer"
              onClick={() => copyToClipboard("npm install -g hexa-cli", "nav-install")}
            >
              <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
              <div className="relative border border-gray-400 bg-transparent text-white font-medium px-6 py-2 text-sm transition-all duration-300 group-hover:border-white group-hover:bg-gray-900/30 transform translate-x-0.5 translate-y-0.5 group-hover:translate-x-0 group-hover:translate-y-0">
                <div className="flex items-center gap-2">
                  {copiedStates["nav-install"] ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-gray-400">$</span>
                  <span>Install</span>
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

      {/* ... existing matrix background ... */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-25 gap-1 h-full">
          {matrixChars.map((char, i) => (
            <div key={i} className="text-gray-500 text-xs animate-pulse">
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* ... existing hero section ... */}
      <section className="relative px-6 py-20 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-8">
              <pre className="text-white text-lg lg:text-xl font-bold leading-none inline-block">{heroAsciiText}</pre>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Built to help you <span className="text-gray-400 animate-pulse">ship</span>,
              <br />
              right from your{" "}
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">terminal</span>.
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Use it in your IDE or any terminal. Same commands, any environment. Plug into your setup anywhere. Full
              control from your terminal.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div
                className="group relative cursor-pointer w-full sm:w-auto"
                onClick={() => copyToClipboard("npm install -g hexa-cli", "hero-install")}
              >
                <div className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
                <div className="relative border border-white bg-white text-black font-bold px-6 sm:px-10 py-4 text-base sm:text-lg transition-all duration-300 group-hover:bg-gray-100 group-hover:text-black transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 text-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {copiedStates["hero-install"] ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    )}
                    <span className="text-gray-600 text-sm sm:text-base">$</span>
                    <span className="text-sm sm:text-base">npm install -g hexa-cli</span>
                  </div>
                </div>
              </div>

              <a href="/docs" className="group relative cursor-pointer w-full sm:w-auto">
                <div className="absolute inset-0 border-2 border-dashed border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
                <div className="relative border-2 border-dashed border-gray-400 bg-transparent text-white font-bold px-10 py-4 text-lg transition-all duration-300 group-hover:border-white group-hover:bg-gray-900/30 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">→</span>
                    <span>View Documentation</span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* ... existing terminal section ... */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-950 border border-gray-700 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                  </div>
                  <span className="text-gray-400 text-sm">hexa-terminal</span>
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
                      className={`${line.startsWith("user@dev") ? "text-white" : "text-gray-300"} ${line.includes("✅") || line.includes("✨") || line.includes("🎉") ? "text-green-400" : ""}`}
                    >
                      {line}
                    </div>
                  ))}

                  {!isExecuting && (
                    <div className="text-white">
                      <span className="text-green-400">user@dev</span>
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
                    <span className="text-gray-500">AI Models:</span>
                    <span className="text-gray-500">Active</span>
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

      {/* ... existing integrations section ... */}
      <section className="px-6 py-16 lg:px-12 border-t border-gray-800" id="integrations">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Universal IDE Support</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              HEXA CLI works everywhere. One installation, infinite possibilities.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-950 border border-gray-800 shadow-xl">
              <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500"></div>
                    <div className="w-3 h-3 bg-yellow-500"></div>
                    <div className="w-3 h-3 bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-sm">hexa-cli ide --list</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-xs">ALL SUPPORTED</span>
                </div>
              </div>

              <div className="p-6 bg-black">
                <div className="text-sm text-gray-400 mb-4">$ hexa-cli ide --scan</div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm mb-6">
                  {[
                    { name: "cursor", status: "✓", desc: "AI-powered editor" },
                    { name: "vscode", status: "✓", desc: "Microsoft VS Code" },
                    { name: "jetbrains", status: "✓", desc: "IntelliJ family" },
                    { name: "android-studio", status: "✓", desc: "Android development" },
                    { name: "vim/neovim", status: "✓", desc: "Terminal editors" },
                    { name: "intellij", status: "✓", desc: "Java development" },
                  ].map((ide) => (
                    <div
                      key={ide.name}
                      className="flex items-center justify-between py-2 px-3 hover:bg-gray-900 cursor-pointer group transition-all duration-200 border border-transparent hover:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 group-hover:text-white transition-colors w-4">
                          {ide.status}
                        </span>
                        <span className="text-white group-hover:text-gray-200 transition-colors">{ide.name}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 text-xs">
                        {ide.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-sm text-gray-400">
                      <div className="font-mono text-xs text-gray-500 space-y-1">
                        <div>$ hexa-cli ide --install-all # Setup all IDEs</div>
                        <div>$ hexa-cli ide --status # Check integration</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>6 Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Zero config</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-green-400">●</span>
                <span>Universal compatibility • Instant setup • Works everywhere</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ... existing models section ... */}
      <section className="px-6 py-20 lg:px-12 border-t border-gray-800" id="models">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Latest AI Models</h2>
            <p className="text-xl text-gray-400">Select your preferred AI model from the terminal</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-950 border border-gray-800 shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500"></div>
                    <div className="w-3 h-3 bg-yellow-500"></div>
                    <div className="w-3 h-3 bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-sm">hexa-cli model select</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 text-xs">6 AVAILABLE</span>
                </div>
              </div>

              <div className="p-6 bg-black">
                <div className="text-sm text-gray-400 mb-4">$ hexa-cli model --list</div>

                <div className="space-y-2 font-mono text-sm">
                  {[
                    { id: "1", name: "gpt-5", provider: "openai", status: "●", color: "text-green-400" },
                    { id: "2", name: "claude-4-sonnet", provider: "anthropic", status: "●", color: "text-green-400" },
                    { id: "3", name: "claude-4.1-opus", provider: "anthropic", status: "●", color: "text-green-400" },
                    { id: "4", name: "o3", provider: "openai", status: "●", color: "text-green-400" },
                    { id: "5", name: "gemini-2.5-pro", provider: "google", status: "●", color: "text-green-400" },
                    { id: "6", name: "grok-4", provider: "xai", status: "●", color: "text-green-400" },
                  ].map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between py-2 px-4 hover:bg-gray-900 cursor-pointer group transition-all duration-200 border border-transparent hover:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 w-6">[{model.id}]</span>
                        <span className={`${model.color} group-hover:text-white transition-colors`}>
                          {model.status}
                        </span>
                        <span className="text-white group-hover:text-gray-200 transition-colors">{model.name}</span>
                        <span className="text-gray-500 text-xs">({model.provider})</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 text-xs">
                        Press {model.id} to select
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-sm text-gray-400">
                      <div className="mb-2">Usage:</div>
                      <div className="font-mono text-xs text-gray-500 space-y-1">
                        <div>$ hexa-cli generate --model gpt-5 "Create a React component"</div>
                        <div>$ hexa-cli model set claude-4-sonnet # Set as default</div>
                        <div>$ hexa-cli model status # Check model availability</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>4 Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>2 Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <span>Auto-sync enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-green-400">●</span>
                <span>Models auto-updated • Zero configuration required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-12 border-t border-gray-800 bg-gray-950/30" id="docs">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to ship faster?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Write powerful scripts and automations. Automatically update docs, trigger security reviews, or build
              custom coding agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)] bg-[length:4px_4px]">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-gray-800">
                      <span className="text-lg font-mono text-white group-hover:text-gray-100">01</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Initialize</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Start new AI-powered projects with zero configuration
                    </p>
                  </div>
                  <div
                    className="bg-gray-900 border border-gray-700 p-2.5 font-mono text-xs text-left group-hover:border-gray-500 transition-colors group-hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                    onClick={() => copyToClipboard("hexa-cli init", "init-cmd")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$ </span>
                      <span className="text-white group-hover:text-gray-100">hexa-cli init</span>
                    </div>
                    {copiedStates["init-cmd"] ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)] bg-[length:4px_4px]">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-gray-800">
                      <span className="text-lg font-mono text-white group-hover:text-gray-100">02</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Generate</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Create code with cutting-edge AI models instantly
                    </p>
                  </div>
                  <div
                    className="bg-gray-900 border border-gray-700 p-2.5 font-mono text-xs text-left group-hover:border-gray-500 transition-colors group-hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                    onClick={() => copyToClipboard("hexa-cli generate", "generate-cmd")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$ </span>
                      <span className="text-white group-hover:text-gray-100">hexa-cli generate</span>
                    </div>
                    {copiedStates["generate-cmd"] ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative h-full md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
              <div className="relative bg-black border border-gray-700 p-6 h-full flex flex-col justify-between hover:border-white transition-all duration-300 group-hover:shadow-xl group-hover:shadow-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)] bg-[length:4px_4px]">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-gray-800">
                      <span className="text-lg font-mono text-white group-hover:text-gray-100">03</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-gray-100">Deploy</h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 text-sm leading-relaxed">
                      Ship to production with automated optimization
                    </p>
                  </div>
                  <div
                    className="bg-gray-900 border border-gray-700 p-2.5 font-mono text-xs text-left group-hover:border-gray-500 transition-colors group-hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                    onClick={() => copyToClipboard("hexa-cli deploy", "deploy-cmd")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$ </span>
                      <span className="text-white group-hover:text-gray-100">hexa-cli deploy</span>
                    </div>
                    {copiedStates["deploy-cmd"] ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="group relative cursor-pointer inline-block w-full sm:w-auto">
              <div className="absolute inset-0 border-2 border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/20"></div>
              <div className="relative border-2 border-white bg-white text-black font-bold px-8 sm:px-16 py-4 sm:py-5 text-lg sm:text-xl transition-all duration-300 group-hover:bg-gray-100 group-hover:text-black transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 text-center">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-gray-600 text-base sm:text-lg">▶</span>
                  <span className="text-base sm:text-lg">Get Started Now</span>
                </div>
              </div>
            </div>

            <div
              className="text-gray-400 text-base sm:text-lg font-mono hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 hover:bg-gray-900/30 rounded-none border border-transparent hover:border-gray-700"
              onClick={() => copyToClipboard("npm install -g hexa-cli", "bottom-install")}
            >
              {copiedStates["bottom-install"] ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              ) : (
                <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white transition-colors flex-shrink-0" />
              )}
              <span className="break-all sm:break-normal">$ npm install -g hexa-cli</span>
            </div>
          </div>
        </div>
      </section>

      {/* ... existing footer ... */}
      <footer className="border-t border-gray-800 px-6 py-12 lg:px-12 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-gray-600 text-lg mb-4">Built for developers, by developers.</div>
            <div className="text-gray-700 text-sm">© 2025 HEXA CLI. Ship faster. Code better.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
