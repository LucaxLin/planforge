import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: number;
  updated_at: number;
}

interface Session {
  id: string;
  user_id: string;
  title: string;
  requirement_content: string | null;
  created_at: number;
  updated_at: number;
}

interface Message {
  id: number;
  user_id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: number;
}

interface Document {
  id: number;
  user_id: string;
  session_id: string;
  title: string;
  content: string | null;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: number;
  updated_at: number;
}

interface EmailVerificationCode {
  id: number;
  email: string;
  code: string;
  expires_at: number;
  used: boolean;
  created_at: number;
}

interface Counters {
  messages: number;
  documents: number;
  users: number;
  email_codes: number;
}

class JsonDB<T extends { id?: number | string }> {
  private filePath: string;
  private data: T[];

  constructor(filename: string, defaultData: T[] = []) {
    this.filePath = path.join(dataDir, filename);
    this.data = this.load();
    if (this.data.length === 0 && defaultData.length > 0) {
      this.data = defaultData;
      this.save();
    }
  }

  private load(): T[] {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(`Failed to load ${this.filePath}:`, e);
    }
    return [];
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Failed to save ${this.filePath}:`, e);
    }
  }

  getAll(): T[] {
    return [...this.data];
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.data.find(predicate);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.data.filter(predicate);
  }

  push(item: T): T {
    this.data.push(item);
    this.save();
    return item;
  }

  update(predicate: (item: T) => boolean, updates: Partial<T>): T | undefined {
    const index = this.data.findIndex(predicate);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates };
      this.save();
      return this.data[index];
    }
    return undefined;
  }

  remove(predicate: (item: T) => boolean): boolean {
    const index = this.data.findIndex(predicate);
    if (index !== -1) {
      this.data.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  filterRemove(predicate: (item: T) => boolean): number {
    const before = this.data.length;
    this.data = this.data.filter(predicate);
    const removed = before - this.data.length;
    if (removed > 0) {
      this.save();
    }
    return removed;
  }
}

const usersDb = new JsonDB<User>('users.json');
const sessionsDb = new JsonDB<Session>('sessions.json');
const messagesDb = new JsonDB<Message>('messages.json');
const documentsDb = new JsonDB<Document>('documents.json');
const emailCodesDb = new JsonDB<EmailVerificationCode>('email_verification_codes.json');
const countersDb = new JsonDB<Counters>('counters.json', [{ messages: 0, documents: 0, users: 0, email_codes: 0 }]);

class DatabaseService {
  getCounter(key: keyof Counters): number {
    const counters = countersDb.getAll();
    return counters[0]?.[key] || 0;
  }

  incrementCounter(key: keyof Counters): number {
    const counters = countersDb.getAll();
    const current = counters[0]?.[key] || 0;
    countersDb.update(() => true, { [key]: current + 1 });
    return current + 1;
  }

  createSession(userId: string, id: string, title: string = '新对话', requirementContent?: string): Session {
    const now = Date.now();
    return sessionsDb.push({
      id,
      user_id: userId,
      title,
      requirement_content: requirementContent || null,
      created_at: now,
      updated_at: now,
    });
  }

  getSession(userId: string, id: string): Session | undefined {
    return sessionsDb.find(s => s.id === id && s.user_id === userId);
  }

  getAllSessions(userId: string): Session[] {
    return sessionsDb.filter(s => s.user_id === userId)
      .sort((a, b) => b.updated_at - a.updated_at);
  }

  updateSession(userId: string, id: string, updates: { title?: string; requirement_content?: string }): Session | undefined {
    const session = this.getSession(userId, id);
    if (!session) return undefined;

    const now = Date.now();
    sessionsDb.update(
      s => s.id === id && s.user_id === userId,
      {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.requirement_content !== undefined && { requirement_content: updates.requirement_content }),
        updated_at: now,
      }
    );
    return this.getSession(userId, id);
  }

  deleteSession(userId: string, id: string): void {
    sessionsDb.remove(s => s.id === id && s.user_id === userId);
    messagesDb.filterRemove(m => m.session_id === id && m.user_id === userId);
    documentsDb.filterRemove(d => d.session_id === id && d.user_id === userId);
  }

  addMessage(userId: string, sessionId: string, role: 'user' | 'assistant' | 'system', content: string): Message[] {
    const session = this.getSession(userId, sessionId);
    if (!session) return [];

    messagesDb.push({
      id: this.incrementCounter('messages'),
      user_id: userId,
      session_id: sessionId,
      role,
      content,
      created_at: Date.now(),
    });

    sessionsDb.update(
      s => s.id === sessionId && s.user_id === userId,
      { updated_at: Date.now() }
    );

    return this.getMessages(userId, sessionId);
  }

  getMessages(userId: string, sessionId: string): Message[] {
    return messagesDb.filter(m => m.session_id === sessionId && m.user_id === userId)
      .sort((a, b) => a.created_at - b.created_at);
  }

  clearMessages(userId: string, sessionId: string): void {
    messagesDb.filterRemove(m => m.session_id === sessionId && m.user_id === userId);
  }

  createDocument(userId: string, sessionId: string, title: string, status: string = 'pending'): Document | undefined {
    const session = this.getSession(userId, sessionId);
    if (!session) return undefined;

    return documentsDb.push({
      id: this.incrementCounter('documents'),
      user_id: userId,
      session_id: sessionId,
      title,
      content: null,
      status: status as any,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  }

  getDocument(userId: string, id: number): Document | undefined {
    return documentsDb.find(d => d.id === id && d.user_id === userId);
  }

  getAllDocuments(userId: string): Document[] {
    return documentsDb.filter(d => d.user_id === userId)
      .sort((a, b) => b.created_at - a.created_at);
  }

  getDocumentsBySession(userId: string, sessionId: string): Document[] {
    return documentsDb.filter(d => d.session_id === sessionId && d.user_id === userId)
      .sort((a, b) => b.created_at - a.created_at);
  }

  updateDocument(userId: string, id: number, updates: { title?: string; content?: string; status?: string }): Document | undefined {
    const doc = this.getDocument(userId, id);
    if (!doc) return undefined;

    documentsDb.update(
      d => d.id === id && d.user_id === userId,
      {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.status !== undefined && { status: updates.status as any }),
        updated_at: Date.now(),
      }
    );
    return this.getDocument(userId, id);
  }

  deleteDocument(userId: string, id: number): void {
    documentsDb.remove(d => d.id === id && d.user_id === userId);
  }

  createUser(id: string, email: string, passwordHash: string): User {
    this.incrementCounter('users');
    return usersDb.push({
      id,
      email,
      password_hash: passwordHash,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  }

  getUserByEmail(email: string): User | undefined {
    return usersDb.find(u => u.email === email);
  }

  getUserById(id: string): User | undefined {
    return usersDb.find(u => u.id === id);
  }

  createEmailVerificationCode(email: string, code: string): EmailVerificationCode {
    return emailCodesDb.push({
      id: this.incrementCounter('email_codes'),
      email,
      code,
      expires_at: Date.now() + 10 * 60 * 1000,
      used: false,
      created_at: Date.now(),
    });
  }

  getEmailVerificationCode(email: string): EmailVerificationCode | undefined {
    const codes = emailCodesDb.filter(v => v.email === email && !v.used)
      .sort((a, b) => b.created_at - a.created_at);
    return codes[0];
  }

  markEmailCodeAsUsed(email: string): void {
    const code = this.getEmailVerificationCode(email);
    if (code) {
      emailCodesDb.update(v => v.id === code.id, { used: true });
    }
  }

  cleanupEmailCodes(): number {
    const now = Date.now();
    const before = emailCodesDb.getAll().length;
    const removed = emailCodesDb.filterRemove(
      v => !v.used && v.expires_at > now
    );
    if (removed > 0) {
      console.log(`[DB] Cleaned up ${removed} expired/used email codes`);
    }
    return before - emailCodesDb.getAll().length;
  }

  cleanupExpiredDocuments(): number {
    const now = Date.now();
    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
    const before = documentsDb.getAll().length;
    const removed = documentsDb.filterRemove(
      d => (now - d.created_at) > expirationTime
    );
    if (removed > 0) {
      console.log(`[DB] Cleaned up ${removed} expired documents`);
    }
    return before - documentsDb.getAll().length;
  }
}

export const dbService = new DatabaseService();
export default dbService;

setInterval(() => {
  dbService.cleanupEmailCodes();
}, 60 * 1000);

const scheduleMidnightCleanup = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(() => {
    dbService.cleanupExpiredDocuments();
    scheduleMidnightCleanup();
  }, msUntilMidnight);

  console.log(`[DB] Next document cleanup scheduled at midnight (in ${Math.round(msUntilMidnight / 1000 / 60)} minutes)`);
};

scheduleMidnightCleanup();
