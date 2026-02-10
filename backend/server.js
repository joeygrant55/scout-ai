/**
 * SPARQ Agent Backend Server
 * Serves the AI recruiting agent via REST API
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { agentConversation, executeTools } from './agents/recruitingAgent.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'sparq-agent-backend',
    version: '1.0.0'
  })
})

/**
 * Main chat endpoint with streaming
 * POST /api/chat
 */
app.post('/api/chat', async (req, res) => {
  const { message, athlete_user_id, conversation_history } = req.body
  
  if (!message || !athlete_user_id) {
    return res.status(400).json({ 
      error: 'Missing required fields: message, athlete_user_id' 
    })
  }
  
  // Set up Server-Sent Events (SSE) for streaming
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  // Helper to send SSE events
  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
  
  try {
    sendEvent('start', { message: 'Agent thinking...' })
    
    // Build message history
    const messages = [
      ...(conversation_history || []),
      { role: 'user', content: message }
    ]
    
    // Run the agent
    const result = await agentConversation(
      athlete_user_id,
      messages,
      (streamEvent) => {
        // Stream events to frontend
        if (streamEvent.type === 'text_delta') {
          sendEvent('text', { text: streamEvent.text })
        } else if (streamEvent.type === 'tool_start') {
          sendEvent('tool_start', { tool: streamEvent.tool })
        } else if (streamEvent.type === 'tool_complete') {
          sendEvent('tool_complete', { tool: streamEvent.tool })
        }
      }
    )
    
    // If agent wants to use tools, execute them
    if (result.toolUses && result.toolUses.length > 0) {
      sendEvent('tools_executing', { count: result.toolUses.length })
      
      const toolResults = await executeTools(result.toolUses, athlete_user_id)
      
      sendEvent('tools_complete', { results: toolResults })
      
      // Continue conversation with tool results
      const followUpMessages = [
        ...messages,
        { role: 'assistant', content: result.text, tool_uses: result.toolUses },
        { role: 'user', content: toolResults }
      ]
      
      const followUp = await agentConversation(
        athlete_user_id,
        followUpMessages,
        (streamEvent) => {
          if (streamEvent.type === 'text_delta') {
            sendEvent('text', { text: streamEvent.text })
          }
        }
      )
      
      sendEvent('complete', { 
        response: result.text + followUp.text,
        tools_used: result.toolUses.map(t => t.name)
      })
    } else {
      sendEvent('complete', { 
        response: result.text 
      })
    }
    
    res.end()
    
  } catch (error) {
    console.error('Agent error:', error)
    sendEvent('error', { 
      message: error.message,
      type: error.type 
    })
    res.end()
  }
})

/**
 * Get athlete profile
 * GET /api/athlete/:user_id
 */
app.get('/api/athlete/:user_id', async (req, res) => {
  const { user_id } = req.params
  
  // TODO: Connect to real GMTM database
  const mockProfile = {
    user_id: parseInt(user_id),
    first_name: 'Marcus',
    last_name: 'Johnson',
    position: 'WR',
    graduation_year: 2026,
    city: 'Los Angeles',
    state: 'CA',
    avatar_url: null,
    metrics: {
      forty_yard: 4.52,
      vertical: 36.5,
      shuttle: 4.18,
      sparq_score: 117.3
    },
    highlights_count: 8,
    goals: 'Play D1 football, preferably West Coast'
  }
  
  res.json(mockProfile)
})

/**
 * Get opportunities for athlete
 * GET /api/opportunities/:user_id
 */
app.get('/api/opportunities/:user_id', async (req, res) => {
  const { user_id } = req.params
  const { limit = 10 } = req.query
  
  // TODO: Fetch real opportunities from database
  const mockOpportunities = [
    {
      id: 'combine_001',
      type: 'combine',
      name: 'Elite West Coast Showcase',
      date: '2026-03-15',
      location: 'San Diego, CA',
      distance_miles: 120,
      fit_score: 92,
      status: 'recommended'
    },
    {
      id: 'camp_002',
      type: 'camp',
      name: 'USC WR Camp',
      date: '2026-04-05',
      location: 'Los Angeles, CA',
      distance_miles: 15,
      fit_score: 88,
      status: 'recommended'
    }
  ]
  
  res.json({
    opportunities: mockOpportunities.slice(0, parseInt(limit)),
    total: mockOpportunities.length
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

app.listen(PORT, () => {
  console.log(`🏈 SPARQ Agent backend running on port ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   Chat: POST http://localhost:${PORT}/api/chat`)
})
