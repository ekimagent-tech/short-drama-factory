import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { authMiddleware, AuthenticatedRequest } from '@/lib/middleware';

export async function GET(request: AuthenticatedRequest) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = db.getProjectsByUserId(auth.userId);
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

    const project = db.createProject({
      id: projectId,
      userId: auth.userId,
      name: body.name || '新項目',
      description: body.description || '',
      status: 'draft',
      theme: body.theme || '',
      outline: body.outline || '',
      script: body.script || '',
      settings: body.settings || {},
    });
    
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
