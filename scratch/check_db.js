const sqlite3 = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../agrobot.db');
const db = new sqlite3(dbPath);
try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', tables.map(t => t.name));
    
    const analytics = db.prepare('SELECT count(*) as count FROM marketplace_analytics').get();
    console.log('Analytics count:', analytics.count);
    
    const listings = db.prepare(`
        SELECT l.*, mu.name as seller_name, mu.is_subscribed 
        FROM listings l 
        JOIN marketplace_users mu ON l.seller_id = mu.id
    `).all();
    console.log('Joined Listings:', JSON.stringify(listings, null, 2));
} catch (e) {
    console.error(e);
}
db.close();
