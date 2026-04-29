const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function addColumnIfMissing(table, column, definition) {
  const columns = await all(`PRAGMA table_info(${table})`);
  const exists = columns.some((item) => item.name === column);
  if (!exists) await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

async function initDatabase() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    due_date TEXT DEFAULT '',
    priority TEXT DEFAULT 'Normal',
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await addColumnIfMissing('tasks', 'user_id', 'INTEGER REFERENCES users(id) ON DELETE CASCADE');
  await addColumnIfMissing('tasks', 'due_date', "TEXT DEFAULT ''");
  await addColumnIfMissing('tasks', 'priority', "TEXT DEFAULT 'Normal'");
  await addColumnIfMissing('tasks', 'updated_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
}

module.exports = { run, get, all, initDatabase };
