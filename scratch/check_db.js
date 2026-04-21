const Database = require('better-sqlite3');
const db = new Database('agrobot.db');
try {
    const info = db.prepare("PRAGMA table_info(notifications);").all();
    console.log(JSON.stringify(info, null, 2));
} catch (e) {
    console.log("Error:", e.message);
}
db.close();
