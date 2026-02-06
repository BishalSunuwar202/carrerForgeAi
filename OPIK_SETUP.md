# Opik Integration Setup Guide

## ✅ Phase 1 Complete (Days 1-2)

We've successfully completed the foundation for Opik integration:

### What's Been Done:

1. **✅ Database Migration to PostgreSQL**
   - Updated `prisma/schema.prisma` to use PostgreSQL
   - Added Opik-related models: Feedback, SkillAssessment, LearningProgress, OpikExperiment
   - Extended Chat and Message models with Opik fields

2. **✅ Opik SDK Installed**
   - Package: `opik` installed and ready

3. **✅ Updated .gitignore**
   - Added PostgreSQL dumps exclusion
   - Added Opik cache exclusion

4. **✅ Opik Client Setup**
   - Created `/src/lib/opik/client.ts` - Opik SDK initialization

5. **✅ LLM-as-Judge Evaluator**
   - Created `/src/lib/opik/judges/skill-gap-judge.ts` - Judge prompts
   - Created `/src/lib/opik/evaluators/skill-gap-evaluator.ts` - Evaluation logic
   - Scores: Accuracy, Completeness, Relevance, False Positives, Actionability

6. **✅ Basic Tracing in Chat Route**
   - Modified `/src/app/chat/route.ts` with Opik integration hooks
   - Async evaluation triggered after AI responses

---

## 🔧 Next Steps: Configuration & Database Setup

### Step 1: Set Up PostgreSQL Database

**Option A: Local PostgreSQL (Development)**
```bash
# Install PostgreSQL (if not already installed)
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Linux

# Start PostgreSQL
brew services start postgresql  # macOS

# Create database
createdb careerforgeai
```

**Option B: Cloud PostgreSQL (Recommended for Hackathon)**

Choose one:
- **Supabase** (Free tier, easy setup): https://supabase.com/
- **Neon** (Serverless PostgreSQL): https://neon.tech/
- **Railway** (PostgreSQL + deployment): https://railway.app/

### Step 2: Update Environment Variables

Add to your `.env.local`:

```bash
# Database (REQUIRED - Replace with your actual PostgreSQL URL)
DATABASE_URL="postgresql://user:password@localhost:5432/careerforgeai"
# For Supabase/Neon/Railway, use their provided connection string

# Existing (already in your .env.local - DO NOT change)
GOOGLE_GENERATIVE_AI_API_KEY=your_existing_google_api_key
AUTH_SECRET=your_existing_auth_secret
AUTH_GOOGLE_ID=your_existing_google_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your_existing_google_client_secret

# NEW: Opik integration (Get from https://www.comet.com/opik)
OPIK_API_KEY=your_opik_api_key_here
OPIK_WORKSPACE=careerforgeai
OPIK_PROJECT=skill-gap-hackathon
```

### Step 3: Get Opik API Key

1. Go to https://www.comet.com/opik
2. Sign up / Log in
3. Create a new project: "skill-gap-hackathon"
4. Copy your API key
5. Add to `.env.local`

### Step 4: Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init-postgres-opik

# Verify migration worked
npx prisma studio  # Opens database browser
```

### Step 5: Test the Integration

```bash
# Start dev server
npm run dev

# Test at http://localhost:3000
# Upload a resume and check:
# 1. Skill gap analysis works
# 2. Console shows "Opik trace ID: ..." if OPIK_API_KEY is set
# 3. Check Opik dashboard for traces
```

---

## 📊 What's Integrated So Far

### Current Capabilities:

1. **Tracing**: Every chat request gets a unique trace ID
2. **Evaluation**: LLM-as-judge scores each skill gap analysis on 5 dimensions
3. **Async Processing**: Evaluation runs in background, doesn't slow down responses
4. **Database Ready**: Schema supports feedback, assessments, learning progress

### What Judges Will See:

- Trace IDs in response headers (`X-Opik-Trace-ID`)
- Evaluation scores logged to console (will be in Opik dashboard)
- Quality metrics: Accuracy, Completeness, Relevance scores

---

## 🚀 Phase 2 Tasks (Next - Days 3-4)

After completing setup above, implement:

1. **Golden Dataset** (20+ test scenarios)
2. **User Feedback UI** (thumbs up/down buttons)
3. **Guardrails** (hallucination detection, timeline validation)
4. **Regression Tests** (automated quality checks)

---

## 🔍 Troubleshooting

### "Opik is not enabled" message
- Check `OPIK_API_KEY` is set in `.env.local`
- Restart dev server after adding env vars

### Database connection errors
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Try connection: `psql $DATABASE_URL`

### Migration fails
- Delete `prisma/migrations` folder
- Run `npx prisma migrate reset` (WARNING: deletes data)
- Re-run migration

### TypeScript errors
- Run `npm install` to ensure all deps installed
- Restart IDE/editor
- Run `npx tsc --noEmit` to check for type errors

---

## 📝 Files Modified/Created

### Created:
- `/src/lib/opik/client.ts` - Opik SDK init
- `/src/lib/opik/judges/skill-gap-judge.ts` - Judge prompts
- `/src/lib/opik/evaluators/skill-gap-evaluator.ts` - Evaluation logic
- `/OPIK_SETUP.md` - This file

### Modified:
- `/prisma/schema.prisma` - PostgreSQL + Opik models
- `/.gitignore` - PostgreSQL & Opik exclusions
- `/src/app/chat/route.ts` - Opik integration
- `/package.json` - Opik dependency

---

## ✅ Success Criteria (Phase 1)

Before moving to Phase 2, verify:

- [ ] PostgreSQL database created and accessible
- [ ] `DATABASE_URL` set in `.env.local`
- [ ] `OPIK_API_KEY` obtained from Comet.com
- [ ] Database migration successful (`npx prisma migrate dev`)
- [ ] Dev server starts without errors
- [ ] Chat requests return `X-Opik-Trace-ID` header
- [ ] Console shows evaluation scores
- [ ] Opik dashboard shows traces (visit https://www.comet.com/opik)

---

**Ready for Phase 2?** Once all checkboxes above are complete, you're ready to implement the golden dataset and user feedback UI! 🎉
