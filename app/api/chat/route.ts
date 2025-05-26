import { type NextRequest, NextResponse } from "next/server"

// Input validation schemas
interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  context?: any
}

// Validate and sanitize input
function validateChatRequest(data: any): ChatRequest {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid request body")
  }

  if (!Array.isArray(data.messages)) {
    throw new Error("Messages must be an array")
  }

  if (data.messages.length === 0) {
    throw new Error("Messages array cannot be empty")
  }

  // Validate each message
  const validatedMessages: ChatMessage[] = data.messages.map((msg: any, index: number) => {
    if (!msg || typeof msg !== "object") {
      throw new Error(`Message at index ${index} is invalid`)
    }

    if (!["system", "user", "assistant"].includes(msg.role)) {
      throw new Error(`Invalid role "${msg.role}" at message index ${index}`)
    }

    if (typeof msg.content !== "string") {
      throw new Error(`Message content at index ${index} must be a string`)
    }

    // Trim content to prevent overly large requests
    const trimmedContent = msg.content.slice(0, 4000) // Max 4000 chars per message

    return {
      role: msg.role,
      content: trimmedContent,
    }
  })

  return {
    messages: validatedMessages,
    context: data.context,
  }
}

// Validate API key format
function validateApiKey(apiKey: string): boolean {
  // OpenAI API keys start with 'sk-' and are typically 51 characters long
  if (!apiKey || typeof apiKey !== "string") {
    return false
  }

  // Check if it's a placeholder or invalid key
  if (
    apiKey.includes("your_ope") ||
    apiKey.includes("************") ||
    apiKey === "your_openai_api_key_here" ||
    apiKey.length < 20
  ) {
    return false
  }

  // Should start with 'sk-'
  if (!apiKey.startsWith("sk-")) {
    return false
  }

  return true
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx) or authentication errors
      if (error instanceof Error && (error.message.includes("401") || error.message.includes("400"))) {
        throw error
      }

      if (attempt === maxRetries) {
        break
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Main API route handler
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🚀 Chat API request received")

    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY environment variable is not set")
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          code: "MISSING_API_KEY",
          message: "Please add your OpenAI API key to the environment variables",
          instructions: "Add OPENAI_API_KEY=your_actual_api_key to your environment variables",
        },
        { status: 500 },
      )
    }

    // Validate API key format
    if (!validateApiKey(apiKey)) {
      console.error("❌ Invalid OpenAI API key format detected")
      return NextResponse.json(
        {
          error: "Invalid API key format",
          code: "INVALID_API_KEY",
          message: "The OpenAI API key appears to be invalid or is a placeholder",
          instructions: "Please ensure you have set a valid OpenAI API key that starts with 'sk-'",
        },
        { status: 500 },
      )
    }

    // Parse and validate request body
    let requestData: any
    try {
      requestData = await request.json()
      console.log("📝 Request data received:", {
        messageCount: requestData?.messages?.length || 0,
        hasContext: !!requestData?.context,
      })
    } catch (error) {
      console.error("❌ Failed to parse request JSON:", error)
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          code: "INVALID_JSON",
        },
        { status: 400 },
      )
    }

    // Validate input
    let validatedRequest: ChatRequest
    try {
      validatedRequest = validateChatRequest(requestData)
      console.log("✅ Request validation passed")
    } catch (error) {
      console.error("❌ Request validation failed:", error)
      return NextResponse.json(
        {
          error: "Invalid request format",
          code: "VALIDATION_ERROR",
          details: error instanceof Error ? error.message : "Unknown validation error",
        },
        { status: 400 },
      )
    }

    // Prepare OpenAI API call
    const openaiRequest = {
      model: "gpt-3.5-turbo",
      messages: validatedRequest.messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
    }

    console.log("🤖 Sending request to OpenAI:", {
      model: openaiRequest.model,
      messageCount: openaiRequest.messages.length,
      maxTokens: openaiRequest.max_tokens,
      apiKeyPrefix: apiKey.substring(0, 7) + "...",
    })

    // Make API call with retry logic (but don't retry auth errors)
    const openaiResponse = await retryWithBackoff(
      async () => {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "NIPCO-Chat-Widget/1.0",
          },
          body: JSON.stringify(openaiRequest),
        })

        console.log("📡 OpenAI API response status:", response.status)

        if (!response.ok) {
          let errorDetails: any = {}
          try {
            errorDetails = await response.json()
          } catch {
            errorDetails = { message: await response.text() }
          }

          console.error("❌ OpenAI API error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorDetails,
          })

          // Throw specific errors based on status code
          if (response.status === 401) {
            throw new Error(
              `Invalid API key: ${errorDetails.error?.message || "Authentication failed"}. Please check your OpenAI API key.`,
            )
          } else if (response.status === 429) {
            throw new Error("Rate limit exceeded - please try again later")
          } else if (response.status === 400) {
            throw new Error(`Bad request: ${errorDetails.error?.message || "Invalid request format"}`)
          } else if (response.status >= 500) {
            throw new Error(
              `OpenAI server error (${response.status}): ${errorDetails.error?.message || "Internal server error"}`,
            )
          } else {
            throw new Error(
              `OpenAI API error (${response.status}): ${errorDetails.error?.message || response.statusText}`,
            )
          }
        }

        return response
      },
      1, // Don't retry auth errors
    )

    // Parse successful response
    let openaiData: any
    try {
      openaiData = await openaiResponse.json()
      console.log("✅ OpenAI response parsed successfully:", {
        choices: openaiData.choices?.length || 0,
        usage: openaiData.usage,
      })
    } catch (error) {
      console.error("❌ Failed to parse OpenAI response:", error)
      throw new Error("Failed to parse OpenAI response")
    }

    // Extract AI message
    const aiMessage = openaiData.choices?.[0]?.message?.content
    if (!aiMessage) {
      console.error("❌ No message content in OpenAI response:", openaiData)
      throw new Error("No response content from OpenAI")
    }

    const responseTime = Date.now() - startTime
    console.log(`✅ Chat API request completed successfully in ${responseTime}ms`)

    // Return successful response
    return NextResponse.json({
      message: aiMessage,
      context: validatedRequest.context,
      timestamp: new Date().toISOString(),
      usage: openaiData.usage,
      responseTime: responseTime,
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("❌ Chat API request failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: responseTime,
    })

    // Return error response
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        timestamp: new Date().toISOString(),
        responseTime: responseTime,
      },
      { status: 500 },
    )
  }
}

// Health check endpoint
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY
  const hasValidApiKey = apiKey && validateApiKey(apiKey)

  return NextResponse.json({
    status: hasValidApiKey ? "healthy" : "configuration_required",
    timestamp: new Date().toISOString(),
    hasApiKey: !!apiKey,
    validApiKey: hasValidApiKey,
    message: hasValidApiKey
      ? "OpenAI API key is properly configured"
      : "OpenAI API key is missing or invalid. Please check your environment variables.",
  })
}
