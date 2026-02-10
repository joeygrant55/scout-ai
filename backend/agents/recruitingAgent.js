/**
 * SPARQ Recruiting Agent
 * AI agent that helps individual athletes get recruited
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Agent system prompt
const SYSTEM_PROMPT = `You are a personal recruiting agent for a high school athlete on SPARQ/GMTM.

Your mission: Help this athlete get recruited to play college sports.

What you do:
- Monitor opportunities (combines, showcases, camps, tryouts)
- Analyze fit (is this opportunity good for their profile?)
- Draft outreach emails to coaches
- Track applications and follow-ups
- Give personalized advice based on their metrics
- Proactively suggest next steps

You have access to:
- The athlete's GMTM profile (name, position, metrics, highlights)
- Opportunity database (combines, camps, showcases)
- Coach/school information
- Their recruiting goals and constraints

Personality:
- Encouraging but realistic
- Proactive (don't wait to be asked)
- Specific and actionable
- Remember their goals and preferences

When the athlete logs in, greet them and check for new opportunities that match their profile.`

// Available tools for the agent
export const TOOLS = [
  {
    name: 'get_athlete_profile',
    description: 'Get the athlete\'s full GMTM profile including metrics, position, location, graduation year, and highlights',
    input_schema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'number',
          description: 'The athlete\'s GMTM user ID'
        }
      },
      required: ['user_id']
    }
  },
  {
    name: 'search_opportunities',
    description: 'Search for combines, showcases, camps, and tryouts that match the athlete\'s profile',
    input_schema: {
      type: 'object',
      properties: {
        position: {
          type: 'string',
          description: 'Position to filter by (e.g., WR, QB, RB)'
        },
        location: {
          type: 'string',
          description: 'State or region (e.g., "CA" or "West Coast")'
        },
        max_distance_miles: {
          type: 'number',
          description: 'Maximum distance from athlete\'s location'
        },
        date_range: {
          type: 'string',
          description: 'Time period (e.g., "next_30_days", "next_3_months")'
        },
        division_level: {
          type: 'string',
          description: 'D1, D2, D3, NAIA, JUCO, or "all"'
        }
      },
      required: ['position']
    }
  },
  {
    name: 'analyze_fit',
    description: 'Analyze if an opportunity is a good fit for the athlete based on their metrics, goals, and constraints',
    input_schema: {
      type: 'object',
      properties: {
        opportunity_id: {
          type: 'string',
          description: 'The opportunity/event ID to analyze'
        },
        athlete_user_id: {
          type: 'number',
          description: 'The athlete\'s user ID'
        }
      },
      required: ['opportunity_id', 'athlete_user_id']
    }
  },
  {
    name: 'draft_email',
    description: 'Draft a personalized outreach email to a coach or recruiter',
    input_schema: {
      type: 'object',
      properties: {
        recipient_name: {
          type: 'string',
          description: 'Coach or recruiter name'
        },
        school: {
          type: 'string',
          description: 'School or organization name'
        },
        athlete_user_id: {
          type: 'number',
          description: 'The athlete\'s user ID for personalization'
        },
        context: {
          type: 'string',
          description: 'Why reaching out (e.g., "expressing interest", "following up on camp")'
        }
      },
      required: ['recipient_name', 'school', 'athlete_user_id', 'context']
    }
  },
  {
    name: 'track_application',
    description: 'Track an application or registration for an opportunity',
    input_schema: {
      type: 'object',
      properties: {
        opportunity_id: {
          type: 'string',
          description: 'The opportunity/event ID'
        },
        athlete_user_id: {
          type: 'number',
          description: 'The athlete\'s user ID'
        },
        status: {
          type: 'string',
          description: 'Status: "interested", "applied", "registered", "attended", "followed_up"'
        },
        notes: {
          type: 'string',
          description: 'Any notes about this application'
        }
      },
      required: ['opportunity_id', 'athlete_user_id', 'status']
    }
  },
  {
    name: 'get_coach_insights',
    description: 'Get information about a coach or program\'s recruiting history and preferences',
    input_schema: {
      type: 'object',
      properties: {
        school: {
          type: 'string',
          description: 'School name'
        },
        position: {
          type: 'string',
          description: 'Position to research (e.g., "WR")'
        }
      },
      required: ['school']
    }
  }
]

/**
 * Main agent conversation handler
 */
export async function agentConversation(athleteUserId, messages, onStream) {
  const allMessages = [
    {
      role: 'user',
      content: `My GMTM user ID is ${athleteUserId}. ${messages[0]?.content || 'What opportunities do I have?'}`
    }
  ]

  let response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages: allMessages,
    stream: true
  })

  let currentText = ''
  let toolUses = []

  // Stream the response
  for await (const event of response) {
    if (event.type === 'content_block_start') {
      if (event.content_block?.type === 'text') {
        onStream({ type: 'text_start' })
      } else if (event.content_block?.type === 'tool_use') {
        onStream({ 
          type: 'tool_start', 
          tool: event.content_block.name 
        })
      }
    }

    if (event.type === 'content_block_delta') {
      if (event.delta?.type === 'text_delta') {
        currentText += event.delta.text
        onStream({ 
          type: 'text_delta', 
          text: event.delta.text 
        })
      } else if (event.delta?.type === 'input_json_delta') {
        // Tool input streaming
      }
    }

    if (event.type === 'content_block_stop') {
      if (event.content_block?.type === 'tool_use') {
        toolUses.push(event.content_block)
        onStream({ 
          type: 'tool_complete', 
          tool: event.content_block.name 
        })
      }
    }
  }

  return {
    text: currentText,
    toolUses
  }
}

/**
 * Execute tool calls and return results
 */
export async function executeTools(toolUses, athleteUserId) {
  // Import tool handlers
  const toolHandlers = await import('../tools/index.js')
  
  const results = []
  
  for (const toolUse of toolUses) {
    try {
      const handler = toolHandlers[toolUse.name]
      if (!handler) {
        throw new Error(`Unknown tool: ${toolUse.name}`)
      }
      
      const result = await handler(toolUse.input, athleteUserId)
      results.push({
        tool_use_id: toolUse.id,
        type: 'tool_result',
        content: JSON.stringify(result)
      })
    } catch (error) {
      results.push({
        tool_use_id: toolUse.id,
        type: 'tool_result',
        content: JSON.stringify({ error: error.message }),
        is_error: true
      })
    }
  }
  
  return results
}
