const Database = require('better-sqlite3');
const db = new Database('agrobot.db');

try {
    const result = db.prepare("UPDATE trades SET completed_at = created_at WHERE status = 'completed' AND completed_at IS NULL").run();
    console.log(`Updated ${result.changes} historical completed trades.`);
} catch (err) {
    console.error('Error updating trades:', err);
}
