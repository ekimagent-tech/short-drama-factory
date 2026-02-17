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
    const project = db.getProjectById(id);

    if (!project || project.userId !== auth.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get scenes for this project
    const scenes = db.getScenesByProjectId(id);

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

    // Check ownership
    const existing = db.getProjectById(id);
    
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = db.updateProject(id, {
      name: body.name,
      description: body.description,
      status: body.status,
      theme: body.theme,
      outline: body.outline,
      script: body.script,
      settings: body.settings,
    });
    
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
    const existing = db.getProjectById(id);
    
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete project
    db.deleteProject(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
