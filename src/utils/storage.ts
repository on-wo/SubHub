interface StorageData {
  sub: string;
  expire: string;
  note: string;
  traffic: {
    upload: number;
    download: number;
    total: number;
  };
}

export interface Storage {
  getUser(uuid: string): Promise<StorageData | null>;
  putUser(uuid: string, data: StorageData): Promise<void>;
  deleteUser(uuid: string): Promise<void>;
  listUsers(): Promise<{ [key: string]: StorageData }>;
}

export class KVStorage implements Storage {
  constructor(private kv: KVNamespace) {}

  async getUser(uuid: string): Promise<StorageData | null> {
    return await this.kv.get(uuid, 'json');
  }

  async putUser(uuid: string, data: StorageData): Promise<void> {
    await this.kv.put(uuid, JSON.stringify(data));
  }

  async deleteUser(uuid: string): Promise<void> {
    await this.kv.delete(uuid);
  }

  async listUsers(): Promise<{ [key: string]: StorageData }> {
    const list = await this.kv.list();
    const users: { [key: string]: StorageData } = {};
    
    for (const key of list.keys) {
      const data = await this.getUser(key.name);
      if (data) {
        users[key.name] = data;
      }
    }

    return users;
  }
}