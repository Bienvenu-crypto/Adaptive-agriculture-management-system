import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('mp_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = db
      .prepare('SELECT user_id FROM marketplace_sessions WHERE id = ?')
      .get(sessionId) as any;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await req.json();
    console.log(`Processing 100,000 UGX payment from ${phone} to +256765636479`);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update user subscription status
    db.prepare('UPDATE marketplace_users SET is_subscribed = 1 WHERE id = ?').run(session.user_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
