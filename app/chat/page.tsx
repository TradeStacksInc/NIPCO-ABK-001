"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Mic,
  MicOff,
  Send,
  ArrowLeft,
  MessageCircle,
  Volume2,
  VolumeX,
  Trash2,
  Plus,
  Settings,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  context?: any
  error?: boolean
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  lastUpdated: Date
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

export default function ChatPage() {
  const router = useRouter()
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
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

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    loadChatSessions()
    checkApiHealth()
    initializeSpeech()
  }, [])

  const loadChatSessions = () => {
    try {
      const savedSessions = localStorage.getItem("nipco-chat-sessions")
      if (savedSessions) {
        const sessions: ChatSession[] = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          lastUpdated: new Date(session.lastUpdated),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        setChatSessions(sessions)

        // Load the most recent session or create a new one
        if (sessions.length > 0) {
          setCurrentSession(sessions[0])
        } else {
          createNewSession()
        }
      } else {
        createNewSession()
      }
    } catch (error) {
      console.error("Failed to load chat sessions:", error)
      createNewSession()
    }
  }

  const saveChatSessions = (sessions: ChatSession[]) => {
    try {
      localStorage.setItem("nipco-chat-sessions", JSON.stringify(sessions))
    } catch (error) {
      console.error("Failed to save chat sessions:", error)
    }
  }

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        {
          id: "welcome",
          text: "Hello! I'm your NIPCO AI assistant. I'm fully aware of your current app state and can help you with anything related to your fuel station management system. How can I assist you today?",
          isUser: false,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      lastUpdated: new Date(),
    }

    setCurrentSession(newSession)
    const updatedSessions = [newSession, ...chatSessions]
    setChatSessions(updatedSessions)
    saveChatSessions(updatedSessions)
  }

  const updateCurrentSession = (updatedSession: ChatSession) => {
    setCurrentSession(updatedSession)
    const updatedSessions = chatSessions.map((session) => (session.id === updatedSession.id ? updatedSession : session))
    setChatSessions(updatedSessions)
    saveChatSessions(updatedSessions)
  }

  const deleteSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter((session) => session.id !== sessionId)
    setChatSessions(updatedSessions)
    saveChatSessions(updatedSessions)

    if (currentSession?.id === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSession(updatedSessions[0])
      } else {
        createNewSession()
      }
    }
  }

  const switchToSession = (session: ChatSession) => {
    setCurrentSession(session)
  }

  const checkApiHealth = async () => {
    try {
      setConnectionStatus("checking")
      const response = await fetch("/api/chat", { method: "GET" })
      if (response.ok) {
        const data: ApiHealthStatus = await response.json()
        setApiHealth(data)
        setConnectionStatus(data.validApiKey ? "connected" : "config_error")
      } else {
        setConnectionStatus("disconnected")
      }
    } catch (error) {
      console.error("❌ API Health Check failed:", error)
      setConnectionStatus("disconnected")
    }
  }

  const initializeSpeech = () => {
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
    }
  }

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
      // Gather localStorage data (limited)
      try {
        for (let i = 0; i < Math.min(localStorage.length, 10); i++) {
          const key = localStorage.key(i)
          if (key && key.length < 50 && !key.includes("nipco-chat-sessions")) {
            const value = localStorage.getItem(key)
            if (value && value.length < 200) {
              context.localStorage[key] = value
            }
          }
        }
      } catch (e) {
        console.warn("Could not access localStorage:", e)
      }

      // Gather app-specific data
      context.appData = {
        chatView: true,
        availableStations: 5,
        systemOverview: {
          status: "All systems operational",
          lastUpdate: new Date().toISOString(),
        },
      }

      context.recentActions = ["Opened chat interface", "Navigated from portal"]
    }

    contextRef.current = context
    return context
  }, [])

  // OpenAI API integration
  const sendToOpenAI = async (userMessage: string, context: AppContext): Promise<string> => {
    if (connectionStatus === "config_error") {
      throw new Error("OpenAI API key is not properly configured.")
    }

    try {
      if (!userMessage || userMessage.trim().length === 0) {
        throw new Error("Message cannot be empty")
      }

      if (userMessage.length > 2000) {
        userMessage = userMessage.slice(0, 2000) + "..."
      }

      const systemPrompt = `You are an intelligent AI assistant for the NIPCO Fuel Station Management System. You are currently in a dedicated chat interface similar to ChatGPT.

Current Context:
- Page: ${context.currentPage}
- App Data: ${JSON.stringify(context.appData).slice(0, 1000)}
- Recent Actions: ${context.recentActions.join(", ")}

You should provide helpful, contextual responses about the NIPCO fuel station management system. You can help with:
- Navigation and system features
- Fuel station operations and management
- Sales reporting and analytics
- Staff management
- Tank and inventory management
- System troubleshooting

Respond naturally and helpfully. Keep responses concise but informative.`

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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: "Failed to parse error response" }
        }

        if (response.status === 401) {
          throw new Error("Authentication failed. Please check API key configuration.")
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.")
        } else if (response.status >= 500) {
          if (errorData.code === "MISSING_API_KEY" || errorData.code === "INVALID_API_KEY") {
            setConnectionStatus("config_error")
            throw new Error(`Configuration Error: ${errorData.message}`)
          }
          throw new Error(`Server error: ${errorData.message || "Internal server error"}`)
        } else {
          throw new Error(`Request failed with status ${response.status}`)
        }
      }

      const data = await response.json()
      if (!data.message) {
        throw new Error("No message content in response")
      }

      setConnectionStatus("connected")
      return data.message
    } catch (error) {
      console.error("❌ sendToOpenAI error:", error)
      setConnectionStatus("disconnected")
      return getFallbackResponse(context, userMessage)
    }
  }

  const getFallbackResponse = (context: AppContext, userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (connectionStatus === "config_error") {
      return "I'm currently unable to access my AI capabilities due to a configuration issue with the OpenAI API key. However, I can still help you navigate the NIPCO system!"
    }

    if (lowerMessage.includes("station") || lowerMessage.includes("nipco")) {
      return "You can access your fuel stations from the home page. There are 5 active NIPCO stations available for management: ABK-001, UYO 1-002, UYO 2-003, IK-004, and IB-005."
    }

    if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
      return "I can help you navigate through the NIPCO system. Key features include Dashboard, Sales Report, Driver/Tank Offload forms, Staff Management, and System Logs."
    }

    return "I'm currently running in offline mode, but I can still help you navigate the NIPCO fuel station management system. Try asking me about specific features or navigation!"
  }

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

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !currentSession) return

    const context = gatherAppContext()
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      context: context,
    }

    // Update session title if it's the first user message
    const updatedSession = { ...currentSession }
    if (currentSession.title === "New Chat" && currentSession.messages.length === 1) {
      updatedSession.title = inputText.slice(0, 30) + (inputText.length > 30 ? "..." : "")
    }

    updatedSession.messages = [...updatedSession.messages, userMessage]
    updatedSession.lastUpdated = new Date()
    updateCurrentSession(updatedSession)

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

      updatedSession.messages = [...updatedSession.messages, aiMessage]
      updatedSession.lastUpdated = new Date()
      updateCurrentSession(updatedSession)

      if (voiceEnabled) {
        speakText(aiResponse)
      }
    } catch (error) {
      console.error("❌ handleSendMessage error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)

      const errorChatMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `Sorry, I encountered an error: ${errorMessage}`,
        isUser: false,
        timestamp: new Date(),
        error: true,
      }

      updatedSession.messages = [...updatedSession.messages, errorChatMessage]
      updatedSession.lastUpdated = new Date()
      updateCurrentSession(updatedSession)
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleVoiceOutputToggle = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleBackToPortal = () => {
    router.back()
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentSession?.messages])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={handleBackToPortal}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Button>
            <Button
              onClick={createNewSession}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-blue-400" />
            <div>
              <h1 className="text-lg font-semibold text-white">NIPCO AI Chat</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>GPT-3.5 powered</span>
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                <span>{getStatusText()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Chat History</h3>
          <div className="space-y-2">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                  currentSession?.id === session.id
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : "bg-gray-800/50 hover:bg-gray-700/50"
                }`}
                onClick={() => switchToSession(session)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{session.title}</p>
                    <p className="text-xs text-gray-400">{session.lastUpdated.toLocaleDateString()}</p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{currentSession?.title || "New Chat"}</h2>
              <p className="text-sm text-gray-400">Context-aware AI assistant for NIPCO fuel station management</p>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === "config_error" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkApiHealth}
                  className="text-orange-400 hover:bg-orange-500/20"
                  title="Check API configuration"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceOutputToggle}
                className={`text-gray-400 hover:text-white ${voiceEnabled ? "text-blue-400" : ""}`}
                title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Status Banners */}
          {connectionStatus === "config_error" && (
            <div className="mt-3 bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-400 text-sm">
                <Settings className="h-4 w-4" />
                <span>OpenAI API key configuration required</span>
              </div>
              {apiHealth && <p className="text-xs text-orange-300 mt-1">{apiHealth.message}</p>}
            </div>
          )}

          {connectionStatus === "disconnected" && (
            <div className="mt-3 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>AI service offline - using fallback responses</span>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {currentSession?.messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.isUser
                      ? "bg-blue-500 text-white"
                      : message.error
                        ? "bg-red-500/20 border border-red-500/30 text-red-400"
                        : "bg-gray-800 text-gray-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-2">
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
                <div className="bg-gray-800 text-gray-100 p-4 rounded-2xl">
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
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your fuel station system..."
                  className="w-full p-4 bg-gray-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] max-h-40"
                  rows={2}
                  disabled={isLoading}
                  maxLength={2000}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleVoiceToggle}
                  variant="outline"
                  size="lg"
                  className={`border-gray-600 ${
                    isListening ? "bg-red-500 text-white border-red-500" : "text-gray-400 hover:text-white"
                  }`}
                  disabled={isLoading}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
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
              <span>{inputText.length}/2000 characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
