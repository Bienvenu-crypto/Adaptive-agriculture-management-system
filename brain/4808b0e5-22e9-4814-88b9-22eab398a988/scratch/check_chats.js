const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'agrobot.db');
const db = new Database(dbPath);

const rows = db.prepare("SELECT * FROM chats ORDER BY timestamp DESC LIMIT 20").all();
console.log(JSON.stringify(rows, null, 2));
