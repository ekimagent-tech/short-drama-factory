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

## 2026-02-17 (Feature Update)

### ✅ New Features Implemented

#### 1. AI Suggestion Generation (一鍵AI建議)
- Created `/api/ai/suggest` API route with Ollama integration
- Added "一鍵AI建議" buttons to:
  - **Project Detail** - Auto-fill project name & description
  - **New Project** - AI suggestion when creating project
  - **Scene Editor** - Auto-fill: description, character, camera, dialogue, BGM, emotion
  - **Character Page** - AI suggestion for name, description, role (protagonist/supporting)
- Fallback to mock responses when Ollama unavailable

#### 2. Generation Queue (生成隊列)
- Created `/api/queue` API route
- In-memory queue system with status tracking
- Queue status visible in project detail page
- Cancel pending tasks functionality
- Status: pending/processing/completed/failed

#### 3. Download Functionality (下載功能)
- Added download buttons in project detail:
  - **Script (TXT)** - Download script as plain text
  - **Scenes (JSON)** - Download all scenes as JSON
  - **Project (ZIP)** - Download complete project as ZIP using JSZip
- Client-side generation using Blob API

#### 4. Email Notifications (郵件通知)
- Created `/api/notify` API route
- Added email settings:
  - Email input field in settings page
  - Email notifications toggle
- Send notifications on:
  - Generation completes
  - Generation fails (with error details)
- Mock implementation (logs to console)

#### 5. Video Quality Settings
- Updated quality options: 360p (default), 480p, 720p
- Settings page UI updated to reflect new options
- Persisted in settings store

### 2026-02-17 (AI Generation APIs)

#### 1. Gmail Email Notifications (/api/notify)
- Updated to use real Gmail via nodemailer + OAuth2
- Uses credentials from `/home/node/.openclaw/workspace/config/google/`
- Falls back to mock (console log) when Gmail unavailable
- Supports:
  - Generation complete notifications
  - Generation failure notifications with error details

#### 2. ComfyUI Image Generation (/api/generate/image)
- Created new API route for AI image generation
- Calls ComfyUI API at http://host.docker.internal:8188
- Supports parameters:
  - prompt (required)
  - negativePrompt
  - width, height (default: 512x768)
  - steps (default: 20)
  - cfg (default: 8)
  - seed, model
- Falls back to mock when ComfyUI unavailable
- GET endpoint checks ComfyUI status

#### 3. Video Generation (/api/generate/video)
- Created new API route for AI video generation
- Accepts images array + optional prompt
- Supports parameters:
  - images (required, array of image URLs)
  - prompt (optional)
  - duration (default: 5s)
  - fps (default: 24)
  - width, height (default: 512x768)
- Checks for LTX_VIDEO_URL environment variable
- Falls back to mock mode when not available
- GET endpoint checks video service status

#### Dependencies Added
- nodemailer (for Gmail)
- @types/nodemailer
