export const MUSCLE_PT: Record<string, string> = {
  chest: 'Peito',
  back: 'Costas',
  legs: 'Pernas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  core: 'Core',
  glutes: 'Glúteos',
  cardio: 'Cardio',
}

export const EQUIPMENT_PT: Record<string, string> = {
  barbell: 'Barra',
  dumbbells: 'Halteres',
  cable: 'Cabo',
  machine: 'Máquina',
  bodyweight: 'Peso corporal',
  bands: 'Elásticos',
  kettlebell: 'Kettlebell',
  none: 'Sem equipamento',
  treadmill: 'Passadeira',
  bike: 'Bicicleta',
  rower: 'Remo',
  elliptical: 'Elíptica',
  outdoor: 'Ao ar livre',
  other: 'Outro',
}

export function muscleLabel(m: string) {
  return MUSCLE_PT[m.toLowerCase()] ?? m
}

export function equipmentLabel(e: string) {
  return EQUIPMENT_PT[e.toLowerCase()] ?? e
}
