import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { messages, user_email, session_id } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO chats (id, user_email, session_id, role, content, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((msgs) => {
      for (const msg of msgs) {
        stmt.run(msg.id, user_email || 'anonymous', session_id, msg.role, msg.content, msg.image || null);
      }
    });

    insertMany(messages);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const sessionId = searchParams.get('session_id');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (sessionId) {
      const stmt = db.prepare(`
        SELECT id, role, content, image_url as image 
        FROM chats 
        WHERE user_email = ? AND session_id = ?
        ORDER BY timestamp ASC
      `);
      const chats = stmt.all(email, sessionId);
      return NextResponse.json({ chats });
    } else {
      // Return a list of sessions
      const stmt = db.prepare(`
        SELECT session_id, MIN(timestamp) as started_at, content as first_message
        FROM chats 
        WHERE user_email = ? 
        GROUP BY session_id
        ORDER BY started_at DESC
      `);
      const sessions = stmt.all(email);
      return NextResponse.json({ sessions });
    }
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

