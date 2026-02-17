import { NextRequest, NextResponse } from 'next/server';

// Mock projects storage
const projects: any[] = [];

export async function GET(request: NextRequest) {
  // Return all projects
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newProject = {
      id: `project-${Date.now()}`,
      name: body.name || '新項目',
      description: body.description || '',
      status: 'draft',
      theme: body.theme,
      outline: body.outline,
      script: body.script,
      scenes: body.scenes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
