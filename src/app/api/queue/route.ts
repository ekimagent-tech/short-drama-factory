import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export interface QueueTask {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: string;
}

// In-memory queue (for MVP, can be replaced with Redis later)
const queue: Map<string, QueueTask> = new Map();

// Process queue task
async function processTask(task: QueueTask): Promise<void> {
  task.status = 'processing';
  
  try {
    // Simulate processing (in real implementation, this would call AI services)
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      task.progress = i;
    }
    
    // Generate mock result based on task type
    if (task.type === 'scene') {
      task.result = {
        description: 'AI 生成的場景描述',
        characterDescription: 'AI 生成的角色描述',
        cameraMovement: 'AI 建議的鏡頭運動',
        dialogue: 'AI 生成的對話',
        backgroundMusic: 'AI 建議的背景音樂',
        emotionTag: 'AI 建議的情緒標籤',
      };
    } else if (task.type === 'character') {
      task.result = {
        name: 'AI 建議的角色名稱',
        description: 'AI 生成的角色描述',
        role: 'protagonist',
      };
    } else if (task.type === 'project') {
      task.result = {
        name: 'AI 建議的項目名稱',
        description: 'AI 生成的項目描述',
      };
    }
    
    task.status = 'completed';
    task.progress = 100;
  } catch (error: any) {
    task.status = 'failed';
    task.error = error.message || 'Unknown error';
  }
}

// Process queue in background
function startQueueProcessor(): void {
  setInterval(async () => {
    for (const [id, task] of queue) {
      if (task.status === 'pending') {
        await processTask(task);
      }
    }
  }, 1000);
}

// Start processor
startQueueProcessor();

// GET - Get queue status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = Array.from(queue.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ queue: tasks });
  } catch (error) {
    console.error('Error getting queue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add task to queue
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, context } = body;

    if (!type) {
      return NextResponse.json({ error: 'Missing type' }, { status: 400 });
    }

    const task: QueueTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    queue.set(task.id, task);

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error adding to queue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Cancel pending task
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Missing task id' }, { status: 400 });
    }

    const task = queue.get(taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status !== 'pending') {
      return NextResponse.json({ error: 'Cannot cancel task that is not pending' }, { status: 400 });
    }

    queue.delete(taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
