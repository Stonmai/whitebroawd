import Dexie, { type Table } from 'dexie';

interface KVEntry {
  key: string;
  value: string;
}

class WhitebroawdDB extends Dexie {
  kv!: Table<KVEntry, string>;

  constructor() {
    super('whitebroawd-db');
    this.version(1).stores({ kv: '&key' });
  }
}

let _db: WhitebroawdDB | null = null;

const getDB = (): WhitebroawdDB => {
  if (!_db) _db = new WhitebroawdDB();
  return _db;
};

export const dexieStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const entry = await getDB().kv.get(name);
    return entry?.value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await getDB().kv.put({ key: name, value });
  },
  removeItem: async (name: string): Promise<void> => {
    await getDB().kv.delete(name);
  },
};
