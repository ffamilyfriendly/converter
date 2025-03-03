import sql, { Database } from 'better-sqlite3'

const db = sql('./converter_data.db')

export function prepare_tables() {
  db.prepare(
    'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, currency TEXT)',
  ).run()
}

export function get_user_preffered_currency(user_id: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  const row = stmt.get(user_id) as { id: string; currency: string } | null
  return row
}

export function set_user_preffered_currency(user_id: string, currency: string) {
  db.prepare('REPLACE INTO users VALUES(?,?)').run(user_id, currency)
}
