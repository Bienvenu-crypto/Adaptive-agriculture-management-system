import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

async function getMarketplaceUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('mp_session')?.value;
  if (!sessionId) return null;

  const session = db
    .prepare('SELECT user_id, expires_at FROM marketplace_sessions WHERE id = ?')
    .get(sessionId) as any;
  if (!session || new Date(session.expires_at) < new Date()) return null;

  return db.prepare('SELECT * FROM marketplace_users WHERE id = ?').get(session.user_id) as any;
}

// GET /api/marketplace/stats — fetch impressions and clicks for current seller
export async function GET() {
  try {
    const user = await getMarketplaceUser();
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const impressions = db.prepare('SELECT COUNT(*) as count FROM marketplace_analytics WHERE seller_id = ? AND type = "impression"').get(user.id) as any;
    const clicks = db.prepare('SELECT COUNT(*) as count FROM marketplace_analytics WHERE seller_id = ? AND type = "click"').get(user.id) as any;

    // Calculate growth (mocked for now, but reflecting data)
    // In a real app, you'd compare with yesterday's counts
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayImpressions = db.prepare('SELECT COUNT(*) as count FROM marketplace_analytics WHERE seller_id = ? AND type = "impression" AND date(timestamp) = ?').get(user.id, yesterdayStr) as any;
    const yesterdayClicks = db.prepare('SELECT COUNT(*) as count FROM marketplace_analytics WHERE seller_id = ? AND type = "click" AND date(timestamp) = ?').get(user.id, yesterdayStr) as any;

    const impGrowth = yesterdayImpressions.count > 0 ? ((impressions.count - yesterdayImpressions.count) / yesterdayImpressions.count) * 100 : 0;
    const clickGrowth = yesterdayClicks.count > 0 ? ((clicks.count - yesterdayClicks.count) / yesterdayClicks.count) * 100 : 0;

    return NextResponse.json({
      impressions: impressions.count,
      clicks: clicks.count,
      impGrowth: impGrowth.toFixed(1),
      clickGrowth: clickGrowth.toFixed(1)
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

// POST /api/marketplace/stats — record a click on a listing
export async function POST(req: Request) {
  try {
    const { listingId, sellerId } = await req.json();
    if (!sellerId) return NextResponse.json({ error: 'Missing seller ID' }, { status: 400 });

    db.prepare('INSERT INTO marketplace_analytics (seller_id, type, listing_id) VALUES (?, ?, ?)')
      .run(sellerId, 'click', listingId || null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 });
  }
}
