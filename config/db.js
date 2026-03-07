const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function connectDB() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("Falta TURSO_DATABASE_URL en variables de entorno.");
  }

  await db.execute("SELECT 1");

  await db.batch(
    [
      {
        sql: `
          CREATE TABLE IF NOT EXISTS social_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT NOT NULL,
            url TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
          );
        `
      },
      {
        sql: `
          CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL CHECK(type IN ('addon', 'texture')),
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            file_path TEXT NOT NULL DEFAULT '',
            image_path TEXT NOT NULL DEFAULT '',
            external_url TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
          );
        `
      }
    ],
    "write"
  );

  const tableInfo = await db.execute(`PRAGMA table_info(assets)`);
  const hasImagePath = tableInfo.rows.some((col) => col.name === "image_path");
  if (!hasImagePath) {
    await db.execute(`ALTER TABLE assets ADD COLUMN image_path TEXT NOT NULL DEFAULT ''`);
  }

  console.log("Turso conectado correctamente.");
}

module.exports = { db, connectDB };
