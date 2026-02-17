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
    const project = db.getProjectById(id);
    
    if (!project || project.userId !== auth.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const scenes = db.getScenesByProjectId(id);
    
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
    const project = db.getProjectById(id);
    
    if (!project || project.userId !== auth.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get max order
    const scenes = db.getScenesByProjectId(id);
    const orderNum = scenes.length + 1;

    const scene = db.createScene({
      id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: id,
      orderNum,
      duration: body.duration || 5,
      description: body.description || '',
      characterDescription: body.characterDescription || '',
      cameraMovement: body.cameraMovement || '',
      dialogue: body.dialogue || '',
      backgroundMusic: body.backgroundMusic || '',
      emotionTag: body.emotionTag || '',
    });

    // Update project timestamp
    db.updateProject(id, { updatedAt: new Date().toISOString() });
    
    return NextResponse.json({ scene }, { status: 201 });
  } catch (error) {
    console.error('Error creating scene:', error);
    return NextResponse.json({ error: 'Failed to create scene' }, { status: 500 });
  }
}
