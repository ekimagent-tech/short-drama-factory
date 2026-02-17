import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { authMiddleware, AuthenticatedRequest } from '@/lib/middleware';

export async function GET(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // Check project ownership
    const project = db.prepare('SELECT id FROM projects WHERE id = ? AND userId = ?').get(id, auth.userId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const scenes = db.prepare('SELECT * FROM scenes WHERE projectId = ? ORDER BY orderNum').all(id);
    
    return NextResponse.json({ scenes });
  } catch (error) {
    console.error('Error fetching scenes:', error);
    return NextResponse.json({ error: 'Failed to fetch scenes' }, { status: 500 });
  }
}

export async function POST(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check project ownership
    const project = db.prepare('SELECT id FROM projects WHERE id = ? AND userId = ?').get(id, auth.userId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const sceneId = `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Get max order
    const maxOrder = db.prepare('SELECT MAX(orderNum) as max FROM scenes WHERE projectId = ?').get(id) as any;
    const orderNum = (maxOrder?.max || 0) + 1;

    db.prepare(`
      INSERT INTO scenes (id, projectId, orderNum, duration, description, characterDescription, cameraMovement, dialogue, backgroundMusic, emotionTag, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sceneId,
      id,
      orderNum,
      body.duration || 5,
      body.description || '',
      body.characterDescription || '',
      body.cameraMovement || '',
      body.dialogue || '',
      body.backgroundMusic || '',
      body.emotionTag || '',
      now,
      now
    );

    // Update project timestamp
    db.prepare('UPDATE projects SET updatedAt = ? WHERE id = ?').run(now, id);

    const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(sceneId);
    
    return NextResponse.json({ scene }, { status: 201 });
  } catch (error) {
    console.error('Error creating scene:', error);
    return NextResponse.json({ error: 'Failed to create scene' }, { status: 500 });
  }
}
