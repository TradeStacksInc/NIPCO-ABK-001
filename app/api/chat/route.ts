import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
    })

    const aiMessage = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response."

    return NextResponse.json({
      message: aiMessage,
      context: context,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("OpenAI API Error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
