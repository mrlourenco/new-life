import type { Timestamped } from './common'

export interface MacroTargets {
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
}

export interface WeightEntry {
  id: string
  date: string
  weight_kg: number
  note?: string
}

export interface UserProfile extends Timestamped {
  macro_targets: MacroTargets
  weight_entries: WeightEntry[]
  week_start_day: 0 | 1   // 0=Sunday, 1=Monday
}

export const DEFAULT_MACRO_TARGETS: MacroTargets = {
  protein_g: 150,
  carbs_g: 250,
  fat_g: 70,
  fiber_g: 30,
}
