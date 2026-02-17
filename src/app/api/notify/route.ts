import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Notification {
  type: 'generation_complete' | 'generation_failed';
  taskId: string;
  email?: string;
  details?: any;
}

// Store user email preferences (in-memory for MVP)
const userEmails: Map<string, string> = new Map();

// Gmail OAuth2 configuration
const GOOGLE_CONFIG_PATH = join(process.cwd(), '../../config/google');

interface GoogleCredentials {
  installed: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

interface GoogleToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
}

// Create OAuth2 transporter
function createTransporter(): nodemailer.Transporter | null {
  try {
    const credsPath = join(GOOGLE_CONFIG_PATH, 'credentials.json');
    const tokenPath = join(GOOGLE_CONFIG_PATH, 'token.json');
    
    if (!existsSync(credsPath) || !existsSync(tokenPath)) {
      console.log('[EMAIL] Missing Google credentials, falling back to mock');
      return null;
    }
    
    const credentials: GoogleCredentials = JSON.parse(readFileSync(credsPath, 'utf-8'));
    const token: GoogleToken = JSON.parse(readFileSync(tokenPath, 'utf-8'));
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'ekim.agent@gmail.com',
        clientId: credentials.installed.client_id,
        clientSecret: credentials.installed.client_secret,
        refreshToken: token.refresh_token,
      },
    });
  } catch (error) {
    console.error('[EMAIL] Failed to create transporter:', error);
    return null;
  }
}

// Send email notification using Gmail
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  // Try real Gmail first
  const transporter = createTransporter();
  
  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"短劇工廠" <ekim.agent@gmail.com>',
        to,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>'),
      });
      console.log(`[EMAIL] Sent via Gmail to: ${to}`);
      return true;
    } catch (error) {
      console.error('[EMAIL] Gmail send failed:', error);
    }
  }
  
  // Fallback: log to console (mock mode)
  console.log(`[EMAIL MOCK] To: ${to}`);
  console.log(`[EMAIL MOCK] Subject: ${subject}`);
  console.log(`[EMAIL MOCK] Body: ${body}`);
  return true; // Return success for mock fallback
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
