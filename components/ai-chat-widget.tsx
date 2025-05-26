"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, Send, X, MessageCircle, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  context?: any
}

interface AppContext {
  currentPage: string
  route: string
  localStorage: Record<string, any>
  userSession: any
  appData: any
  recentActions: string[]
  timestamp: string
}

// Define SpeechRecognition interface
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const contextRef = useRef<AppContext | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize Speech Recognition
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setInputText(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
          setError("Voice recognition failed. Please try again.")
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      // Initialize Speech Synthesis
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis
      }

      // Initialize with welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        text: "Hello! I'm your NIPCO AI assistant. I'm fully aware of your current app state and can help you with anything related to your fuel station management system. How can I assist you today?",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [])

  // Gather comprehensive app context
  const gatherAppContext = useCallback((): AppContext => {
    const context: AppContext = {
      currentPage: typeof window !== "undefined" ? window.location.pathname : "",
      route: typeof window !== "undefined" ? window.location.href : "",
      localStorage: {},
      userSession: {},
      appData: {},
      recentActions: [],
      timestamp: new Date().toISOString(),
    }

    if (typeof window !== "undefined") {
      // Gather localStorage data
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) {
            context.localStorage[key] = localStorage.getItem(key)
          }
        }
      } catch (e) {
        console.warn("Could not access localStorage:", e)
      }

      // Gather app-specific data based on current page
      if (context.currentPage.includes("/portal/")) {
        const stationId = context.currentPage.split("/portal/")[1]
        context.appData = {
          currentStation: stationId,
          stationData: getStationData(stationId),
          dashboardMetrics: getDashboardMetrics(stationId),
        }
      } else if (context.currentPage.includes("/admin")) {
        context.appData = {
          adminView: true,
          allStationsData: getAllStationsData(),
          systemMetrics: getSystemMetrics(),
        }
      } else if (context.currentPage.includes("/home")) {
        context.appData = {
          homeView: true,
          availableStations: getAvailableStations(),
          systemOverview: getSystemOverview(),
        }
      }

      // Gather visible UI components and user interactions
      context.recentActions = getRecentUserActions()
    }

    contextRef.current = context
    return context
  }, [])

  // Mock data gathering functions (replace with real app data)
  const getStationData = (stationId: string) => ({
    id: stationId,
    name: `NIPCO ${stationId.toUpperCase()}`,
    status: "Active",
    manager: "John Doe",
    revenue: "₦2,450,000",
    tanks: "4/4 Active",
    lastActivity: "2 mins ago",
  })

  const getDashboardMetrics = (stationId: string) => ({
    todaySales: "₦450,000",
    fuelLevel: "85%",
    activeStaff: 12,
    alerts: 2,
  })

  const getAllStationsData = () => [
    { id: "abk-001", name: "NIPCO ABK-001", status: "Active", revenue: "₦2,450,000" },
    { id: "uyo-1-002", name: "NIPCO Uyo 1-002", status: "Active", revenue: "₦1,890,000" },
    { id: "uyo-2-003", name: "NIPCO Uyo 2-003", status: "Active", revenue: "₦2,100,000" },
    { id: "ik-004", name: "NIPCO Ik-004", status: "Active", revenue: "₦1,750,000" },
    { id: "ib-005", name: "NIPCO Ib-005", status: "Active", revenue: "₦2,200,000" },
  ]

  const getSystemMetrics = () => ({
    totalRevenue: "₦10,390,000",
    activeStations: 5,
    totalStaff: 60,
    systemUptime: "99.9%",
  })

  const getAvailableStations = () => 5

  const getSystemOverview = () => ({
    status: "All systems operational",
    lastUpdate: new Date().toISOString(),
  })

  const getRecentUserActions = () => {
    // Track recent user interactions (implement based on your app's needs)
    return ["Viewed dashboard", "Checked station status", "Opened chat"]
  }

  // OpenAI API integration
  const sendToOpenAI = async (userMessage: string, context: AppContext): Promise<string> => {
    try {
      const systemPrompt = `You are an intelligent AI assistant for the NIPCO Fuel Station Management System. You have complete awareness of the current application state and user context.

Current Context:
- Page: ${context.currentPage}
- Route: ${context.route}
- App Data: ${JSON.stringify(context.appData, null, 2)}
- User Session: ${JSON.stringify(context.localStorage, null, 2)}
- Recent Actions: ${context.recentActions.join(", ")}
- Timestamp: ${context.timestamp}

You should provide helpful, contextual responses based on this information. Be specific about the current state when relevant. Help users navigate the system, understand data, and perform tasks efficiently.

User capabilities in this system:
- View and manage multiple fuel stations
- Monitor sales, inventory, and staff
- Access admin dashboard with system-wide metrics
- Generate reports and analytics
- Manage staff and operations

Respond naturally and helpfully, referencing the current context when appropriate.`

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          context: context,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.message || "I apologize, but I couldn't process your request at the moment."
    } catch (error) {
      console.error("OpenAI API Error:", error)
      throw new Error("Failed to get AI response. Please check your connection and try again.")
    }
  }

  // Text-to-speech function
  const speakText = (text: string) => {
    if (synthRef.current && voiceEnabled) {
      // Cancel any ongoing speech
      synthRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)
    }
  }

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const context = gatherAppContext()
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      context: context,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)
    setError(null)

    try {
      const aiResponse = await sendToOpenAI(inputText, context)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(aiResponse)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle voice input
  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      setError("Voice recognition is not supported in your browser")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setError(null)
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Handle voice output toggle
  const handleVoiceOutputToggle = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Real-time context monitoring
  useEffect(() => {
    const handleStorageChange = () => {
      // Update context when localStorage changes
      gatherAppContext()
    }

    const handleLocationChange = () => {
      // Update context when route changes
      gatherAppContext()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("popstate", handleLocationChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("popstate", handleLocationChange)
    }
  }, [gatherAppContext])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-6 py-4 backdrop-blur-sm border border-blue-400/20"
          >
            <div className="relative">
              <MessageCircle className="h-6 w-6" />
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
            </div>
            <span className="font-semibold text-sm whitespace-nowrap">AI Assistant</span>
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px]">
          <Card className="h-full bg-gray-900/95 backdrop-blur-sm border-gray-700/50 shadow-2xl rounded-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">NIPCO AI Assistant</h3>
                    <p className="text-xs opacity-90">Context-aware • GPT-4 powered</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceOutputToggle}
                    className={`text-white hover:bg-white/20 ${voiceEnabled ? "" : "opacity-50"}`}
                    title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
                  >
                    {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        message.isUser ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-center">
                    <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-700/50">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your fuel station system..."
                      className="w-full p-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-32"
                      rows={1}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={handleVoiceToggle}
                    variant="outline"
                    size="sm"
                    className={`border-gray-600 h-11 ${
                      isListening ? "bg-red-500 text-white border-red-500" : "text-gray-400 hover:text-white"
                    }`}
                    disabled={isLoading}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white h-11"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status indicators */}
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="flex items-center gap-4">
                    {isListening && (
                      <span className="text-red-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        Listening...
                      </span>
                    )}
                    {isSpeaking && (
                      <span className="text-blue-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        Speaking...
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">Context: {contextRef.current?.currentPage || "Loading..."}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
