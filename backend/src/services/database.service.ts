import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'planforge.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface Session {
  id: string;
  title: string;
  requirement_content: string | null;
  created_at: number;
  updated_at: number;
}

interface Message {
  id: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: number;
}

interface Document {
  id: number;
  session_id: string;
  title: string;
  content: string | null;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: number;
  updated_at: number;
}

interface Database {
  sessions: Session[];
  messages: Message[];
  documents: Document[];
  counters: { messages: number; documents: number };
}

const defaultDb: Database = {
  sessions: [],
  messages: [],
  documents: [],
  counters: { messages: 0, documents: 0 }
};

let db: Database;

const loadDb = (): Database => {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load database:', e);
  }
  return { ...defaultDb };
};

const saveDb = () => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save database:', e);
  }
};

db = loadDb();

class DatabaseService {
  createSession(id: string, title: string = '新对话', requirementContent?: string): Session {
    const now = Date.now();
    const session: Session = {
      id,
      title,
      requirement_content: requirementContent || null,
      created_at: now,
      updated_at: now,
    };
    db.sessions.push(session);
    saveDb();
    return session;
  }

  getSession(id: string): Session | undefined {
    return db.sessions.find(s => s.id === id);
  }

  getAllSessions(): Session[] {
    return [...db.sessions].sort((a, b) => b.updated_at - a.updated_at);
  }

  updateSession(id: string, updates: { title?: string; requirement_content?: string }): Session | undefined {
    const session = db.sessions.find(s => s.id === id);
    if (!session) return undefined;

    if (updates.title !== undefined) session.title = updates.title;
    if (updates.requirement_content !== undefined) session.requirement_content = updates.requirement_content;
    session.updated_at = Date.now();
    saveDb();
    return session;
  }

  deleteSession(id: string): void {
    db.sessions = db.sessions.filter(s => s.id !== id);
    db.messages = db.messages.filter(m => m.session_id !== id);
    db.documents = db.documents.filter(d => d.session_id !== id);
    saveDb();
  }

  addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string): Message[] {
    db.counters.messages++;
    const message: Message = {
      id: db.counters.messages,
      session_id: sessionId,
      role,
      content,
      created_at: Date.now(),
    };
    db.messages.push(message);

    const session = db.sessions.find(s => s.id === sessionId);
    if (session) session.updated_at = Date.now();

    saveDb();
    return this.getMessages(sessionId);
  }

  getMessages(sessionId: string): Message[] {
    return db.messages
      .filter(m => m.session_id === sessionId)
      .sort((a, b) => a.created_at - b.created_at);
  }

  clearMessages(sessionId: string): void {
    db.messages = db.messages.filter(m => m.session_id !== sessionId);
    saveDb();
  }

  createDocument(sessionId: string, title: string, status: string = 'pending'): Document {
    db.counters.documents++;
    const now = Date.now();
    const document: Document = {
      id: db.counters.documents,
      session_id: sessionId,
      title,
      content: null,
      status: status as any,
      created_at: now,
      updated_at: now,
    };
    db.documents.push(document);
    saveDb();
    return document;
  }

  getDocument(id: number): Document | undefined {
    return db.documents.find(d => d.id === id);
  }

  getAllDocuments(): Document[] {
    return [...db.documents].sort((a, b) => b.created_at - a.created_at);
  }

  getDocumentsBySession(sessionId: string): Document[] {
    return db.documents
      .filter(d => d.session_id === sessionId)
      .sort((a, b) => b.created_at - a.created_at);
  }

  updateDocument(id: number, updates: { title?: string; content?: string; status?: string }): Document | undefined {
    const document = db.documents.find(d => d.id === id);
    if (!document) return undefined;

    if (updates.title !== undefined) document.title = updates.title;
    if (updates.content !== undefined) document.content = updates.content;
    if (updates.status !== undefined) document.status = updates.status as any;
    document.updated_at = Date.now();
    saveDb();
    return document;
  }

  deleteDocument(id: number): void {
    db.documents = db.documents.filter(d => d.id !== id);
    saveDb();
  }

  getSessionById(id: string): Session | undefined {
    return this.getSession(id);
  }
}

export const dbService = new DatabaseService();
export default dbService;
