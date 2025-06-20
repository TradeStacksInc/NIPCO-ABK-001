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
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  context?: any
  error?: boolean
  audioUrl?: string
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

interface IndigenousHealthStatus {
  status: string
  hasCredentials: boolean
  service: string
}

// Define MediaRecorder and related interfaces
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
    speechSynthesis: any
    MediaRecorder: any
  }

  interface SpeechRecognitionEventMap {
    start: Event
    result: SpeechRecognitionEvent
    end: Event
    error: SpeechRecognitionErrorEvent
  }

  interface SpeechRecognition extends EventTarget {
    grammars: SpeechGrammarList | undefined
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    serviceURI: string
    abort(): void
    start(): void
    stop(): void
    addEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void
    removeEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onend: ((this: SpeechRecognition, ev: Event) => any) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: SpeechRecognitionError
  }

  type SpeechRecognitionError =
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported"

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
  }

  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult
    length: number
    item(index: number): SpeechRecognitionResult
  }

  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative
    length: number
    item(index: number): SpeechRecognitionAlternative
    isFinal: boolean
  }

  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }

  interface SpeechGrammarList {
    [index: number]: SpeechGrammar
    length: number
    item(index: number): SpeechGrammar
    addFromString(string: string, weight?: number): void
    addFromURI(uri: string, weight?: number): void
  }

  interface SpeechGrammar {}
}

export default function ChatPage() {
  const router = useRouter()
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [useIndigenius, setUseIndigenius] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking" | "config_error">(
    "checking",
  )
  const [indigeniusStatus, setIndigenousStatus] = useState<"connected" | "disconnected" | "checking" | "config_error">(
    "checking",
  )
  const [apiHealth, setApiHealth] = useState<ApiHealthStatus | null>(null)
  const [indigeniusHealth, setIndigenousHealth] = useState<IndigenousHealthStatus | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const contextRef = useRef<AppContext | null>(null)

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    loadChatSessions()
    checkApiHealth()
    checkIndigenousHealth()
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
          text: "Hello! I'm your NIPCO AI assistant with advanced voice capabilities powered by Indigenius.ai and intelligent responses from OpenAI. I can understand your voice, speak back to you, and help with anything related to your fuel station management system. How can I assist you today?",
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
      console.error("❌ OpenAI API Health Check failed:", error)
      setConnectionStatus("disconnected")
    }
  }

  const checkIndigenousHealth = async () => {
    try {
      setIndigenousStatus("checking")
      const [sttResponse, ttsResponse] = await Promise.all([
        fetch("/api/indigenius/speech-to-text", { method: "GET" }),
        fetch("/api/indigenius/text-to-speech", { method: "GET" }),
      ])

      if (sttResponse.ok && ttsResponse.ok) {
        const sttData = await sttResponse.json()
        setIndigenousHealth(sttData)
        setIndigenousStatus(sttData.hasCredentials ? "connected" : "config_error")
      } else {
        setIndigenousStatus("disconnected")
      }
    } catch (error) {
      console.error("❌ Indigenius API Health Check failed:", error)
      setIndigenousStatus("disconnected")
    }
  }

  const initializeSpeech = () => {
    if (typeof window !== "undefined") {
      // Initialize Speech Recognition (fallback)
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

      // Initialize Speech Synthesis (fallback)
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
        voiceCapabilities: {
          indigeniusEnabled: useIndigenius && indigeniusStatus === "connected",
          fallbackEnabled: !!recognitionRef.current,
        },
      }

      context.recentActions = ["Opened chat interface", "Navigated from portal"]
    }

    contextRef.current = context
    return context
  }, [useIndigenius, indigeniusStatus])

  // Indigenius Speech-to-Text
  const transcribeWithIndigenius = async (audioBlob: Blob): Promise<string> => {
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      const response = await fetch("/api/indigenius/speech-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioData: base64Audio,
          language: "en-US",
          context: gatherAppContext(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Speech-to-text failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.transcript || ""
    } catch (error) {
      console.error("❌ Indigenius Speech-to-Text error:", error)
      throw error
    }
  }

  // Indigenius Text-to-Speech
  const synthesizeWithIndigenius = async (text: string): Promise<string> => {
    try {
      const response = await fetch("/api/indigenius/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voice: "en-US-neural-female",
          language: "en-US",
          speed: 1.0,
          context: gatherAppContext(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Text-to-speech failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.audioData || ""
    } catch (error) {
      console.error("❌ Indigenius Text-to-Speech error:", error)
      throw error
    }
  }

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

      const systemPrompt = `You are an intelligent AI assistant for the NIPCO Fuel Station Management System with advanced voice capabilities powered by Indigenius.ai. You are currently in a dedicated chat interface similar to ChatGPT.

Current Context:
- Page: ${context.currentPage}
- App Data: ${JSON.stringify(context.appData).slice(0, 1000)}
- Recent Actions: ${context.recentActions.join(", ")}
- Voice Capabilities: ${context.appData.voiceCapabilities ? JSON.stringify(context.appData.voiceCapabilities) : "Not available"}

You should provide helpful, contextual responses about the NIPCO fuel station management system. You can help with:
- Navigation and system features
- Fuel station operations and management
- Sales reporting and analytics
- Staff management
- Tank and inventory management
- System troubleshooting
- Voice interaction guidance

Since you have voice capabilities, you can:
- Respond to voice commands naturally
- Provide audio responses that will be spoken back to the user
- Guide users through voice-enabled workflows

Respond naturally and helpfully. Keep responses concise but informative, and remember that your response may be spoken aloud.`

      const requestPayload = {
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userMessage },
        ],
        context: {
          page: context.currentPage,
          timestamp: context.timestamp,
          voiceEnabled: useIndigenius && indigeniusStatus === "connected",
        },
      }

      console.log("🤖 Sending request to OpenAI API...")

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
          console.error("❌ API Error Response:", errorData)
        } catch {
          errorData = { error: "Failed to parse error response" }
        }

        if (response.status === 401) {
          throw new Error(
            `Authentication failed: ${errorData.message || "Invalid API key"}. Please check your OpenAI API key configuration.`,
          )
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.")
        } else if (response.status >= 500) {
          if (errorData.code === "MISSING_API_KEY" || errorData.code === "INVALID_API_KEY") {
            setConnectionStatus("config_error")
            throw new Error(
              `Configuration Error: ${errorData.message}${errorData.debug ? ` Debug: ${JSON.stringify(errorData.debug)}` : ""}`,
            )
          }
          throw new Error(`Server error: ${errorData.message || "Internal server error"}`)
        } else {
          throw new Error(`Request failed with status ${response.status}: ${errorData.message || response.statusText}`)
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

      // Return more specific error message
      if (error instanceof Error && error.message.includes("Authentication failed")) {
        return `❌ **API Key Issue**: ${error.message}\n\nPlease verify that your OpenAI API key is correctly set in the environment variables. The key should start with 'sk-' and be about 51 characters long.`
      }

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

  // Play audio from base64
  const playAudioFromBase64 = (base64Audio: string) => {
    try {
      const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), (c) => c.charCodeAt(0))], {
        type: "audio/mp3",
      })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onplay = () => setIsSpeaking(true)
      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }
      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        console.error("Failed to play audio")
      }

      audio.play()
    } catch (error) {
      console.error("Failed to play audio:", error)
      setIsSpeaking(false)
    }
  }

  // Fallback text-to-speech
  const speakTextFallback = (text: string) => {
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

  // Enhanced speech synthesis
  const speakText = async (text: string) => {
    if (!voiceEnabled) return

    try {
      if (useIndigenius && indigeniusStatus === "connected") {
        console.log("🔊 Using Indigenius Text-to-Speech")
        const audioData = await synthesizeWithIndigenius(text)
        if (audioData) {
          playAudioFromBase64(audioData)
          return
        }
      }
    } catch (error) {
      console.error("❌ Indigenius TTS failed, falling back to browser TTS:", error)
    }

    // Fallback to browser TTS
    console.log("🔊 Using browser Text-to-Speech fallback")
    speakTextFallback(text)
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
        await speakText(aiResponse)
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

  // Enhanced voice recording with Indigenius
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        stream.getTracks().forEach((track) => track.stop())

        try {
          if (useIndigenius && indigeniusStatus === "connected") {
            console.log("🎤 Using Indigenius Speech-to-Text")
            const transcript = await transcribeWithIndigenius(audioBlob)
            if (transcript) {
              setInputText(transcript)
              setIsRecording(false)
              return
            }
          }
        } catch (error) {
          console.error("❌ Indigenius STT failed, falling back to browser STT:", error)
        }

        // Fallback to browser speech recognition
        console.log("🎤 Using browser Speech Recognition fallback")
        handleVoiceToggleFallback()
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("❌ Failed to start recording:", error)
      setError("Failed to access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Fallback voice recognition
  const handleVoiceToggleFallback = () => {
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

  const handleVoiceToggle = () => {
    if (useIndigenius && indigeniusStatus === "connected") {
      if (isRecording) {
        stopRecording()
      } else {
        startRecording()
      }
    } else {
      handleVoiceToggleFallback()
    }
  }

  const handleVoiceOutputToggle = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isSpeaking) {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
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

  const getIndigenousStatusColor = () => {
    switch (indigeniusStatus) {
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

  const getIndigenousStatusText = () => {
    switch (indigeniusStatus) {
      case "connected":
        return "Voice Online"
      case "config_error":
        return "Voice Config Required"
      case "disconnected":
        return "Voice Offline"
      default:
        return "Checking Voice..."
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
                <span>GPT-3.5 + Indigenius.ai</span>
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                <span>{getStatusText()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Zap className="h-3 w-3" />
                <div className={`w-2 h-2 rounded-full ${getIndigenousStatusColor()}`}></div>
                <span>{getIndigenousStatusText()}</span>
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
              <p className="text-sm text-gray-400">
                Multi-modal AI assistant with voice capabilities powered by Indigenius.ai + OpenAI
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseIndigenius(!useIndigenius)}
                className={`text-gray-400 hover:text-white ${useIndigenius ? "text-purple-400" : ""}`}
                title={useIndigenius ? "Disable Indigenius.ai voice" : "Enable Indigenius.ai voice"}
              >
                <Zap className="h-4 w-4" />
              </Button>
              {(connectionStatus === "config_error" || indigeniusStatus === "config_error") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    checkApiHealth()
                    checkIndigenousHealth()
                  }}
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

          {indigeniusStatus === "config_error" && (
            <div className="mt-3 bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-400 text-sm">
                <Zap className="h-4 w-4" />
                <span>Indigenius.ai voice configuration required</span>
              </div>
              {indigeniusHealth && <p className="text-xs text-purple-300 mt-1">{indigeniusHealth.service}</p>}
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
                  placeholder="Ask me anything about your fuel station system or use voice..."
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
                    isListening || isRecording
                      ? "bg-red-500 text-white border-red-500"
                      : useIndigenius && indigeniusStatus === "connected"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500"
                        : "text-gray-400 hover:text-white"
                  }`}
                  disabled={isLoading}
                  title={
                    isListening || isRecording
                      ? "Stop listening"
                      : useIndigenius && indigeniusStatus === "connected"
                        ? "Start voice input (Indigenius.ai)"
                        : "Start voice input (Browser)"
                  }
                >
                  {isListening || isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
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
                {(isListening || isRecording) && (
                  <span className="text-red-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    {useIndigenius && indigeniusStatus === "connected" ? "Recording..." : "Listening..."}
                  </span>
                )}
                {isSpeaking && (
                  <span className="text-blue-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    Speaking...
                  </span>
                )}
                {useIndigenius && indigeniusStatus === "connected" && (
                  <span className="text-purple-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Indigenius.ai Voice Active
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
