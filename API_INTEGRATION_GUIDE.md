# OpenAI API Integration Guide

## Overview
This guide documents the stable OpenAI API integration for the NIPCO AI Chat Widget, including error handling, validation, and debugging features.

## Key Features

### ✅ Robust API Route (`/app/api/chat/route.ts`)

1. **Input Validation**
   - Validates message format and structure
   - Limits message content to prevent oversized requests
   - Sanitizes input data before processing

2. **Error Handling**
   - Specific error messages for different HTTP status codes
   - Retry logic with exponential backoff for transient errors
   - Detailed logging for debugging

3. **Security**
   - Server-side API key handling
   - No client-side exposure of sensitive data
   - Request validation and sanitization

### ✅ Enhanced Chat Widget (`/components/ai-chat-widget.tsx`)

1. **Connection Monitoring**
   - Health check endpoint to verify API status
   - Visual connection status indicators
   - Automatic fallback responses when offline

2. **Context Management**
   - Size-limited context gathering to prevent large payloads
   - Smart context summarization
   - Real-time app state monitoring

3. **User Experience**
   - Loading states and error messages
   - Voice interaction capabilities
   - Responsive design with accessibility features

## API Request Flow

\`\`\`mermaid
graph TD
    A[User sends message] --> B[Validate input]
    B --> C[Gather app context]
    C --> D[Create API request]
    D --> E[Send to OpenAI API]
    E --> F{API Response OK?}
    F -->|Yes| G[Parse response]
    F -->|No| H[Handle error]
    G --> I[Return AI message]
    H --> J[Return fallback response]
    I --> K[Display to user]
    J --> K
\`\`\`

## Error Handling Strategy

### API Route Errors
- **400 Bad Request**: Invalid request format or missing required fields
- **401 Unauthorized**: Invalid or missing API key
- **429 Rate Limited**: Too many requests, retry with backoff
- **500 Server Error**: OpenAI service issues, retry with backoff

### Client-Side Errors
- **Network errors**: Connection issues, fallback to offline responses
- **Validation errors**: Input too long or malformed
- **Voice errors**: Speech recognition failures

## Testing the Integration

### 1. Health Check
\`\`\`bash
curl -X GET http://localhost:3000/api/chat
\`\`\`

Expected response:
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "hasApiKey": true
}
\`\`\`

### 2. Simple Chat Request
\`\`\`bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how can you help me?"}
    ]
  }'
\`\`\`

### 3. Debug Logs
Check the console for detailed logging:
- 🚀 Request received
- 📝 Request validation
- 🤖 OpenAI API call
- ✅ Successful response
- ❌ Error details

## Configuration

### Environment Variables
\`\`\`env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional (for enhanced features)
OPENAI_ORG_ID=org-your-organization-id
\`\`\`

### Model Configuration
The integration uses `gpt-3.5-turbo` for stability and cost-effectiveness. To upgrade to GPT-4:

\`\`\`typescript
const openaiRequest = {
  model: "gpt-4", // or "gpt-4-turbo-preview"
  messages: validatedRequest.messages,
  max_tokens: 1000,
  temperature: 0.7,
}
\`\`\`

## Monitoring and Debugging

### Console Logs
- All API calls are logged with timestamps
- Error details include full stack traces
- Performance metrics (response times, token usage)

### Connection Status
- Visual indicators in the chat widget
- Automatic health checks on component mount
- Fallback responses when API is unavailable

### Error Recovery
- Automatic retry with exponential backoff
- Graceful degradation to offline mode
- Context-aware fallback responses

## Performance Optimization

### Request Size Limits
- Messages limited to 4000 characters each
- Context data trimmed to prevent large payloads
- localStorage data limited to 10 keys, 200 chars each

### Caching Strategy
- Context data cached and updated only when necessary
- Speech synthesis voices cached for better performance
- API responses could be cached for repeated queries

## Security Considerations

### API Key Protection
- ✅ Server-side only API key usage
- ✅ Environment variable configuration
- ✅ No client-side exposure

### Data Privacy
- Context data processed locally
- Only necessary context sent to OpenAI
- User messages not stored permanently

### Input Validation
- All inputs validated and sanitized
- Size limits prevent abuse
- Type checking for all parameters

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check API key configuration
   - Verify OpenAI account status and billing
   - Check console logs for detailed error messages

2. **Rate Limiting (429)**
   - Implement request queuing
   - Add user-facing rate limit messages
   - Consider upgrading OpenAI plan

3. **Large Context Errors**
   - Reduce context size in `gatherAppContext()`
   - Implement context summarization
   - Split large requests into smaller chunks

4. **Voice Features Not Working**
   - Check browser compatibility
   - Verify microphone permissions
   - Test with HTTPS (required for speech APIs)

### Debug Mode
Enable detailed logging by setting:
\`\`\`typescript
const DEBUG = process.env.NODE_ENV === 'development'
\`\`\`

This will log all API requests, responses, and context data to the console.
