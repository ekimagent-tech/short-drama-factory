import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { authMiddleware, AuthenticatedRequest } from '@/lib/middleware';

export async function GET(request: AuthenticatedRequest) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = db.prepare(`
      SELECT * FROM projects WHERE userId = ? ORDER BY updatedAt DESC
    `).all(auth.userId);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: AuthenticatedRequest) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO projects (id, userId, name, description, status, theme, outline, script, settings, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      auth.userId,
      body.name || '新項目',
      body.description || '',
      'draft',
      body.theme || '',
      body.outline || '',
      body.script || '',
      JSON.stringify(body.settings || {}),
      now,
      now
    );

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
