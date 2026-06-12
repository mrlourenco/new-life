export const GOALS = [
  { value: 'hypertrophy', label: 'Hipertrofia' },
  { value: 'strength', label: 'Força' },
  { value: 'endurance', label: 'Resistência' },
  { value: 'general', label: 'Geral' },
]

export const MUSCLES = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core', 'glutes', 'cardio']
export const EQUIPMENT = ['barbell', 'dumbbells', 'cable', 'machine', 'bodyweight', 'bands', 'kettlebell']
export const CARDIO_EQUIPMENT = ['none', 'treadmill', 'bike', 'rower', 'elliptical', 'outdoor', 'other']
export const CARDIO_EQUIPMENT_LABELS: Record<string, string> = {
  none: 'Sem equipamento',
  treadmill: 'Passadeira',
  bike: 'Bicicleta',
  rower: 'Remo',
  elliptical: 'Elíptica',
  outdoor: 'Ao ar livre',
  other: 'Outro',
}

export function isCardio(muscle: string) { return muscle === 'cardio' }
export const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const inputCls = 'w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] focus:outline-none placeholder:text-[#525252]'
