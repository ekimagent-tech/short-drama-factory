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
    const project = db.getProjectById(id);
    
    if (!project || project.userId !== auth.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Find scene from project scenes
    const scenes = db.getScenesByProjectId(id);
    const scene = scenes.find((s: any) => s.id === sceneId);
    
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
    const project = db.getProjectById(id);
    
    if (!project || project.userId !== auth.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const scene = db.updateScene(sceneId, {
      orderNum: body.orderNum,
      duration: body.duration,
      description: body.description,
      characterDescription: body.characterDescription,
      cameraMovement: body.cameraMovement,
      dialogue: body.dialogue,
      backgroundMusic: body.backgroundMusic,
      emotionTag: body.emotionTag,
    });
    
    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    // Update project timestamp
    db.updateProject(id, { updatedAt: new Date().toISOString() });
    
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
    const project = db.getProjectById(id);
    
    if (!project || project.userId !== auth.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete scene
    db.deleteScene(sceneId);

    // Update project timestamp
    db.updateProject(id, { updatedAt: new Date().toISOString() });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scene:', error);
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
  }
}
