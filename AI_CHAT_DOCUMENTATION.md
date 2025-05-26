# AI Chat Widget Documentation

## Overview
This AI Chat Widget provides a sophisticated conversational AI assistant powered by OpenAI's GPT-4, with deep context awareness of your web application's state and real-time voice interaction capabilities.

## Features

### 🧠 Deep Context Awareness
- **Real-time app state monitoring**: Tracks current page, route, and UI components
- **localStorage integration**: Accesses user preferences and session data
- **Dynamic data gathering**: Collects relevant app data based on current context
- **User action tracking**: Monitors recent user interactions and behaviors

### 🎤 Voice Interaction
- **Speech-to-Text (STT)**: Browser-native Web Speech API integration
- **Text-to-Speech (TTS)**: Natural voice responses using Speech Synthesis API
- **Voice controls**: Toggle voice input/output independently
- **Real-time feedback**: Visual indicators for listening and speaking states

### 💬 Conversational AI
- **GPT-4 powered**: Latest OpenAI model for intelligent responses
- **Context-aware responses**: AI understands current app state and user context
- **Natural conversation**: Maintains chat history and conversational flow
- **Error handling**: Graceful fallbacks for API failures

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in your project root:

\`\`\`env
OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

### 2. API Route Configuration
The widget uses a Next.js API route (`/api/chat/route.ts`) to securely handle OpenAI API calls.

### 3. Component Integration
Import and use the widget in any page:

\`\`\`tsx
import { AIChatWidget } from "@/components/ai-chat-widget"

export default function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <AIChatWidget />
    </div>
  )
}
\`\`\`

## Context Sources

### Automatic Context Gathering
The widget automatically collects:

- **Page Information**: Current URL, route, and navigation state
- **localStorage Data**: User preferences, session data, and cached information
- **App-specific Data**: Contextual data based on current page/section
- **User Actions**: Recent interactions and behavioral patterns

### Extending Context Sources
To add custom context sources, modify the `gatherAppContext()` function:

\`\`\`tsx
const gatherAppContext = useCallback((): AppContext => {
  const context: AppContext = {
    // ... existing context
    customData: {
      userRole: getCurrentUserRole(),
      permissions: getUserPermissions(),
      recentActivity: getRecentActivity(),
    }
  }
  return context
}, [])
\`\`\`

## Voice Configuration

### Browser Compatibility
- **Speech Recognition**: Chrome, Edge, Safari (with webkit prefix)
- **Speech Synthesis**: All modern browsers
- **Fallback**: Text input always available

### Customizing Voice Settings
Modify voice parameters in the `speakText()` function:

\`\`\`tsx
const utterance = new SpeechSynthesisUtterance(text)
utterance.rate = 0.9      // Speech rate (0.1 to 10)
utterance.pitch = 1       // Voice pitch (0 to 2)
utterance.volume = 0.8    // Volume level (0 to 1)
utterance.lang = 'en-US'  // Language code
\`\`\`

## API Integration

### OpenAI Configuration
The widget uses GPT-4 Turbo with these default settings:

\`\`\`tsx
const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: messages,
  max_tokens: 1000,
  temperature: 0.7,
  stream: false,
})
\`\`\`

### Custom System Prompts
Modify the system prompt in `sendToOpenAI()` to customize AI behavior:

\`\`\`tsx
const systemPrompt = `You are an intelligent AI assistant for [Your App Name].
Current Context: ${JSON.stringify(context, null, 2)}
[Add your specific instructions here]`
\`\`\`

## Performance Optimization

### Context Caching
- Context is cached and only updated when necessary
- Real-time monitoring with event listeners for storage and navigation changes
- Debounced updates to prevent excessive API calls

### API Rate Limiting
Consider implementing rate limiting for production:

\`\`\`tsx
// Add rate limiting logic
const rateLimiter = new Map()
const RATE_LIMIT = 10 // requests per minute
\`\`\`

## Security Considerations

### API Key Protection
- ✅ API keys stored in environment variables
- ✅ Server-side API calls only
- ✅ No client-side exposure of sensitive data

### Data Privacy
- Context data is processed locally
- Only necessary context sent to OpenAI
- Consider implementing data sanitization for sensitive information

## Troubleshooting

### Common Issues

1. **Voice not working**: Check browser permissions for microphone access
2. **API errors**: Verify OpenAI API key and billing status
3. **Context not updating**: Check localStorage permissions and event listeners
4. **Slow responses**: Consider reducing context size or implementing caching

### Debug Mode
Enable debug logging by adding:

\`\`\`tsx
const DEBUG = process.env.NODE_ENV === 'development'
if (DEBUG) console.log('Context:', context)
\`\`\`

## Future Enhancements

### Suggested Improvements
1. **Multi-language support**: Extend voice and text to multiple languages
2. **Custom voice models**: Integrate with advanced TTS services
3. **Conversation memory**: Implement persistent conversation history
4. **Analytics integration**: Track usage patterns and user satisfaction
5. **Advanced context**: Add computer vision for UI state understanding

### Scaling Considerations
- Implement conversation threading for multiple topics
- Add conversation summarization for long chats
- Consider streaming responses for better UX
- Implement conversation export/import functionality

## Support
For issues or questions, refer to:
- OpenAI API documentation
- Web Speech API documentation
- Next.js API routes documentation
