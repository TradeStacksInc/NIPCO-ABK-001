"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, Send, X, Volume2, VolumeX, AlertCircle, Settings } from "lucide-react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  context?: any
  error?: boolean
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

interface ApiHealthStatus {
  status: string
  hasApiKey: boolean
  validApiKey: boolean
  message: string
}

// Define SpeechRecognition interface
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export function AIChatWidget() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking" | "config_error">(
    "checking",
  )
  const [apiHealth, setApiHealth] = useState<ApiHealthStatus | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const contextRef = useRef<AppContext | null>(null)

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth()
  }, [])

  const checkApiHealth = async () => {
    try {
      setConnectionStatus("checking")
      const response = await fetch("/api/chat", { method: "GET" })
      if (response.ok) {
        const data: ApiHealthStatus = await response.json()
        setApiHealth(data)

        if (data.validApiKey) {
          setConnectionStatus("connected")
        } else {
          setConnectionStatus("config_error")
        }

        console.log("🔍 API Health Check:", data)
      } else {
        setConnectionStatus("disconnected")
      }
    } catch (error) {
      console.error("❌ API Health Check failed:", error)
      setConnectionStatus("disconnected")
    }
  }

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
        text:
          connectionStatus === "config_error"
            ? "Hello! I'm your NIPCO AI assistant, but I'm currently unable to connect to my AI service due to a configuration issue. I can still help you navigate the system using my offline knowledge!"
            : "Hello! I'm your NIPCO AI assistant. I'm fully aware of your current app state and can help you with anything related to your fuel station management system. How can I assist you today?",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [connectionStatus])

  // Gather comprehensive app context with size limits
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
      // Gather localStorage data (limited to prevent large payloads)
      try {
        const localStorageKeys = []
        for (let i = 0; i < Math.min(localStorage.length, 10); i++) {
          const key = localStorage.key(i)
          if (key && key.length < 50) {
            const value = localStorage.getItem(key)
            if (value && value.length < 200) {
              context.localStorage[key] = value
            }
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

      // Gather recent actions (limited)
      context.recentActions = getRecentUserActions().slice(0, 5)
    }

    contextRef.current = context
    return context
  }, [])

  // Mock data gathering functions
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
    return ["Viewed dashboard", "Checked station status", "Opened chat"]
  }

  // Enhanced OpenAI API integration with proper error handling
  const sendToOpenAI = async (userMessage: string, context: AppContext): Promise<string> => {
    console.log("🚀 Sending message to OpenAI:", { userMessage: userMessage.slice(0, 100) + "..." })

    // Check if API is properly configured
    if (connectionStatus === "config_error") {
      throw new Error("OpenAI API key is not properly configured. Please check your environment variables.")
    }

    try {
      // Validate input
      if (!userMessage || userMessage.trim().length === 0) {
        throw new Error("Message cannot be empty")
      }

      if (userMessage.length > 2000) {
        userMessage = userMessage.slice(0, 2000) + "..."
      }

      // Create system prompt with limited context
      const systemPrompt = `You are an intelligent AI assistant for the NIPCO Fuel Station Management System. You have awareness of the current application state and user context.

Current Context:
- Page: ${context.currentPage}
- App Data: ${JSON.stringify(context.appData).slice(0, 1000)}
- Recent Actions: ${context.recentActions.join(", ")}

You should provide helpful, contextual responses based on this information. Be specific about the current state when relevant. Help users navigate the system, understand data, and perform tasks efficiently.

User capabilities in this system:
- View and manage multiple fuel stations
- Monitor sales, inventory, and staff
- Access admin dashboard with system-wide metrics
- Generate reports and analytics
- Manage staff and operations

Respond naturally and helpfully, referencing the current context when appropriate. Keep responses concise and actionable.`

      const requestPayload = {
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userMessage },
        ],
        context: {
          page: context.currentPage,
          timestamp: context.timestamp,
        },
      }

      console.log("📤 Request payload prepared:", {
        messageCount: requestPayload.messages.length,
        systemPromptLength: systemPrompt.length,
        userMessageLength: userMessage.length,
      })

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      console.log("📡 API response status:", response.status)

      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: "Failed to parse error response" }
        }

        console.error("❌ API request failed:", {
          status: response.status,
          error: errorData,
        })

        // Handle specific error types
        if (response.status === 400) {
          throw new Error(`Invalid request: ${errorData.message || errorData.error || "Bad request"}`)
        } else if (response.status === 401) {
          throw new Error("Authentication failed. Please check API key configuration.")
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.")
        } else if (response.status >= 500) {
          if (errorData.code === "MISSING_API_KEY" || errorData.code === "INVALID_API_KEY") {
            setConnectionStatus("config_error")
            throw new Error(`Configuration Error: ${errorData.message || "OpenAI API key is not properly configured"}`)
          }
          throw new Error(`Server error: ${errorData.message || errorData.error || "Internal server error"}`)
        } else {
          throw new Error(`Request failed with status ${response.status}`)
        }
      }

      const data = await response.json()
      console.log("✅ API response received:", {
        hasMessage: !!data.message,
        messageLength: data.message?.length || 0,
        responseTime: data.responseTime,
        usage: data.usage,
      })

      if (!data.message) {
        throw new Error("No message content in response")
      }

      setConnectionStatus("connected")
      return data.message
    } catch (error) {
      console.error("❌ sendToOpenAI error:", error)
      setConnectionStatus("disconnected")

      // Return context-aware fallback response
      const fallbackResponse = getFallbackResponse(context, userMessage)
      return fallbackResponse
    }
  }

  // Enhanced fallback response function
  const getFallbackResponse = (context: AppContext, userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // API configuration error
    if (connectionStatus === "config_error") {
      return "I'm currently unable to access my AI capabilities due to a configuration issue with the OpenAI API key. However, I can still help you navigate the NIPCO system! Try asking me about specific features or navigation."
    }

    if (lowerMessage.includes("station") || lowerMessage.includes("nipco")) {
      if (context.currentPage.includes("/portal/")) {
        const stationId = context.currentPage.split("/portal/")[1]
        return `I can see you're viewing the ${stationId.toUpperCase()} station portal. You can navigate using the sidebar to access Sales Report, Driver Offload, Tank Offload, Manage Staff, and System Log.`
      }
      return "You can access your fuel stations from the home page. There are 5 active NIPCO stations available for management: ABK-001, UYO 1-002, UYO 2-003, IK-004, and IB-005."
    }

    if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
      return "I can help you navigate through the system using the sidebar menu. Key features include Dashboard, Sales Report, Driver/Tank Offload forms, Staff Management, and System Logs."
    }

    if (lowerMessage.includes("sales") || lowerMessage.includes("revenue")) {
      return "You can view sales data by navigating to the Sales Report section in the sidebar menu. This will show you detailed sales information for the current station."
    }

    if (lowerMessage.includes("admin")) {
      return "You can access the admin dashboard from the home page. The admin section provides system-wide metrics and management capabilities across all stations."
    }

    return "I'm currently running in offline mode, but I can still help you navigate the NIPCO fuel station management system. Try asking me about specific features, navigation, or system capabilities!"
  }

  // Text-to-speech function
  const speakText = (text: string) => {
    if (synthRef.current && voiceEnabled) {
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
      console.error("❌ handleSendMessage error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)

      // Add error message to chat
      const errorChatMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `Sorry, I encountered an error: ${errorMessage}`,
        isUser: false,
        timestamp: new Date(),
        error: true,
      }
      setMessages((prev) => [...prev, errorChatMessage])
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
      gatherAppContext()
    }

    const handleLocationChange = () => {
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

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-400"
      case "config_error":
        return "bg-orange-400"
      case "disconnected":
        return "bg-red-400"
      default:
        return "bg-yellow-400"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "AI Online"
      case "config_error":
        return "Config Required"
      case "disconnected":
        return "AI Offline"
      default:
        return "Checking..."
    }
  }

  const handleChatClick = () => {
    router.push("/chat")
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleChatClick}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-6 py-4 backdrop-blur-sm border border-blue-400/20"
          >
            <div className="relative">
              <MessageCircle className="h-6 w-6" />
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
              {connectionStatus !== "connected" && (
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 ${getStatusColor()} rounded-full border border-white`}
                ></div>
              )}
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
                    <div className="flex items-center gap-2 text-xs opacity-90">
                      <span>Context-aware • GPT-3.5 powered</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                      <span>{getStatusText()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {connectionStatus === "config_error" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={checkApiHealth}
                      className="text-white hover:bg-white/20"
                      title="Check API configuration"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
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
              {/* Configuration Status Banner */}
              {connectionStatus === "config_error" && (
                <div className="bg-orange-500/20 border-b border-orange-500/30 p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-orange-400 text-xs">
                    <Settings className="h-3 w-3" />
                    <span>OpenAI API key configuration required</span>
                  </div>
                  {apiHealth && <p className="text-xs text-orange-300 mt-1">{apiHealth.message}</p>}
                </div>
              )}

              {/* Connection Status Banner */}
              {connectionStatus === "disconnected" && (
                <div className="bg-red-500/20 border-b border-red-500/30 p-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>AI service offline - using fallback responses</span>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        message.isUser
                          ? "bg-blue-500 text-white"
                          : message.error
                            ? "bg-red-500/20 border border-red-500/30 text-red-400"
                            : "bg-gray-700 text-gray-100"
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
                      maxLength={2000}
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
                  <span className="text-gray-500">
                    {contextRef.current?.currentPage || "Loading..."} • {inputText.length}/2000
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
