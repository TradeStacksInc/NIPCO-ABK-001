import { type NextRequest, NextResponse } from "next/server"

interface SpeechToTextRequest {
  audioData: string // Base64 encoded audio
  language?: string
  context?: any
}

interface SpeechToTextResponse {
  transcript: string
  confidence: number
  language: string
  duration: number
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

// Main speech-to-text API route
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🎤 Indigenius Speech-to-Text request received")

    // Validate credentials
    const { apiKey, orgId } = validateIndigenius()

    // Parse request body
    let requestData: SpeechToTextRequest
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
    if (!requestData.audioData) {
      return NextResponse.json(
        {
          error: "Audio data is required",
          code: "MISSING_AUDIO_DATA",
        },
        { status: 400 },
      )
    }

    // Prepare Indigenius API request
    const indigeniusRequest = {
      audio: requestData.audioData,
      language: requestData.language || "en-US",
      format: "webm", // or "wav", "mp3" depending on your audio format
      context: requestData.context || {},
    }

    console.log("🚀 Sending request to Indigenius Speech-to-Text API:", {
      language: indigeniusRequest.language,
      hasAudio: !!indigeniusRequest.audio,
      audioLength: indigeniusRequest.audio.length,
    })

    // Make API call to Indigenius
    const response = await fetch("https://api.indigenius.ai/v1/speech/transcribe", {
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
        throw new Error(`Bad request: ${errorDetails.message || "Invalid audio format"}`)
      } else {
        throw new Error(`Indigenius API error (${response.status}): ${errorDetails.message || response.statusText}`)
      }
    }

    // Parse successful response
    const data = await response.json()
    console.log("✅ Indigenius Speech-to-Text response received:", {
      hasTranscript: !!data.transcript,
      confidence: data.confidence,
      language: data.language,
    })

    const responseTime = Date.now() - startTime
    console.log(`✅ Speech-to-Text request completed in ${responseTime}ms`)

    // Return successful response
    return NextResponse.json({
      transcript: data.transcript || "",
      confidence: data.confidence || 0,
      language: data.language || "en-US",
      duration: data.duration || 0,
      responseTime: responseTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("❌ Speech-to-Text request failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime: responseTime,
    })

    return NextResponse.json(
      {
        error: "Failed to process speech-to-text request",
        code: "SPEECH_TO_TEXT_ERROR",
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
      service: "indigenius-speech-to-text",
      timestamp: new Date().toISOString(),
      hasCredentials: true,
    })
  } catch (error) {
    return NextResponse.json({
      status: "configuration_required",
      service: "indigenius-speech-to-text",
      timestamp: new Date().toISOString(),
      hasCredentials: false,
      message: error instanceof Error ? error.message : "Configuration error",
    })
  }
}
