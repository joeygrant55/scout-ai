# SPARQ Agent 🏈⚡

**AI recruiting agent that helps high school athletes get recruited to college sports.**

Instead of scouts searching for athletes, this is an AI agent that works FOR the athlete—monitoring opportunities, analyzing fit, drafting emails, and proactively helping them get recruited.

---

## What It Does

Your personal recruiting agent:
- ✅ **Monitors opportunities** - Finds combines, showcases, camps that match your profile
- ✅ **Analyzes fit** - "This camp is perfect for your speed and position"
- ✅ **Drafts emails** - Personalized outreach to coaches
- ✅ **Tracks applications** - Never miss a deadline or follow-up
- ✅ **Proactive advice** - "Coach Smith is looking for WRs with your metrics"
- ✅ **Remembers your goals** - Knows your constraints (budget, location, division level)

---

## Tech Stack

**Frontend:**
- Next.js 14 + TypeScript
- Convex (athlete data + conversations)
- Tailwind CSS (GMTM brand)
- Existing Scout AI UI (repurposed)

**Backend (NEW!):**
- Node.js + Express
- **Anthropic Agent SDK** with tools
- Streaming responses (Server-Sent Events)

**Agent Tools:**
1. `get_athlete_profile` - Pull GMTM profile data
2. `search_opportunities` - Find relevant combines/camps
3. `analyze_fit` - Score opportunities for the athlete
4. `draft_email` - Generate personalized coach emails
5. `track_application` - Log applications and follow-ups
6. `get_coach_insights` - Research coach recruiting history

---

## Running It

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY
npm run dev
# Runs on http://localhost:8000
```

### Frontend
```bash
cd ~/sparq-agent
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## Current Status

✅ **Backend:** Agent SDK integrated, 6 tools implemented, streaming working
✅ **Frontend:** UI ready (chat interface, profile, opportunity cards)
🚧 **Data:** Using mock data (need to connect real GMTM database)
🚧 **Auth:** Login flow exists but needs athlete-specific auth

---

## Next Steps

### Phase 1: MVP (Days 1-2)
- [ ] Connect to real GMTM athlete database
- [ ] Connect to real opportunity/event database
- [ ] Test agent with real athlete profile
- [ ] Add proactive notifications ("New opportunity matches your profile!")

### Phase 2: Upsell (Days 3-4)
- [ ] Free tier: Basic profile + limited searches
- [ ] Pro tier ($X/month): Unlimited opportunities + email drafting + tracking
- [ ] Subscription gate in frontend
- [ ] Stripe integration

### Phase 3: Launch (Day 5+)
- [ ] Deploy backend (Railway/Fly.io)
- [ ] Deploy frontend (Vercel)
- [ ] Soft launch to 10-20 athletes
- [ ] Collect feedback
- [ ] Iterate

---

## Upsell Strategy

**Free Tier:**
- View your SPARQ profile
- See top 3 recommended opportunities
- Chat with agent (10 messages/month)

**Pro Tier ($19.99/month):**
- Unlimited opportunity search
- Email drafting + templates
- Application tracking
- Proactive alerts when new opportunities match
- Coach research insights
- Priority support

**Target:** Convert 10-20% of free users to Pro within 30 days

---

## Example Conversation

```
Athlete: "I want to play D1 football"

Agent: "Based on your SPARQ score (117.3) and position (WR), 
        you're competitive for D1! I found 2 upcoming combines 
        within 150 miles:
        
        1. Elite West Coast Showcase (San Diego, 120mi)
           - 45+ D1 coaches expected
           - $150 entry
           - Fit score: 92/100
           
        2. USC WR Camp (Los Angeles, 15mi)
           - Direct exposure to USC staff
           - $200 entry
           - Fit score: 88/100
           
        Want me to draft registration emails for both?"

Athlete: "Yeah but I need scholarship help"

Agent: [remembers preference] "Got it. I also found California 
        State Showcase in Fresno (220mi) - they offer scholarship 
        assistance and it's only $100. Should I add that to your list?"
```

---

## Architecture

```
Athlete logs in → Frontend (Next.js)
                      ↓
                 POST /api/chat
                      ↓
           Backend (Agent SDK) with tools:
           - get_athlete_profile(user_id)
           - search_opportunities(position, location)
           - analyze_fit(opportunity_id, user_id)
           - draft_email(coach, school, user_id)
           - track_application(opportunity_id, status)
                      ↓
           Streams response back to frontend
           (text + tool usage + results)
```

---

## Why This Works

**Problem:** Athletes don't know what opportunities exist or which ones are right for them. Coaches/scouts are overwhelmed.

**Solution:** Every athlete gets a personal AI agent that knows their goals, monitors opportunities 24/7, and does the grunt work (research, emails, applications).

**Business Model:** Freemium → SaaS ($19.99/month) → 10K athletes = $200K MRR

---

**Status:** 🚀 Backend + Frontend running, ready to connect real data and test!
