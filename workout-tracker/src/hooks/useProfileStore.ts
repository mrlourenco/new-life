import { useState } from 'react'
import type { UserProfile, MacroTargets, WeightEntry } from '../types/profile'
import { DEFAULT_MACRO_TARGETS } from '../types/profile'
import { STORAGE_KEYS, loadJSON, saveJSON, stamp } from '../utils/storage'

function load(): UserProfile {
  return loadJSON<UserProfile>(STORAGE_KEYS.profile)
    ?? { macro_targets: { ...DEFAULT_MACRO_TARGETS }, weight_entries: [], week_start_day: 1 as const }
}

export function useProfileStore() {
  const [profile, setProfile] = useState<UserProfile>(load)

  const persist = (p: UserProfile) => {
    const stamped = stamp(p)
    setProfile(stamped)
    saveJSON(STORAGE_KEYS.profile, stamped)
  }

  const saveMacroTargets = (targets: MacroTargets) => {
    persist({ ...profile, macro_targets: targets })
  }

  const saveWeekStartDay = (day: 0 | 1) => {
    persist({ ...profile, week_start_day: day })
  }

  const addWeightEntry = (entry: WeightEntry) => {
    persist({ ...profile, weight_entries: [...profile.weight_entries, entry].sort((a, b) => a.date.localeCompare(b.date)) })
  }

  const deleteWeightEntry = (id: string) => {
    persist({ ...profile, weight_entries: profile.weight_entries.filter(e => e.id !== id) })
  }

  return { profile, saveMacroTargets, saveWeekStartDay, addWeightEntry, deleteWeightEntry }
}
