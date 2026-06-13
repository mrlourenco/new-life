import { STORAGE_KEYS, loadJSON, saveJSON, type StorageKey } from './storage'

// Full-app backup envelope. Doubles as the data-migration vehicle for a
// future backend: on first login, this is what gets uploaded.
export interface FullBackup {
  app: 'new-life'
  version: 1
  exported_at: string
  data: Partial<Record<StorageKey, unknown>>
}

const BACKUP_KEYS: StorageKey[] = Object.values(STORAGE_KEYS)
  // o treino ativo é estado transiente — não faz sentido em backups
  .filter(k => k !== STORAGE_KEYS.activeWorkout)

export function buildBackup(): FullBackup {
  const data: FullBackup['data'] = {}
  for (const key of BACKUP_KEYS) {
    const value = loadJSON<unknown>(key)
    if (value !== null) data[key] = value
  }
  return { app: 'new-life', version: 1, exported_at: new Date().toISOString(), data }
}

export function validateBackup(parsed: unknown): parsed is FullBackup {
  if (!parsed || typeof parsed !== 'object') return false
  const b = parsed as Record<string, unknown>
  if (b.app !== 'new-life' || b.version !== 1) return false
  if (!b.data || typeof b.data !== 'object' || Array.isArray(b.data)) return false
  // only known storage keys are accepted
  return Object.keys(b.data).every(k => (BACKUP_KEYS as string[]).includes(k))
}

// Overwrites local data with the backup's contents. Caller is responsible
// for confirming with the user and reloading the app afterwards.
export function restoreBackup(backup: FullBackup): void {
  for (const key of BACKUP_KEYS) {
    if (key in backup.data) saveJSON(key, backup.data[key])
  }
}

export function downloadBackup(): void {
  const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `new-life-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
