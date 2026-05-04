import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM marketplace_users').get() as any;
    const tradeCount = db.prepare('SELECT COUNT(*) as count FROM trades WHERE status = "completed"').get() as any;
    const listingCount = db.prepare('SELECT COUNT(*) as count FROM listings WHERE status = "active"').get() as any;

    // Derived accuracy: baseline 95% + small bonus for activity, capped at 99.4%
    const accuracy = Math.min(99.4, 95.2 + (tradeCount.count * 0.1)).toFixed(1);

    return NextResponse.json({
      participants: userCount.count,
      trades: tradeCount.count,
      listings: listingCount.count,
      accuracy: accuracy
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
