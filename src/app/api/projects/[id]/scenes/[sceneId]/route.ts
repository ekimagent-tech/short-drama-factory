import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { authMiddleware, AuthenticatedRequest } from '@/lib/middleware';

export async function GET(
  request: AuthenticatedRequest, 
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, sceneId } = await params;
    
    // Check project ownership
    const project = db.prepare('SELECT id FROM projects WHERE id = ? AND userId = ?').get(id, auth.userId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const scene = db.prepare('SELECT * FROM scenes WHERE id = ? AND projectId = ?').get(sceneId, id);
    
    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    return NextResponse.json({ scene });
  } catch (error) {
    console.error('Error fetching scene:', error);
    return NextResponse.json({ error: 'Failed to fetch scene' }, { status: 500 });
  }
}

export async function PUT(
  request: AuthenticatedRequest, 
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, sceneId } = await params;
    const body = await request.json();
    
    // Check project ownership
    const project = db.prepare('SELECT id FROM projects WHERE id = ? AND userId = ?').get(id, auth.userId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check scene exists
    const existing = db.prepare('SELECT id FROM scenes WHERE id = ? AND projectId = ?').get(sceneId, id);
    
    if (!existing) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE scenes 
      SET orderNum = ?, duration = ?, description = ?, characterDescription = ?, cameraMovement = ?, dialogue = ?, backgroundMusic = ?, emotionTag = ?, updatedAt = ?
      WHERE id = ? AND projectId = ?
    `).run(
      body.orderNum,
      body.duration || 5,
      body.description || '',
      body.characterDescription || '',
      body.cameraMovement || '',
      body.dialogue || '',
      body.backgroundMusic || '',
      body.emotionTag || '',
      now,
      sceneId,
      id
    );

    // Update project timestamp
    db.prepare('UPDATE projects SET updatedAt = ? WHERE id = ?').run(now, id);

    const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(sceneId);
    
    return NextResponse.json({ scene });
  } catch (error) {
    console.error('Error updating scene:', error);
    return NextResponse.json({ error: 'Failed to update scene' }, { status: 500 });
  }
}

export async function DELETE(
  request: AuthenticatedRequest, 
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, sceneId } = await params;
    
    // Check project ownership
    const project = db.prepare('SELECT id FROM projects WHERE id = ? AND userId = ?').get(id, auth.userId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check scene exists
    const existing = db.prepare('SELECT id FROM scenes WHERE id = ? AND projectId = ?').get(sceneId, id);
    
    if (!existing) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Delete scene
    db.prepare('DELETE FROM scenes WHERE id = ? AND projectId = ?').run(sceneId, id);

    // Update project timestamp
    db.prepare('UPDATE projects SET updatedAt = ? WHERE id = ?').run(now, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scene:', error);
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
  }
}
