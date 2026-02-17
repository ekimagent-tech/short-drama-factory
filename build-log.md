# 短劇工廠 - Build Log

## 2026-02-17

### ✅ Completed
1. Project init: Next.js + TS + Tailwind
2. State: Auth & Project stores
3. Core pages: Projects, Creative
4. **User Registration (/register)** - Complete registration form with name, email, password, confirm password
5. **Full Creative Flow (/creative)** - 4-step flow:
   - Step 1: Theme input → AI generates 3-5 outlines
   - Step 2: Outline selection → generate full script
   - Step 3: Script preview/edit
   - Step 4: Auto-generate scenes from script
6. **Project Detail Page (/projects/[id])** - Show project details, scenes list, edit settings
7. **Scene Editor (/projects/[id]/scenes/[sceneId])** - Edit scene: duration, description, characters, camera, dialogue, BGM, emotion tags
8. **Settings/Parameters** - Scene duration (3-10s), Aspect ratio (9:16, 16:9, 1:1, 4:3), Total length (30s/60s/90s), Quality (720p/1080p/4K), Frame rate (24/30/60), Style presets
9. **Characters Page (/characters)** - Character list, add character form, generate character image (mock)
10. **API Routes** (all with JWT auth):
    - /api/auth/register
    - /api/auth/login
    - /api/projects (CRUD)
    - /api/projects/[id]
    - /api/projects/[id]/scenes
    - /api/projects/[id]/scenes/[sceneId]
    - /api/characters
    - /api/creative/generate-outlines
    - /api/creative/generate-script
    - /api/creative/generate-scenes

## 2026-02-17 (MVP Complete)

### ✅ All 4 Features Implemented

#### 1. SQLite Database (better-sqlite3)
- Created schema: users, projects, scenes, characters
- All data persists in SQLite (data/short-drama.db)
- Foreign key relationships with CASCADE delete

#### 2. Real JWT Authentication
- Installed: jsonwebtoken, bcryptjs
- Generated tokens with proper signing
- Auth middleware protects all API routes
- Login/register return real JWT tokens

#### 3. Data Persistence
- Projects stored in SQLite (not localStorage)
- Users stored in SQLite (password hashed with bcrypt)
- Characters stored in SQLite
- Scenes stored in SQLite

#### 4. Ollama AI Integration
- Updated generate-outlines → calls Ollama
- Updated generate-script → calls Ollama
- Configurable via environment variables:
  - OLLAMA_URL (default: http://host.docker.internal:11434)
  - OLLAMA_MODEL (default: qwen:7b)
  - USE_MOCK_AI (set to 'true' for Vercel without Ollama)
- Fallback to mock responses when Ollama unavailable

### 📁 Location
/workspace/short-drama-factory-local/

### 🔗 Vercel Deployment
https://short-drama-factory-local.vercel.app

### ⚠️ Note (Updated 2026-02-17 02:55 UTC)
- Fixed: Database now works on Vercel serverless using in-memory fallback
- SQLite used locally, in-memory store used on Vercel (cold start resets data)
- GitHub push successful ✅
