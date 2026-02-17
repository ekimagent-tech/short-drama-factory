import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { authMiddleware, AuthenticatedRequest } from '@/lib/middleware';

export async function GET(request: AuthenticatedRequest) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const characters = db.prepare('SELECT * FROM characters WHERE userId = ? ORDER BY createdAt DESC').all(auth.userId);
    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

export async function POST(request: AuthenticatedRequest) {
  const auth = authMiddleware(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const characterId = `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO characters (id, userId, name, description, imageUrl, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      characterId,
      auth.userId,
      body.name || '新角色',
      body.description || '',
      body.imageUrl || '',
      body.role || 'supporting',
      now,
      now
    );

    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(characterId);
    
    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
