import sql, { Database } from 'better-sqlite3'

const db = sql('./converter_data.db')

export function prepare_tables() {
  db.prepare(
    'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, currency TEXT, quota INTEGER, quota_date STRING)',
  ).run()
}

export interface UserData {
  id: string
  currency: string
  quota: number
  quota_date: string
}

export function get_user_data(user_id: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  const row = stmt.get(user_id) as UserData | null
  return row
}

export function set_user_preffered_currency(user_id: string, currency: string) {
  db.prepare('REPLACE INTO users (id, currency) VALUES (?,?)').run(
    user_id,
    currency,
  )
}

export function set_user_quota(
  user_id: string,
  quota: number,
  date = new Date(),
) {
  db.prepare('REPLACE INTO users (id, quota, quota_date) VALUES (?,?,?)').run(
    user_id,
    quota,
    date.toDateString(),
  )
}

export function remove_user_quota_point(user_id: string) {
  db.prepare('UPDATE users SET quota = quota - 1 WHERE id = ?').run(user_id)
}
