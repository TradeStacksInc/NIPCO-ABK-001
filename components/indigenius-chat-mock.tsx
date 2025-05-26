"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mic, Send, X, MessageCircle, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export function IndigeniusChatMock() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your NIPCO AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    // Simulate AI response (replace with actual Indigenius API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("fuel") || input.includes("gas") || input.includes("petrol")) {
      return "I can help you with fuel-related queries! Our stations offer premium petrol, diesel, and automotive services. Which station would you like information about?"
    }

    if (input.includes("price") || input.includes("cost")) {
      return "Current fuel prices vary by location. Would you like me to check prices for a specific NIPCO station? I can also help you find the nearest station."
    }

    if (input.includes("location") || input.includes("station") || input.includes("near")) {
      return "We have 5 active NIPCO stations: ABK-001 (Abak), UYO 1-002 (Uyo), UYO 2-003 (Uyo), IK-004 (Ikot Ekpene), and IB-005 (Ibibio). Which area are you interested in?"
    }

    if (input.includes("hours") || input.includes("open") || input.includes("time")) {
      return "Most of our stations are open 24/7. However, specific services may have different hours. Which station and service are you asking about?"
    }

    return (
      "I understand you're asking about: " +
      userInput +
      ". Let me help you with that. Could you provide more specific details about what you need assistance with?"
    )
  }

  const handleVoiceToggle = () => {
    setIsListening(!isListening)
    // In live environment, this would integrate with speech recognition
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false)
        setInputText("How can I find the nearest NIPCO station?")
      }, 3000)
    }
  }

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
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-6 py-4 backdrop-blur-sm border border-blue-400/20"
          >
            <div className="relative">
              <Mic className="h-6 w-6" />
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
            </div>
            <span className="font-semibold text-sm whitespace-nowrap">Ask Me Anything</span>
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px]">
          <Card className="h-full bg-gray-900/95 backdrop-blur-sm border-gray-700/50 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">NIPCO AI Assistant</h3>
                    <p className="text-xs opacity-90">Powered by Indigenius</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isUser ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
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
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full p-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={1}
                    />
                  </div>
                  <Button
                    onClick={handleVoiceToggle}
                    variant="outline"
                    size="sm"
                    className={`border-gray-600 ${
                      isListening ? "bg-red-500 text-white border-red-500" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {isListening && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    Listening... (Demo mode)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
