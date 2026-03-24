import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/planforge.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '新对话',
    requirement_content TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'generating', 'completed', 'failed')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_documents_session ON documents(session_id);
  CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
`);

class DatabaseService {
  createSession(id: string, title: string = '新对话', requirementContent?: string) {
    const stmt = db.prepare(`
      INSERT INTO sessions (id, title, requirement_content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const now = Date.now();
    stmt.run(id, title, requirementContent || null, now, now);
    return this.getSession(id);
  }

  getSession(id: string) {
    const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
    return stmt.get(id);
  }

  getAllSessions() {
    const stmt = db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC');
    return stmt.all();
  }

  updateSession(id: string, updates: { title?: string; requirement_content?: string }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.requirement_content !== undefined) {
      fields.push('requirement_content = ?');
      values.push(updates.requirement_content);
    }

    if (fields.length === 0) return this.getSession(id);

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    const stmt = db.prepare(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return this.getSession(id);
  }

  deleteSession(id: string) {
    const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
    return stmt.run(id);
  }

  addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string) {
    const stmt = db.prepare(`
      INSERT INTO messages (session_id, role, content, created_at)
      VALUES (?, ?, ?, ?)
    `);
    const now = Date.now();
    stmt.run(sessionId, role, content, now);

    db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(now, sessionId);

    return this.getMessages(sessionId);
  }

  getMessages(sessionId: string) {
    const stmt = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC');
    return stmt.all(sessionId);
  }

  clearMessages(sessionId: string) {
    const stmt = db.prepare('DELETE FROM messages WHERE session_id = ?');
    return stmt.run(sessionId);
  }

  createDocument(sessionId: string, title: string, status: string = 'pending') {
    const stmt = db.prepare(`
      INSERT INTO documents (session_id, title, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const now = Date.now();
    const result = stmt.run(sessionId, title, status, now, now);
    return this.getDocument(result.lastInsertRowid as number);
  }

  getDocument(id: number) {
    const stmt = db.prepare('SELECT * FROM documents WHERE id = ?');
    return stmt.get(id);
  }

  getDocumentBySession(sessionId: string) {
    const stmt = db.prepare('SELECT * FROM documents WHERE session_id = ? ORDER BY created_at DESC LIMIT 1');
    return stmt.get(sessionId);
  }

  getAllDocuments() {
    const stmt = db.prepare('SELECT * FROM documents ORDER BY created_at DESC');
    return stmt.all();
  }

  getDocumentsBySession(sessionId: string) {
    const stmt = db.prepare('SELECT * FROM documents WHERE session_id = ? ORDER BY created_at DESC');
    return stmt.all(sessionId);
  }

  updateDocument(id: number, updates: { title?: string; content?: string; status?: string }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }

    if (fields.length === 0) return this.getDocument(id);

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    const stmt = db.prepare(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return this.getDocument(id);
  }

  deleteDocument(id: number) {
    const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
    return stmt.run(id);
  }

  getSessionById(id: string) {
    return this.getSession(id);
  }
}

export const dbService = new DatabaseService();
export default dbService;
