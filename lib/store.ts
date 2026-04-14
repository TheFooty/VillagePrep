// Simple generic in-memory store utility for development
// Use for lightweight, ephemeral data during dev or tests.

export type ItemWithId = { id: string };

export class InMemoryStore<T extends ItemWithId> {
  private store = new Map<string, T>();

  getAll(): T[] {
    return [...this.store.values()];
  }

  get(id: string): T | undefined {
    return this.store.get(id);
  }

  add(item: T): void {
    this.store.set(item.id, item);
  }

  remove(id: string): boolean {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}

export const createStore = <T extends ItemWithId>(): InMemoryStore<T> =>
  new InMemoryStore<T>();

// Student-specific data
export const studentEnrollments = new Map<string, string[]>(); // email -> classIds
export const studentNotes = new Map<string, string>(); // email:classId -> notes

export function enrollStudent(email: string, classId: string): void {
  const enrolled = studentEnrollments.get(email) || [];
  if (!enrolled.includes(classId)) {
    enrolled.push(classId);
    studentEnrollments.set(email, enrolled);
  }
}

export function getStudentClasses(email: string): string[] {
  return studentEnrollments.get(email) || [];
}

export function getStudentNotes(email: string, classId: string): string {
  return studentNotes.get(`${email}:${classId}`) || '';
}

export function setStudentNotes(email: string, classId: string, notes: string): void {
  studentNotes.set(`${email}:${classId}`, notes);
}

export default InMemoryStore;