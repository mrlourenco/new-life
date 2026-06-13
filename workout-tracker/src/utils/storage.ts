import type { Timestamped } from '../types/common'

// Single place where the app touches localStorage. All store hooks go
// through these helpers, so a future sync backend only has to replace
// this module (plus the backup utils that enumerate STORAGE_KEYS).
export const STORAGE_KEYS = {
  workoutPlans: 'wt_plans',
  workoutLogs: 'wt_logs',
  activeWorkout: 'wt_active',
  mealTemplates: 'nt2_templates',
  nutritionLogs: 'nt2_logs',
  nutritionPlans: 'nt2_plans',
  profile: 'nl_profile_v1',
  shoppingList: 'nl_shopping_v1',
  weekAssignments: 'nl_week_assignments_v1',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

export function loadJSON<T>(key: StorageKey): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function saveJSON(key: StorageKey, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    // QuotaExceededError ou storage indisponível — os dados em memória
    // continuam válidos, mas não persistem
    console.error(`storage: falha ao gravar "${key}"`, err)
  }
}

export function removeJSON(key: StorageKey): void {
  localStorage.removeItem(key)
}

// Sets created_at on first save and refreshes updated_at on every save.
export function stamp<T extends Timestamped>(entity: T): T {
  const now = new Date().toISOString()
  return { ...entity, created_at: entity.created_at ?? now, updated_at: now }
}
