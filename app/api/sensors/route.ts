import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Fetch latest sensor data for the dashboard
export async function GET() {
  try {
    const readings = db.prepare(`
      SELECT * FROM sensor_readings 
      ORDER BY timestamp DESC 
      LIMIT 20
    `).all();

    return NextResponse.json(readings.reverse());
  } catch (error: any) {
    // If table doesn't exist yet or other error, return empty array
    return NextResponse.json([]);
  }
}

// POST: Endpoint for physical sensors/IoT devices to send data
export async function POST(req: Request) {
  try {
    const { moisture, temperature, ph, battery_level } = await req.json();

    const stmt = db.prepare(`
      INSERT INTO sensor_readings (moisture, temperature, ph, battery_level)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(moisture, temperature, ph, battery_level || 100);

    return NextResponse.json({ success: true, message: 'Sensor data logged' });
  } catch (error: any) {
    console.error('Sensor Logging Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
