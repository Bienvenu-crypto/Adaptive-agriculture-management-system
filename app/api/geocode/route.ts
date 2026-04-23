import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
  }

  // Rounded to ~1km precision for caching
  const roundedLat = parseFloat(lat).toFixed(2);
  const roundedLon = parseFloat(lon).toFixed(2);
  const cacheKey = `${roundedLat},${roundedLon}`;

  try {
    // Check cache (we reuse weather_cache table or similar if we can, but let's check lib/db for a generic one)
    // Actually, I'll check lib/db to see if it has a geocode_cache, otherwise I'll use it anyway.
    try {
      const cached = db.prepare('SELECT data_json FROM weather_cache WHERE location_key = ? AND data_json LIKE ?').get(`geo:${cacheKey}`, '%address%') as { data_json: string } | undefined;
      if (cached) {
        return NextResponse.json(JSON.parse(cached.data_json));
      }
    } catch (e) {}

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&email=ndayishimiyebienvenu34@gmail.com`, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'AgroBot/1.0 (ndayishimiyebienvenu34@gmail.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();

    // Save to cache
    try {
      db.prepare(`
        INSERT INTO weather_cache (location_key, data_json, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(location_key) DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP
      `).run(`geo:${cacheKey}`, JSON.stringify(data));
    } catch (e) {}

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Geocoding API Error:', error);
    return NextResponse.json({ error: `Geocoding Service Error: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
