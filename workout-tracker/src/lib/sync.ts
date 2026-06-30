import { supabase } from './supabase'
import { STORAGE_KEYS, loadJSON } from '../utils/storage'
import type { StorageKey } from '../utils/storage'

type SyncEntity = { id: string; created_at?: string; updated_at?: string }

interface SyncCollection {
  key: StorageKey
  table: string
}

const COLLECTIONS: SyncCollection[] = [
  { key: STORAGE_KEYS.workoutPlans,            table: 'workout_plans' },
  { key: STORAGE_KEYS.workoutLogs,             table: 'workout_logs' },
  { key: STORAGE_KEYS.workoutWeekAssignments,  table: 'workout_week_assignments' },
  { key: STORAGE_KEYS.mealTemplates,           table: 'meal_templates' },
  { key: STORAGE_KEYS.nutritionLogs,           table: 'nutrition_logs' },
  { key: STORAGE_KEYS.nutritionPlans,          table: 'nutrition_plans' },
  { key: STORAGE_KEYS.weekAssignments,         table: 'nutrition_week_assignments' },
]

let pulling = false
let initialized = false

function newer(a?: string, b?: string): boolean {
  if (!b) return true
  if (!a) return false
  return new Date(a).getTime() > new Date(b).getTime()
}

const PAGE_SIZE = 1000

// Supabase caps unbounded selects at 1000 rows by default — page through
// so collections that grow past that don't silently lose rows on pull.
async function fetchAllRows(table: string, userId: string) {
  const rows: { id: string; data: unknown; updated_at: string }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('id, data, updated_at')
      .eq('user_id', userId)
      .range(from, from + PAGE_SIZE - 1)

    if (error) return { rows, error }
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return { rows, error: null }
}

function mergeEntities<T extends SyncEntity>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>()
  for (const e of local) map.set(e.id, e)
  for (const e of remote) {
    const existing = map.get(e.id)
    if (!existing || newer(e.updated_at, existing.updated_at)) map.set(e.id, e)
  }
  return [...map.values()]
}

async function handleSaveEvent(e: CustomEvent<{ key: string; value: unknown }>) {
  if (pulling) return
  const { key, value } = e.detail

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return

  const col = COLLECTIONS.find(c => c.key === key)
  if (col) {
    const entities = value as SyncEntity[]
    const localIds = (entities ?? []).map(ent => ent.id)

    if (localIds.length > 0) {
      const rows = entities.map(ent => ({
        id: ent.id,
        user_id: user.id,
        data: ent,
        updated_at: ent.updated_at ?? new Date().toISOString(),
        created_at: ent.created_at ?? new Date().toISOString(),
      }))
      supabase.from(col.table)
        .upsert(rows, { onConflict: 'id,user_id' })
        .then(({ error }) => { if (error) console.error(`sync push ${col.table}:`, error) })

      // Delete remote rows no longer in local array
      supabase.from(col.table)
        .delete()
        .eq('user_id', user.id)
        .not('id', 'in', `(${localIds.join(',')})`)
        .then(({ error }) => { if (error) console.error(`sync delete ${col.table}:`, error) })
    } else {
      // Array is empty — delete all remote rows for this collection
      supabase.from(col.table)
        .delete()
        .eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error(`sync delete-all ${col.table}:`, error) })
    }
    return
  }

  if (key === STORAGE_KEYS.profile) {
    const p = value as { updated_at?: string }
    supabase.from('profiles')
      .upsert({ user_id: user.id, data: value, updated_at: p.updated_at ?? new Date().toISOString() }, { onConflict: 'user_id' })
      .then(({ error }) => { if (error) console.error('sync push profiles:', error) })
  }
}

export function initSync() {
  if (initialized) return
  initialized = true
  window.addEventListener('nl:save', (e: Event) => handleSaveEvent(e as CustomEvent))
}

// Pull all remote data and merge into localStorage. Returns true if anything changed.
export async function pullAll(): Promise<boolean> {
  if (pulling) return false

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return false

  pulling = true
  let changed = false
  try {
    for (const { key, table } of COLLECTIONS) {
      const { rows, error } = await fetchAllRows(table, user.id)

      if (error) { console.error(`sync pull ${table}:`, error); continue }

      const remote = rows.map(row => ({ ...(row.data as SyncEntity), updated_at: row.updated_at }))
      const local = loadJSON<SyncEntity[]>(key) ?? []
      const merged = mergeEntities(local, remote)
      const mergedJSON = JSON.stringify(merged)
      if (mergedJSON !== JSON.stringify(local)) {
        localStorage.setItem(key, mergedJSON)
        changed = true
      }
    }

    // Profile (single document)
    const { data: profRow, error: profErr } = await supabase
      .from('profiles')
      .select('data, updated_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profErr) console.error('sync pull profiles:', profErr)
    if (profRow) {
      const remote = { ...(profRow.data as object), updated_at: profRow.updated_at }
      const local = loadJSON<{ updated_at?: string }>(STORAGE_KEYS.profile)
      if (!local || newer((remote as { updated_at?: string }).updated_at, local.updated_at)) {
        localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(remote))
        changed = true
      }
    }
  } finally {
    pulling = false
  }
  return changed
}

// Upload all local data to Supabase (used on first login).
export async function pushAll(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return

  for (const { key, table } of COLLECTIONS) {
    const entities = loadJSON<SyncEntity[]>(key) ?? []
    if (!entities.length) continue
    const rows = entities.map(ent => ({
      id: ent.id,
      user_id: user.id,
      data: ent,
      updated_at: ent.updated_at ?? new Date().toISOString(),
      created_at: ent.created_at ?? new Date().toISOString(),
    }))
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id,user_id' })
    if (error) console.error(`sync pushAll ${table}:`, error)
  }

  const profile = loadJSON<{ updated_at?: string }>(STORAGE_KEYS.profile)
  if (profile) {
    const { error } = await supabase.from('profiles').upsert(
      { user_id: user.id, data: profile, updated_at: profile.updated_at ?? new Date().toISOString() },
      { onConflict: 'user_id' },
    )
    if (error) console.error('sync pushAll profiles:', error)
  }
}
