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

// Retry logic with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx) or authentication errors
      if (error instanceof Error && error.message.includes("4")) {
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

    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY environment variable is not set")
      return NextResponse.json(
        {
          error: "Server configuration error",
          code: "MISSING_API_KEY",
          message: "OpenAI API key is not configured",
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
      model: "gpt-3.5-turbo", // Using stable model
      messages: validatedRequest.messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
    }

    console.log("🤖 Sending request to OpenAI:", {
      model: openaiRequest.model,
      messageCount: openaiRequest.messages.length,
      maxTokens: openaiRequest.max_tokens,
    })

    // Make API call with retry logic
    const openaiResponse = await retryWithBackoff(async () => {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
          throw new Error("Invalid API key - please check your OpenAI API key")
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
    })

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
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.OPENAI_API_KEY,
  })
}
