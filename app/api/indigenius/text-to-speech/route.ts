import { type NextRequest, NextResponse } from "next/server"

interface TextToSpeechRequest {
  text: string
  voice?: string
  language?: string
  speed?: number
  context?: any
}

interface TextToSpeechResponse {
  audioData: string // Base64 encoded audio
  format: string
  duration: number
  voice: string
}

// Validate Indigenius API credentials
function validateIndigenius(): { apiKey: string; orgId: string } {
  const apiKey = process.env.INDIGENIUS_API_KEY
  const orgId = process.env.INDIGENIUS_ORG_ID

  if (!apiKey || !orgId) {
    throw new Error("Indigenius API credentials not configured")
  }

  return { apiKey, orgId }
}

// Main text-to-speech API route
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🔊 Indigenius Text-to-Speech request received")

    // Validate credentials
    const { apiKey, orgId } = validateIndigenius()

    // Parse request body
    let requestData: TextToSpeechRequest
    try {
      requestData = await request.json()
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
    if (!requestData.text || requestData.text.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Text is required",
          code: "MISSING_TEXT",
        },
        { status: 400 },
      )
    }

    // Limit text length
    const text = requestData.text.slice(0, 1000) // Limit to 1000 characters

    // Prepare Indigenius API request
    const indigeniusRequest = {
      text: text,
      voice: requestData.voice || "en-US-neural-female",
      language: requestData.language || "en-US",
      speed: requestData.speed || 1.0,
      format: "mp3", // or "wav", "webm"
      context: requestData.context || {},
    }

    console.log("🚀 Sending request to Indigenius Text-to-Speech API:", {
      textLength: text.length,
      voice: indigeniusRequest.voice,
      language: indigeniusRequest.language,
      speed: indigeniusRequest.speed,
    })

    // Make API call to Indigenius
    const response = await fetch("https://api.indigenius.ai/v1/speech/synthesize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Organization-ID": orgId,
        "Content-Type": "application/json",
        "User-Agent": "NIPCO-Chat-Widget/1.0",
      },
      body: JSON.stringify(indigeniusRequest),
    })

    console.log("📡 Indigenius API response status:", response.status)

    if (!response.ok) {
      let errorDetails: any = {}
      try {
        errorDetails = await response.json()
      } catch {
        errorDetails = { message: await response.text() }
      }

      console.error("❌ Indigenius API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails,
      })

      if (response.status === 401) {
        throw new Error("Invalid Indigenius API credentials")
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded - please try again later")
      } else if (response.status === 400) {
        throw new Error(`Bad request: ${errorDetails.message || "Invalid text input"}`)
      } else {
        throw new Error(`Indigenius API error (${response.status}): ${errorDetails.message || response.statusText}`)
      }
    }

    // Parse successful response
    const data = await response.json()
    console.log("✅ Indigenius Text-to-Speech response received:", {
      hasAudio: !!data.audioData,
      format: data.format,
      duration: data.duration,
    })

    const responseTime = Date.now() - startTime
    console.log(`✅ Text-to-Speech request completed in ${responseTime}ms`)

    // Return successful response
    return NextResponse.json({
      audioData: data.audioData || "",
      format: data.format || "mp3",
      duration: data.duration || 0,
      voice: data.voice || indigeniusRequest.voice,
      responseTime: responseTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("❌ Text-to-Speech request failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime: responseTime,
    })

    return NextResponse.json(
      {
        error: "Failed to process text-to-speech request",
        code: "TEXT_TO_SPEECH_ERROR",
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
  try {
    const { apiKey, orgId } = validateIndigenius()
    return NextResponse.json({
      status: "healthy",
      service: "indigenius-text-to-speech",
      timestamp: new Date().toISOString(),
      hasCredentials: true,
    })
  } catch (error) {
    return NextResponse.json({
      status: "configuration_required",
      service: "indigenius-text-to-speech",
      timestamp: new Date().toISOString(),
      hasCredentials: false,
      message: error instanceof Error ? error.message : "Configuration error",
    })
  }
}
