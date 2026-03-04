type StorageValue = string

class MemoryStorage {
  private data = new Map<string, StorageValue>()

  getString(key: string) {
    return this.data.has(key) ? this.data.get(key) ?? undefined : undefined
  }

  set(key: string, value: StorageValue) {
    this.data.set(key, value)
  }

  delete(key: string) {
    this.data.delete(key)
  }

  clearAll() {
    this.data.clear()
  }

  getAllKeys() {
    return Array.from(this.data.keys())
  }
}

export const storage = new MemoryStorage()

export function loadString(key: string): string | null {
  try {
    return storage.getString(key) ?? null
  } catch {
    return null
  }
}

export function saveString(key: string, value: string): boolean {
  try {
    storage.set(key, value)
    return true
  } catch {
    return false
  }
}

export function load<T>(key: string): T | null {
  let almostThere: string | null = null
  try {
    almostThere = loadString(key)
    return JSON.parse(almostThere ?? "") as T
  } catch {
    return (almostThere as T) ?? null
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    saveString(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function remove(key: string): void {
  try {
    storage.delete(key)
  } catch {}
}

export function clear(): void {
  try {
    storage.clearAll()
  } catch {}
}
