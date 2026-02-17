// Database abstraction layer - works on Vercel serverless
// Uses in-memory store for Vercel, SQLite for local development

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: string;
  theme?: string;
  outline?: string;
  script?: string;
  settings: string;
  createdAt: string;
  updatedAt: string;
}

interface Scene {
  id: string;
  projectId: string;
  orderNum: number;
  duration: number;
  description: string;
  characterDescription: string;
  cameraMovement: string;
  dialogue: string;
  backgroundMusic: string;
  emotionTag: string;
  createdAt: string;
  updatedAt: string;
}

interface Character {
  id: string;
  userId: string;
  name: string;
  description: string;
  imageUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for Vercel (resets on each cold start)
const memoryStore = {
  users: new Map<string, User>(),
  projects: new Map<string, Project>(),
  scenes: new Map<string, Scene>(),
  characters: new Map<string, Character>(),
};

// Check if we're in a persistent environment (local dev)
const isPersistent = process.env.VERCEL !== '1' && !process.env.NEXT_RUNTIME;

// SQLite for local development
let db: any = null;
let useSqlite = false;

if (isPersistent) {
  try {
    const Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');
    
    const dbPath = path.join(process.cwd(), 'data', 'short-drama.db');
    const dataDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    useSqlite = true;
    
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT DEFAULT 'draft',
        theme TEXT,
        outline TEXT,
        script TEXT,
        settings TEXT DEFAULT '{}',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS scenes (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        orderNum INTEGER NOT NULL,
        duration INTEGER DEFAULT 5,
        description TEXT DEFAULT '',
        characterDescription TEXT DEFAULT '',
        cameraMovement TEXT DEFAULT '',
        dialogue TEXT DEFAULT '',
        backgroundMusic TEXT DEFAULT '',
        emotionTag TEXT DEFAULT '',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        imageUrl TEXT,
        role TEXT DEFAULT 'supporting',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_projects_userId ON projects(userId);
      CREATE INDEX IF NOT EXISTS idx_scenes_projectId ON scenes(projectId);
      CREATE INDEX IF NOT EXISTS idx_characters_userId ON characters(userId);
    `);
    
    console.log('Using SQLite database');
  } catch (e) {
    console.log('SQLite not available, using in-memory store');
  }
}

// Wrapper functions that work with both stores
export const db = {
  // Users
  createUser: (user: Omit<User, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newUser = { ...user, createdAt: now, updatedAt: now };
    
    if (useSqlite && db) {
      db.prepare(`INSERT INTO users (id, name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(user.id, user.name, user.email, user.password, now, now);
      return newUser;
    }
    
    memoryStore.users.set(user.id, newUser);
    return newUser;
  },
  
  getUserByEmail: (email: string) => {
    if (useSqlite && db) {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }
    return Array.from(memoryStore.users.values()).find(u => u.email === email);
  },
  
  getUserById: (id: string) => {
    if (useSqlite && db) {
      return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    return memoryStore.users.get(id);
  },
  
  // Projects
  createProject: (project: Omit<Project, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject = { ...project, createdAt: now, updatedAt: now, settings: JSON.stringify(project.settings || {}) };
    
    if (useSqlite && db) {
      db.prepare(`INSERT INTO projects (id, userId, name, description, status, theme, outline, script, settings, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(project.id, project.userId, project.name, project.description, project.status, project.theme, project.outline, project.script, newProject.settings, now, now);
      return newProject;
    }
    
    memoryStore.projects.set(project.id, newProject);
    return newProject;
  },
  
  getProjectsByUserId: (userId: string) => {
    if (useSqlite && db) {
      return db.prepare('SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    }
    return Array.from(memoryStore.projects.values()).filter(p => p.userId === userId);
  },
  
  getProjectById: (id: string) => {
    if (useSqlite && db) {
      return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    }
    return memoryStore.projects.get(id);
  },
  
  updateProject: (id: string, updates: Partial<Project>) => {
    const now = new Date().toISOString();
    
    if (useSqlite && db) {
      const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const values = Object.values(updates).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
      db.prepare(`UPDATE projects SET ${fields}, updatedAt = ? WHERE id = ?`).run(...values, now, id);
      return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    }
    
    const existing = memoryStore.projects.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: now };
      memoryStore.projects.set(id, updated);
      return updated;
    }
    return null;
  },
  
  deleteProject: (id: string) => {
    if (useSqlite && db) {
      db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    }
    memoryStore.projects.delete(id);
  },
  
  // Scenes
  createScene: (scene: Omit<Scene, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newScene = { ...scene, createdAt: now, updatedAt: now };
    
    if (useSqlite && db) {
      db.prepare(`INSERT INTO scenes (id, projectId, orderNum, duration, description, characterDescription, cameraMovement, dialogue, backgroundMusic, emotionTag, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(scene.id, scene.projectId, scene.orderNum, scene.duration, scene.description, scene.characterDescription, scene.cameraMovement, scene.dialogue, scene.backgroundMusic, scene.emotionTag, now, now);
      return newScene;
    }
    
    memoryStore.scenes.set(scene.id, newScene);
    return newScene;
  },
  
  getScenesByProjectId: (projectId: string) => {
    if (useSqlite && db) {
      return db.prepare('SELECT * FROM scenes WHERE projectId = ? ORDER BY orderNum').all(projectId);
    }
    return Array.from(memoryStore.scenes.values()).filter(s => s.projectId === projectId).sort((a, b) => a.orderNum - b.orderNum);
  },
  
  updateScene: (id: string, updates: Partial<Scene>) => {
    const now = new Date().toISOString();
    
    if (useSqlite && db) {
      const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const values = Object.values(updates);
      db.prepare(`UPDATE scenes SET ${fields}, updatedAt = ? WHERE id = ?`).run(...values, now, id);
      return db.prepare('SELECT * FROM scenes WHERE id = ?').get(id);
    }
    
    const existing = memoryStore.scenes.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: now };
      memoryStore.scenes.set(id, updated);
      return updated;
    }
    return null;
  },
  
  deleteScene: (id: string) => {
    if (useSqlite && db) {
      db.prepare('DELETE FROM scenes WHERE id = ?').run(id);
    }
    memoryStore.scenes.delete(id);
  },
  
  // Characters
  createCharacter: (character: Omit<Character, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newCharacter = { ...character, createdAt: now, updatedAt: now };
    
    if (useSqlite && db) {
      db.prepare(`INSERT INTO characters (id, userId, name, description, imageUrl, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(character.id, character.userId, character.name, character.description, character.imageUrl, character.role, now, now);
      return newCharacter;
    }
    
    memoryStore.characters.set(character.id, newCharacter);
    return newCharacter;
  },
  
  getCharactersByUserId: (userId: string) => {
    if (useSqlite && db) {
      return db.prepare('SELECT * FROM characters WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    }
    return Array.from(memoryStore.characters.values()).filter(c => c.userId === userId);
  },
  
  getCharacterById: (id: string) => {
    if (useSqlite && db) {
      return db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    }
    return memoryStore.characters.get(id);
  },
  
  updateCharacter: (id: string, updates: Partial<Character>) => {
    const now = new Date().toISOString();
    
    if (useSqlite && db) {
      const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const values = Object.values(updates);
      db.prepare(`UPDATE characters SET ${fields}, updatedAt = ? WHERE id = ?`).run(...values, now, id);
      return db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    }
    
    const existing = memoryStore.characters.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: now };
      memoryStore.characters.set(id, updated);
      return updated;
    }
    return null;
  },
  
  deleteCharacter: (id: string) => {
    if (useSqlite && db) {
      db.prepare('DELETE FROM characters WHERE id = ?').run(id);
    }
    memoryStore.characters.delete(id);
  },
};

export default db;
