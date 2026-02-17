import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

interface Notification {
  type: 'generation_complete' | 'generation_failed';
  taskId: string;
  email?: string;
  details?: any;
}

// Store user email preferences (in-memory for MVP)
const userEmails: Map<string, string> = new Map();

// Send email notification (mock for MVP)
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  // In production, integrate with SendGrid, Resend, or other email service
  console.log(`[EMAIL] To: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] Body: ${body}`);
  
  // Mock success
  return true;
}

// POST - Send notification
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, taskId, email, details } = body;

    if (!type || !taskId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's email
    const userEmail = email || userEmails.get(token) || '';
    
    if (!userEmail) {
      console.log('[NOTIFY] No email configured, skipping notification');
      return NextResponse.json({ success: true, message: 'No email configured' });
    }

    let subject = '';
    let message = '';

    if (type === 'generation_complete') {
      subject = '短劇工廠 - 生成完成';
      message = `您的 AI 生成任務已完成！\n\n任務 ID: ${taskId}\n詳情: ${JSON.stringify(details, null, 2)}`;
    } else if (type === 'generation_failed') {
      subject = '短劇工廠 - 生成失敗';
      message = `您的 AI 生成任務失敗了。\n\n任務 ID: ${taskId}\n錯誤詳情: ${details?.error || 'Unknown error'}`;
    }

    const success = await sendEmail(userEmail, subject, message);

    return NextResponse.json({ success, message: success ? 'Notification sent' : 'Failed to send' });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user email preference
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    userEmails.set(token, email);

    return NextResponse.json({ success: true, message: 'Email preference updated' });
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
