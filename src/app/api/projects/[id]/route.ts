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
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?').get(id, auth.userId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get scenes for this project
    const scenes = db.prepare('SELECT * FROM scenes WHERE projectId = ? ORDER BY orderNum').all(id);

    return NextResponse.json({ project, scenes });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const now = new Date().toISOString();

    // Check ownership
    const existing = db.prepare('SELECT id FROM projects WHERE id = ? AND userId = ?').get(id, auth.userId);
    
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE projects 
      SET name = ?, description = ?, status = ?, theme = ?, outline = ?, script = ?, settings = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(
      body.name,
      body.description || '',
      body.status || 'draft',
      body.theme || '',
      body.outline || '',
      body.script || '',
      JSON.stringify(body.settings || {}),
      now,
      id,
      auth.userId
    );

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check ownership
    const existing = db.prepare('SELECT id FROM projects WHERE id = ? AND userId = ?').get(id, auth.userId);
    
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete scenes first (cascade should handle this, but being explicit)
    db.prepare('DELETE FROM scenes WHERE projectId = ?').run(id);
    
    // Delete project
    db.prepare('DELETE FROM projects WHERE id = ? AND userId = ?').run(id, auth.userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
