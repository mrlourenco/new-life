import { useState } from 'react'
import type { UserProfile, MacroTargets, WeightEntry } from '../types/profile'
import { DEFAULT_MACRO_TARGETS } from '../types/profile'

const KEY = 'nl_profile_v1'

function load(): UserProfile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as UserProfile
  } catch {}
  return { macro_targets: { ...DEFAULT_MACRO_TARGETS }, weight_entries: [] }
}

function save(p: UserProfile) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function useProfileStore() {
  const [profile, setProfile] = useState<UserProfile>(load)

  const saveMacroTargets = (targets: MacroTargets) => {
    const updated = { ...profile, macro_targets: targets }
    setProfile(updated)
    save(updated)
  }

  const addWeightEntry = (entry: WeightEntry) => {
    const updated = { ...profile, weight_entries: [...profile.weight_entries, entry].sort((a, b) => a.date.localeCompare(b.date)) }
    setProfile(updated)
    save(updated)
  }

  const deleteWeightEntry = (id: string) => {
    const updated = { ...profile, weight_entries: profile.weight_entries.filter(e => e.id !== id) }
    setProfile(updated)
    save(updated)
  }

  return { profile, saveMacroTargets, addWeightEntry, deleteWeightEntry }
}
