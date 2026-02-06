# Supabase & Opik Setup Guide

This guide will help you set up Supabase PostgreSQL database and Opik observability platform for the CareerForgeAI hackathon project.

---

## Part 1: Supabase PostgreSQL Setup

### Step 1: Create Supabase Account & Project

1. **Go to Supabase**
   - Visit: https://supabase.com/
   - Click "Start your project"
   - Sign up with GitHub (recommended) or email

2. **Create New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Fill in project details:
     - **Name**: `careerforgeai` (or any name you prefer)
     - **Database Password**: Generate a strong password (SAVE THIS - you'll need it)
     - **Region**: Choose closest to you (e.g., `us-west-1` for California)
     - **Pricing Plan**: Free tier is fine for development
   - Click "Create new project"
   - Wait 2-3 minutes for provisioning

### Step 2: Get Database Connection String

1. **Navigate to Database Settings**
   - In your Supabase project dashboard
   - Click "Project Settings" (gear icon in sidebar)
   - Click "Database" in the left menu

2. **Find Connection Pooling URL** (Recommended)
   - Scroll to "Connection Pooling" section
   - You'll see a connection string like:
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
     ```
   - **Mode**: Select `Session` (better for Prisma)
   - Click "Copy" to copy the full connection string

3. **Alternative: Direct Connection URL**
   - If Connection Pooling doesn't work, use "Connection string" section
   - Format:
     ```
     postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

4. **Important Notes**:
   - Replace `[PASSWORD]` with your actual database password from Step 1
   - The connection string will have `?sslmode=require` at the end - keep this for security
   - Connection Pooling URL uses port `6543`
   - Direct connection URL uses port `5432`

### Step 3: Update .env.local

1. **Open `.env.local` in your project**

2. **Replace the DATABASE_URL placeholder**:
   ```bash
   DATABASE_URL="postgresql://postgres.abcdefgh:YOUR_PASSWORD_HERE@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require"
   ```

3. **Example** (with fake credentials):
   ```bash
   DATABASE_URL="postgresql://postgres.xyzproject:MySecurePassword123@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require"
   ```

### Step 4: Test Connection

Run this command to verify Prisma can connect:
```bash
npx prisma db pull
```

If successful, you'll see: "Introspecting based on datasource..."

---

## Part 2: Opik Setup

### Step 1: Create Opik Account

1. **Go to Opik**
   - Visit: https://www.comet.com/opik
   - Click "Get Started" or "Sign Up"
   - Sign up with:
     - Email (recommended for hackathon projects)
     - OR GitHub/Google

2. **Complete Onboarding**
   - Fill in your name and organization
   - Select "Individual" or "Team" (Individual is fine)
   - Skip any optional steps

### Step 2: Create Opik Project

1. **Create New Project**
   - After logging in, you'll see the Opik dashboard
   - Click "New Project" or "Create Project"
   - Project details:
     - **Name**: `skill-gap-hackathon` (matches your plan)
     - **Description**: "CareerForgeAI - Skill gap analysis with LLM-as-judge evaluation"
   - Click "Create"

2. **Set Workspace** (if needed)
   - Workspace is usually your username or organization name
   - Default workspace: Your username (e.g., `bishalsunuwar`)
   - You can change `OPIK_WORKSPACE` in .env.local to match

### Step 3: Get API Key

1. **Navigate to Settings**
   - Click your profile icon (top right)
   - Select "Settings" or "API Keys"

2. **Create API Key**
   - Click "Create New API Key" or "Generate API Key"
   - Name it: `CareerForgeAI Hackathon`
   - **Important**: Copy the API key immediately - it won't be shown again!
   - Format looks like: `opk_live_abc123def456...` (long alphanumeric string)

3. **Save API Key Securely**
   - Store in password manager or temporary secure note
   - You'll add it to `.env.local` next

### Step 4: Update .env.local

1. **Replace Opik placeholders**:
   ```bash
   OPIK_API_KEY="opk_live_YOUR_ACTUAL_API_KEY_HERE"
   OPIK_WORKSPACE="your-username-or-workspace"
   OPIK_PROJECT="skill-gap-hackathon"
   ```

2. **Example** (with fake credentials):
   ```bash
   OPIK_API_KEY="opk_live_abc123def456ghi789jkl012mno345pqr678"
   OPIK_WORKSPACE="bishalsunuwar"
   OPIK_PROJECT="skill-gap-hackathon"
   ```

3. **Verify Workspace Name**:
   - Check Opik dashboard URL: `https://www.comet.com/opik/YOUR_WORKSPACE/...`
   - Use `YOUR_WORKSPACE` as `OPIK_WORKSPACE` value

---

## Part 3: Database Migration

Once both DATABASE_URL and OPIK credentials are set:

### Step 1: Generate Prisma Client

```bash
npx prisma generate
```

This creates TypeScript types for your database models.

### Step 2: Create Migration

```bash
npx prisma migrate dev --name init-postgres-opik
```

This will:
- Create migration files in `prisma/migrations/`
- Apply migration to your Supabase database
- Create all tables: User, Chat, Message, Feedback, SkillAssessment, LearningProgress, OpikExperiment

**Expected Output**:
```
✔ Generated Prisma Client
✔ Database schema created
✔ Migration applied successfully
```

### Step 3: Verify Migration

```bash
npx prisma studio
```

This opens a database browser at http://localhost:5555
- You should see all your tables listed
- Check that Chat, Message, Feedback, etc. exist

---

## Part 4: Test Integration

### Step 1: Start Dev Server

```bash
npm run dev
```

### Step 2: Test Chat Endpoint

1. Open http://localhost:3000
2. Upload a resume PDF
3. Ask about skill gaps
4. Check console logs for:
   ```
   Opik trace ID: trace-1234567890-abc123
   Async evaluation complete: { overall: 75, opikTraceId: 'trace-...' }
   ```

### Step 3: Check Opik Dashboard

1. Go to https://www.comet.com/opik
2. Navigate to your project: `skill-gap-hackathon`
3. You should see:
   - Traces from chat requests
   - Evaluation scores
   - Metrics logged

---

## Troubleshooting

### Supabase Issues

**"Error: P1001: Can't reach database server"**
- Check DATABASE_URL is correctly copied
- Verify your IP is allowed (Supabase > Project Settings > Database > Connection Pooling > "Disable connection pooling" if needed)
- Try direct connection URL instead of pooling URL

**"Error: P3009: migrate found failed migrations"**
- Delete `prisma/migrations` folder
- Run `npx prisma migrate dev --name init-fresh`

**"SSL error"**
- Ensure `?sslmode=require` is at the end of DATABASE_URL
- Or try adding `?sslmode=prefer`

### Opik Issues

**Console shows "Opik is not enabled"**
- Check OPIK_API_KEY is set in `.env.local`
- Restart dev server: `npm run dev`
- Verify no typos in env variable names

**"401 Unauthorized" from Opik**
- API key is invalid or expired
- Regenerate API key in Opik dashboard
- Update .env.local with new key

**No traces appearing in Opik dashboard**
- Check console for errors
- Verify workspace and project names match exactly
- Try creating a new project in Opik

### General Issues

**TypeScript errors after migration**
- Run `npx prisma generate` to regenerate types
- Restart VS Code / IDE
- Run `npm run build` to check for type errors

**"Module not found: opik"**
- Run `npm install` to ensure opik package is installed
- Check package.json has `"opik": "^..."` listed

---

## Final .env.local Checklist

Your `.env.local` should have **7 environment variables**:

```bash
# Google AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=AIza... (YOUR ACTUAL KEY)

# NextAuth Configuration
AUTH_SECRET=pNY6n... (YOUR ACTUAL SECRET)
AUTH_GOOGLE_ID=613229... (YOUR ACTUAL CLIENT ID)
AUTH_GOOGLE_SECRET=GOCSPX-... (YOUR ACTUAL CLIENT SECRET)

# Database Configuration (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require"

# Opik Integration
OPIK_API_KEY="opk_live_xxxxxxxxxxxxxxxx"
OPIK_WORKSPACE="your-workspace-name"
OPIK_PROJECT="skill-gap-hackathon"
```

✅ **All set!** Once these are configured, run the migration commands and start building Phase 2 features.

---

## Next Steps

After successful setup:

1. ✅ Verify all environment variables are set
2. ✅ Run `npx prisma migrate dev`
3. ✅ Test chat endpoint with Opik tracing
4. ✅ Check Opik dashboard for traces
5. 🚀 Move to Phase 2: Golden dataset & user feedback UI

**Need help?** Check:
- Supabase docs: https://supabase.com/docs/guides/database
- Opik docs: https://www.comet.com/docs/opik
- Prisma docs: https://www.prisma.io/docs/getting-started
