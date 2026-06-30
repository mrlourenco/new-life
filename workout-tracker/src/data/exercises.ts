// Predefined exercise catalog — speeds up plan creation and gives consistent
// muscle/equipment tagging. Free-text entry remains available in ExerciseEditor
// for anything not covered here.
export interface ExerciseEntry {
  id: string
  name: string
  muscle: string      // matches MUSCLES in planBuilderConstants
  equipment: string   // matches EQUIPMENT or CARDIO_EQUIPMENT in planBuilderConstants
}

export const EXERCISES: ExerciseEntry[] = [
  // Peito
  { id: 'supino-reto-barra', name: 'Supino reto (barra)', muscle: 'chest', equipment: 'barbell' },
  { id: 'supino-reto-halteres', name: 'Supino reto (halteres)', muscle: 'chest', equipment: 'dumbbells' },
  { id: 'supino-inclinado-barra', name: 'Supino inclinado (barra)', muscle: 'chest', equipment: 'barbell' },
  { id: 'supino-inclinado-halteres', name: 'Supino inclinado (halteres)', muscle: 'chest', equipment: 'dumbbells' },
  { id: 'supino-declinado-halteres', name: 'Supino declinado (halteres)', muscle: 'chest', equipment: 'dumbbells' },
  { id: 'supino-maquina', name: 'Supino (máquina)', muscle: 'chest', equipment: 'machine' },
  { id: 'crucifixo-halteres', name: 'Crucifixo (halteres)', muscle: 'chest', equipment: 'dumbbells' },
  { id: 'crucifixo-cabos', name: 'Crucifixo (cabos)', muscle: 'chest', equipment: 'cable' },
  { id: 'peck-deck', name: 'Peck deck', muscle: 'chest', equipment: 'machine' },
  { id: 'flexoes', name: 'Flexões', muscle: 'chest', equipment: 'bodyweight' },
  { id: 'paralelas-peito', name: 'Paralelas (foco peito)', muscle: 'chest', equipment: 'bodyweight' },
  { id: 'cross-over', name: 'Cross-over (cabos)', muscle: 'chest', equipment: 'cable' },

  // Costas
  { id: 'barra-fixa', name: 'Barra fixa (pull-up)', muscle: 'back', equipment: 'bodyweight' },
  { id: 'puxada-alta', name: 'Puxada alta (pulldown)', muscle: 'back', equipment: 'cable' },
  { id: 'puxada-pegada-fechada', name: 'Puxada alta pegada fechada', muscle: 'back', equipment: 'cable' },
  { id: 'remada-curvada-barra', name: 'Remada curvada (barra)', muscle: 'back', equipment: 'barbell' },
  { id: 'remada-curvada-halteres', name: 'Remada curvada (halteres)', muscle: 'back', equipment: 'dumbbells' },
  { id: 'remada-unilateral-halter', name: 'Remada unilateral (halter)', muscle: 'back', equipment: 'dumbbells' },
  { id: 'remada-cabo-sentado', name: 'Remada ao cabo sentado', muscle: 'back', equipment: 'cable' },
  { id: 'remada-maquina', name: 'Remada (máquina)', muscle: 'back', equipment: 'machine' },
  { id: 'levantamento-terra', name: 'Levantamento terra', muscle: 'back', equipment: 'barbell' },
  { id: 'pull-over', name: 'Pull-over (halter)', muscle: 'back', equipment: 'dumbbells' },
  { id: 'hiperextensoes', name: 'Hiperextensões lombares', muscle: 'back', equipment: 'bodyweight' },
  { id: 'remada-t', name: 'Remada T', muscle: 'back', equipment: 'barbell' },

  // Pernas
  { id: 'agachamento-livre', name: 'Agachamento livre (barra)', muscle: 'legs', equipment: 'barbell' },
  { id: 'agachamento-frontal', name: 'Agachamento frontal', muscle: 'legs', equipment: 'barbell' },
  { id: 'agachamento-goblet', name: 'Agachamento goblet (halter)', muscle: 'legs', equipment: 'dumbbells' },
  { id: 'agachamento-bulgaro', name: 'Agachamento búlgaro', muscle: 'legs', equipment: 'dumbbells' },
  { id: 'leg-press', name: 'Leg press', muscle: 'legs', equipment: 'machine' },
  { id: 'cadeira-extensora', name: 'Cadeira extensora', muscle: 'legs', equipment: 'machine' },
  { id: 'cadeira-flexora', name: 'Cadeira flexora', muscle: 'legs', equipment: 'machine' },
  { id: 'stiff', name: 'Levantamento terra romeno (stiff)', muscle: 'legs', equipment: 'barbell' },
  { id: 'afundo-halteres', name: 'Afundo (halteres)', muscle: 'legs', equipment: 'dumbbells' },
  { id: 'afundo-barra', name: 'Afundo (barra)', muscle: 'legs', equipment: 'barbell' },
  { id: 'gemeos-em-pe', name: 'Gémeos em pé', muscle: 'legs', equipment: 'machine' },
  { id: 'gemeos-sentado', name: 'Gémeos sentado', muscle: 'legs', equipment: 'machine' },

  // Ombros
  { id: 'desenvolvimento-militar-barra', name: 'Desenvolvimento militar (barra)', muscle: 'shoulders', equipment: 'barbell' },
  { id: 'desenvolvimento-halteres', name: 'Desenvolvimento de ombros (halteres)', muscle: 'shoulders', equipment: 'dumbbells' },
  { id: 'desenvolvimento-maquina', name: 'Desenvolvimento de ombros (máquina)', muscle: 'shoulders', equipment: 'machine' },
  { id: 'elevacao-lateral', name: 'Elevação lateral (halteres)', muscle: 'shoulders', equipment: 'dumbbells' },
  { id: 'elevacao-lateral-cabo', name: 'Elevação lateral (cabo)', muscle: 'shoulders', equipment: 'cable' },
  { id: 'elevacao-frontal', name: 'Elevação frontal (halteres)', muscle: 'shoulders', equipment: 'dumbbells' },
  { id: 'remada-alta', name: 'Remada alta (barra)', muscle: 'shoulders', equipment: 'barbell' },
  { id: 'crucifixo-invertido', name: 'Crucifixo invertido (halteres)', muscle: 'shoulders', equipment: 'dumbbells' },
  { id: 'face-pull', name: 'Face pull (cabo)', muscle: 'shoulders', equipment: 'cable' },
  { id: 'encolhimento-trapezio', name: 'Encolhimento de trapézio (halteres)', muscle: 'shoulders', equipment: 'dumbbells' },

  // Bíceps
  { id: 'rosca-direta-barra', name: 'Rosca direta (barra)', muscle: 'biceps', equipment: 'barbell' },
  { id: 'rosca-direta-halteres', name: 'Rosca direta (halteres)', muscle: 'biceps', equipment: 'dumbbells' },
  { id: 'rosca-alternada', name: 'Rosca alternada (halteres)', muscle: 'biceps', equipment: 'dumbbells' },
  { id: 'rosca-martelo', name: 'Rosca martelo (halteres)', muscle: 'biceps', equipment: 'dumbbells' },
  { id: 'rosca-concentrada', name: 'Rosca concentrada (halter)', muscle: 'biceps', equipment: 'dumbbells' },
  { id: 'rosca-cabo', name: 'Rosca no cabo', muscle: 'biceps', equipment: 'cable' },
  { id: 'rosca-scott', name: 'Rosca scott (barra W)', muscle: 'biceps', equipment: 'barbell' },

  // Tríceps
  { id: 'triceps-corda', name: 'Tríceps na corda (cabo)', muscle: 'triceps', equipment: 'cable' },
  { id: 'triceps-barra-cabo', name: 'Tríceps na barra (cabo)', muscle: 'triceps', equipment: 'cable' },
  { id: 'triceps-testa', name: 'Tríceps testa (barra)', muscle: 'triceps', equipment: 'barbell' },
  { id: 'triceps-frances', name: 'Tríceps francês (halter)', muscle: 'triceps', equipment: 'dumbbells' },
  { id: 'mergulho-banco', name: 'Mergulho no banco', muscle: 'triceps', equipment: 'bodyweight' },
  { id: 'paralelas-triceps', name: 'Paralelas (foco tríceps)', muscle: 'triceps', equipment: 'bodyweight' },
  { id: 'triceps-coice', name: 'Tríceps coice (halter)', muscle: 'triceps', equipment: 'dumbbells' },

  // Core
  { id: 'prancha', name: 'Prancha (plank)', muscle: 'core', equipment: 'bodyweight' },
  { id: 'prancha-lateral', name: 'Prancha lateral', muscle: 'core', equipment: 'bodyweight' },
  { id: 'abdominal-supra', name: 'Abdominal supra', muscle: 'core', equipment: 'bodyweight' },
  { id: 'abdominal-infra', name: 'Abdominal infra (elevação de pernas)', muscle: 'core', equipment: 'bodyweight' },
  { id: 'abdominal-maquina', name: 'Abdominal na máquina', muscle: 'core', equipment: 'machine' },
  { id: 'russian-twist', name: 'Russian twist', muscle: 'core', equipment: 'bodyweight' },
  { id: 'ab-wheel', name: 'Roda abdominal (ab wheel)', muscle: 'core', equipment: 'bodyweight' },
  { id: 'elevacao-pernas-suspensa', name: 'Elevação de pernas suspenso', muscle: 'core', equipment: 'bodyweight' },

  // Glúteos
  { id: 'hip-thrust', name: 'Hip thrust (barra)', muscle: 'glutes', equipment: 'barbell' },
  { id: 'abducao-maquina', name: 'Abdução de anca (máquina)', muscle: 'glutes', equipment: 'machine' },
  { id: 'agachamento-sumo', name: 'Agachamento sumo (halter)', muscle: 'glutes', equipment: 'dumbbells' },
  { id: 'gluteo-kickback-cabo', name: 'Glúteo no cabo (kickback)', muscle: 'glutes', equipment: 'cable' },
  { id: 'step-up', name: 'Step-up (halteres)', muscle: 'glutes', equipment: 'dumbbells' },

  // Cardio
  { id: 'corrida-passadeira', name: 'Corrida (passadeira)', muscle: 'cardio', equipment: 'treadmill' },
  { id: 'caminhada-inclinada', name: 'Caminhada inclinada (passadeira)', muscle: 'cardio', equipment: 'treadmill' },
  { id: 'bicicleta-estatica', name: 'Bicicleta estática', muscle: 'cardio', equipment: 'bike' },
  { id: 'assault-bike', name: 'Assault bike', muscle: 'cardio', equipment: 'bike' },
  { id: 'remo-ergometro', name: 'Remo (ergómetro)', muscle: 'cardio', equipment: 'rower' },
  { id: 'eliptica', name: 'Elíptica', muscle: 'cardio', equipment: 'elliptical' },
  { id: 'corrida-rua', name: 'Corrida (rua)', muscle: 'cardio', equipment: 'outdoor' },
  { id: 'jump-rope', name: 'Corda de saltar', muscle: 'cardio', equipment: 'none' },
  { id: 'burpees', name: 'Burpees', muscle: 'cardio', equipment: 'none' },
  { id: 'mountain-climbers', name: 'Mountain climbers', muscle: 'cardio', equipment: 'none' },
]

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function searchExercises(query: string, muscle?: string | null): ExerciseEntry[] {
  const byMuscle = muscle ? EXERCISES.filter(e => e.muscle === muscle) : EXERCISES
  if (!query.trim()) return byMuscle
  const q = normalize(query)
  return byMuscle.filter(e => normalize(e.name).includes(q))
}
