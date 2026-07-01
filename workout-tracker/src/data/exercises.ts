// Predefined exercise catalog — speeds up plan creation and gives consistent
// muscle/equipment tagging. Free-text entry remains available in ExerciseEditor
// for anything not covered here.
export interface ExerciseEntry {
  id: string
  name: string
  muscle: string      // matches MUSCLES in planBuilderConstants
  equipment: string   // matches EQUIPMENT or CARDIO_EQUIPMENT in planBuilderConstants
  gif?: string        // free-exercise-db exercise ID — derive URL via gifUrl()
}

const GIF_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'
export function gifUrl(gif: string) { return `${GIF_BASE}/${gif}/0.jpg` }

export const EXERCISES: ExerciseEntry[] = [
  // Peito
  { id: 'supino-reto-barra', name: 'Supino reto (barra)', muscle: 'chest', equipment: 'barbell', gif: 'Barbell_Bench_Press_-_Medium_Grip' },
  { id: 'supino-reto-halteres', name: 'Supino reto (halteres)', muscle: 'chest', equipment: 'dumbbells', gif: 'Dumbbell_Bench_Press' },
  { id: 'supino-inclinado-barra', name: 'Supino inclinado (barra)', muscle: 'chest', equipment: 'barbell', gif: 'Barbell_Incline_Bench_Press_-_Medium_Grip' },
  { id: 'supino-inclinado-halteres', name: 'Supino inclinado (halteres)', muscle: 'chest', equipment: 'dumbbells' },
  { id: 'supino-declinado-halteres', name: 'Supino declinado (halteres)', muscle: 'chest', equipment: 'dumbbells', gif: 'Decline_Dumbbell_Bench_Press' },
  { id: 'supino-maquina', name: 'Supino (máquina)', muscle: 'chest', equipment: 'machine' },
  { id: 'crucifixo-halteres', name: 'Crucifixo (halteres)', muscle: 'chest', equipment: 'dumbbells', gif: 'Dumbbell_Flyes' },
  { id: 'crucifixo-cabos', name: 'Crucifixo (cabos)', muscle: 'chest', equipment: 'cable' },
  { id: 'peck-deck', name: 'Peck deck', muscle: 'chest', equipment: 'machine' },
  { id: 'flexoes', name: 'Flexões', muscle: 'chest', equipment: 'bodyweight', gif: 'Pushups' },
  { id: 'paralelas-peito', name: 'Paralelas (foco peito)', muscle: 'chest', equipment: 'bodyweight', gif: 'Bench_Dips' },
  { id: 'cross-over', name: 'Cross-over (cabos)', muscle: 'chest', equipment: 'cable', gif: 'Cable_Crossover' },
  { id: 'supino-declinado-barra', name: 'Supino declinado (barra)', muscle: 'chest', equipment: 'barbell' },
  { id: 'crucifixo-declinado-halteres', name: 'Crucifixo declinado (halteres)', muscle: 'chest', equipment: 'dumbbells' },
  { id: 'supino-pegada-neutra-halteres', name: 'Supino pegada neutra (halteres)', muscle: 'chest', equipment: 'dumbbells' },
  { id: 'flexoes-inclinadas', name: 'Flexões inclinadas (mãos elevadas)', muscle: 'chest', equipment: 'bodyweight' },
  { id: 'flexoes-pegada-larga', name: 'Flexões pegada larga', muscle: 'chest', equipment: 'bodyweight' },
  { id: 'flexoes-pes-elevados', name: 'Flexões com pés elevados', muscle: 'chest', equipment: 'bodyweight' },
  { id: 'supino-smith', name: 'Supino na Smith machine', muscle: 'chest', equipment: 'machine' },
  { id: 'supino-pegada-larga-barra', name: 'Supino pegada larga (barra)', muscle: 'chest', equipment: 'barbell' },
  { id: 'crucifixo-cruzado-cabo', name: 'Crucifixo cruzado (cabo, baixo)', muscle: 'chest', equipment: 'cable' },
  { id: 'supino-unilateral-halter', name: 'Supino unilateral (halter)', muscle: 'chest', equipment: 'dumbbells' },

  // Costas
  { id: 'barra-fixa', name: 'Barra fixa (pull-up)', muscle: 'back', equipment: 'bodyweight' },
  { id: 'puxada-alta', name: 'Puxada alta (pulldown)', muscle: 'back', equipment: 'cable', gif: 'Wide-Grip_Lat_Pulldown' },
  { id: 'puxada-pegada-fechada', name: 'Puxada alta pegada fechada', muscle: 'back', equipment: 'cable', gif: 'Close-Grip_Front_Lat_Pulldown' },
  { id: 'remada-curvada-barra', name: 'Remada curvada (barra)', muscle: 'back', equipment: 'barbell', gif: 'Bent_Over_Barbell_Row' },
  { id: 'remada-curvada-halteres', name: 'Remada curvada (halteres)', muscle: 'back', equipment: 'dumbbells', gif: 'Bent_Over_Two-Dumbbell_Row' },
  { id: 'remada-unilateral-halter', name: 'Remada unilateral (halter)', muscle: 'back', equipment: 'dumbbells', gif: 'One-Arm_Dumbbell_Row' },
  { id: 'remada-cabo-sentado', name: 'Remada ao cabo sentado', muscle: 'back', equipment: 'cable', gif: 'Seated_Cable_Rows' },
  { id: 'remada-maquina', name: 'Remada (máquina)', muscle: 'back', equipment: 'machine' },
  { id: 'levantamento-terra', name: 'Levantamento terra', muscle: 'back', equipment: 'barbell', gif: 'Barbell_Deadlift' },
  { id: 'pull-over', name: 'Pull-over (halter)', muscle: 'back', equipment: 'dumbbells', gif: 'Bent-Arm_Barbell_Pullover' },
  { id: 'hiperextensoes', name: 'Hiperextensões lombares', muscle: 'back', equipment: 'bodyweight', gif: 'Hyperextensions_With_No_Hyperextension_Bench' },
  { id: 'remada-t', name: 'Remada T', muscle: 'back', equipment: 'barbell', gif: 'T-Bar_Row_with_Handle' },
  { id: 'rack-pulls', name: 'Rack pulls (terra parcial)', muscle: 'back', equipment: 'barbell' },
  { id: 'chin-up', name: 'Chin-up (pegada supinada)', muscle: 'back', equipment: 'bodyweight', gif: 'Chin-Up' },
  { id: 'puxada-pegada-aberta', name: 'Puxada pegada aberta (cabo)', muscle: 'back', equipment: 'cable' },
  { id: 'remada-inclinada-halteres', name: 'Remada inclinada (halteres)', muscle: 'back', equipment: 'dumbbells' },
  { id: 'remada-curvada-pegada-supinada', name: 'Remada curvada pegada supinada (barra)', muscle: 'back', equipment: 'barbell' },
  { id: 'puxada-bracos-estendidos', name: 'Puxada de braços estendidos (cabo)', muscle: 'back', equipment: 'cable' },
  { id: 'levantamento-terra-sumo', name: 'Levantamento terra sumo (barra)', muscle: 'back', equipment: 'barbell', gif: 'Sumo_Deadlift' },

  // Pernas
  { id: 'agachamento-livre', name: 'Agachamento livre (barra)', muscle: 'legs', equipment: 'barbell', gif: 'Barbell_Full_Squat' },
  { id: 'agachamento-frontal', name: 'Agachamento frontal', muscle: 'legs', equipment: 'barbell' },
  { id: 'agachamento-goblet', name: 'Agachamento goblet (halter)', muscle: 'legs', equipment: 'dumbbells', gif: 'Goblet_Squat' },
  { id: 'agachamento-bulgaro', name: 'Agachamento búlgaro', muscle: 'legs', equipment: 'dumbbells' },
  { id: 'leg-press', name: 'Leg press', muscle: 'legs', equipment: 'machine', gif: 'Leg_Press' },
  { id: 'cadeira-extensora', name: 'Cadeira extensora', muscle: 'legs', equipment: 'machine', gif: 'Leg_Extensions' },
  { id: 'cadeira-flexora', name: 'Cadeira flexora', muscle: 'legs', equipment: 'machine', gif: 'Lying_Leg_Curls' },
  { id: 'stiff', name: 'Levantamento terra romeno (stiff)', muscle: 'legs', equipment: 'barbell', gif: 'Romanian_Deadlift' },
  { id: 'afundo-halteres', name: 'Afundo (halteres)', muscle: 'legs', equipment: 'dumbbells', gif: 'Dumbbell_Lunges' },
  { id: 'afundo-barra', name: 'Afundo (barra)', muscle: 'legs', equipment: 'barbell', gif: 'Barbell_Lunge' },
  { id: 'gemeos-em-pe', name: 'Gémeos em pé', muscle: 'legs', equipment: 'machine', gif: 'Standing_Calf_Raises' },
  { id: 'gemeos-sentado', name: 'Gémeos sentado', muscle: 'legs', equipment: 'machine' },
  { id: 'afundo-andar-halteres', name: 'Afundo a andar (halteres)', muscle: 'legs', equipment: 'dumbbells', gif: 'Barbell_Walking_Lunge' },
  { id: 'agachamento-caixa', name: 'Agachamento na caixa (barra)', muscle: 'legs', equipment: 'barbell' },
  { id: 'bom-dia', name: 'Bom dia (good morning, barra)', muscle: 'legs', equipment: 'barbell', gif: 'Barbell_Good_Morning' },
  { id: 'agachamento-hack', name: 'Agachamento hack (máquina)', muscle: 'legs', equipment: 'machine', gif: 'Hack_Squat' },
  { id: 'agachamento-overhead', name: 'Agachamento overhead (barra)', muscle: 'legs', equipment: 'barbell' },
  { id: 'agachamento-smith', name: 'Agachamento na Smith machine', muscle: 'legs', equipment: 'machine' },
  { id: 'glute-ham-raise', name: 'Glute ham raise', muscle: 'legs', equipment: 'machine' },
  { id: 'agachamento-zercher', name: 'Agachamento Zercher (barra)', muscle: 'legs', equipment: 'barbell' },
  { id: 'power-clean', name: 'Power clean (barra)', muscle: 'legs', equipment: 'barbell', gif: 'Power_Clean' },
  { id: 'arranco-barra', name: 'Arranco / snatch (barra)', muscle: 'legs', equipment: 'barbell' },
  { id: 'hang-clean', name: 'Hang clean (barra)', muscle: 'legs', equipment: 'barbell', gif: 'Hang_Clean' },

  // Ombros
  { id: 'desenvolvimento-militar-barra', name: 'Desenvolvimento militar (barra)', muscle: 'shoulders', equipment: 'barbell', gif: 'Barbell_Shoulder_Press' },
  { id: 'desenvolvimento-halteres', name: 'Desenvolvimento de ombros (halteres)', muscle: 'shoulders', equipment: 'dumbbells', gif: 'Dumbbell_Shoulder_Press' },
  { id: 'desenvolvimento-maquina', name: 'Desenvolvimento de ombros (máquina)', muscle: 'shoulders', equipment: 'machine' },
  { id: 'elevacao-lateral', name: 'Elevação lateral (halteres)', muscle: 'shoulders', equipment: 'dumbbells', gif: 'Side_Lateral_Raise' },
  { id: 'elevacao-lateral-cabo', name: 'Elevação lateral (cabo)', muscle: 'shoulders', equipment: 'cable' },
  { id: 'elevacao-frontal', name: 'Elevação frontal (halteres)', muscle: 'shoulders', equipment: 'dumbbells', gif: 'Dumbbell_Front_Raise' },
  { id: 'remada-alta', name: 'Remada alta (barra)', muscle: 'shoulders', equipment: 'barbell', gif: 'Barbell_Upright_Row' },
  { id: 'crucifixo-invertido', name: 'Crucifixo invertido (halteres)', muscle: 'shoulders', equipment: 'dumbbells' },
  { id: 'face-pull', name: 'Face pull (cabo)', muscle: 'shoulders', equipment: 'cable', gif: 'Face_Pull' },
  { id: 'encolhimento-trapezio', name: 'Encolhimento de trapézio (halteres)', muscle: 'shoulders', equipment: 'dumbbells', gif: 'Dumbbell_Shrug' },
  { id: 'desenvolvimento-arnold', name: 'Desenvolvimento Arnold (halteres)', muscle: 'shoulders', equipment: 'dumbbells', gif: 'Arnold_Dumbbell_Press' },
  { id: 'push-press', name: 'Push press (barra)', muscle: 'shoulders', equipment: 'barbell', gif: 'Push_Press' },
  { id: 'desenvolvimento-ombros-cabo', name: 'Desenvolvimento de ombros (cabo)', muscle: 'shoulders', equipment: 'cable' },
  { id: 'elevacao-frontal-cabo', name: 'Elevação frontal (cabo)', muscle: 'shoulders', equipment: 'cable' },
  { id: 'crucifixo-invertido-cabo', name: 'Crucifixo invertido (cabo)', muscle: 'shoulders', equipment: 'cable' },
  { id: 'flexao-apoio-invertido', name: 'Flexão em apoio invertido (handstand push-up)', muscle: 'shoulders', equipment: 'bodyweight', gif: 'Handstand_Push-Ups' },
  { id: 'clean-and-press', name: 'Clean and press (barra)', muscle: 'shoulders', equipment: 'barbell' },
  { id: 'rotacao-externa-ombro', name: 'Rotação externa do ombro (halter)', muscle: 'shoulders', equipment: 'dumbbells' },

  // Bíceps
  { id: 'rosca-direta-barra', name: 'Rosca direta (barra)', muscle: 'biceps', equipment: 'barbell', gif: 'Barbell_Curl' },
  { id: 'rosca-direta-halteres', name: 'Rosca direta (halteres)', muscle: 'biceps', equipment: 'dumbbells', gif: 'Dumbbell_Bicep_Curl' },
  { id: 'rosca-alternada', name: 'Rosca alternada (halteres)', muscle: 'biceps', equipment: 'dumbbells', gif: 'Alternate_Hammer_Curl' },
  { id: 'rosca-martelo', name: 'Rosca martelo (halteres)', muscle: 'biceps', equipment: 'dumbbells', gif: 'Hammer_Curls' },
  { id: 'rosca-concentrada', name: 'Rosca concentrada (halter)', muscle: 'biceps', equipment: 'dumbbells', gif: 'Concentration_Curls' },
  { id: 'rosca-cabo', name: 'Rosca no cabo', muscle: 'biceps', equipment: 'cable', gif: 'Cable_Hammer_Curls_-_Rope_Attachment' },
  { id: 'rosca-scott', name: 'Rosca scott (barra W)', muscle: 'biceps', equipment: 'barbell' },
  { id: 'rosca-barra-ez', name: 'Rosca direta (barra EZ)', muscle: 'biceps', equipment: 'barbell', gif: 'EZ-Bar_Curl' },
  { id: 'rosca-martelo-cabo', name: 'Rosca martelo no cabo (corda)', muscle: 'biceps', equipment: 'cable' },
  { id: 'rosca-spider', name: 'Rosca spider (banco inclinado)', muscle: 'biceps', equipment: 'barbell' },
  { id: 'rosca-inversa', name: 'Rosca inversa (barra)', muscle: 'biceps', equipment: 'barbell' },
  { id: 'rosca-inclinada-halteres', name: 'Rosca inclinada (halteres)', muscle: 'biceps', equipment: 'dumbbells', gif: 'Alternate_Incline_Dumbbell_Curl' },
  { id: 'rosca-zottman', name: 'Rosca Zottman (halteres)', muscle: 'biceps', equipment: 'dumbbells', gif: 'Zottman_Curl' },
  { id: 'rosca-maquina', name: 'Rosca na máquina', muscle: 'biceps', equipment: 'machine' },

  // Tríceps
  { id: 'triceps-corda', name: 'Tríceps na corda (cabo)', muscle: 'triceps', equipment: 'cable', gif: 'Triceps_Pushdown' },
  { id: 'triceps-barra-cabo', name: 'Tríceps na barra (cabo)', muscle: 'triceps', equipment: 'cable', gif: 'Triceps_Pushdown' },
  { id: 'triceps-testa', name: 'Tríceps testa (barra)', muscle: 'triceps', equipment: 'barbell', gif: 'EZ-Bar_Skullcrusher' },
  { id: 'triceps-frances', name: 'Tríceps francês (halter)', muscle: 'triceps', equipment: 'dumbbells', gif: 'Dumbbell_One-Arm_Triceps_Extension' },
  { id: 'mergulho-banco', name: 'Mergulho no banco', muscle: 'triceps', equipment: 'bodyweight', gif: 'Dips_-_Triceps_Version' },
  { id: 'paralelas-triceps', name: 'Paralelas (foco tríceps)', muscle: 'triceps', equipment: 'bodyweight', gif: 'Parallel_Bar_Dip' },
  { id: 'triceps-coice', name: 'Tríceps coice (halter)', muscle: 'triceps', equipment: 'dumbbells' },
  { id: 'supino-pegada-fechada', name: 'Supino pegada fechada (barra)', muscle: 'triceps', equipment: 'barbell', gif: 'Close-Grip_Barbell_Bench_Press' },
  { id: 'mergulho-maquina', name: 'Mergulho na máquina', muscle: 'triceps', equipment: 'machine' },
  { id: 'triceps-cabo-barra-v', name: 'Tríceps no cabo (barra V)', muscle: 'triceps', equipment: 'cable', gif: 'Triceps_Pushdown_-_V-Bar_Attachment' },
  { id: 'triceps-unilateral-halter', name: 'Tríceps unilateral (halter)', muscle: 'triceps', equipment: 'dumbbells' },
  { id: 'supino-chao', name: 'Supino no chão (barra)', muscle: 'triceps', equipment: 'barbell' },

  // Core
  { id: 'prancha', name: 'Prancha (plank)', muscle: 'core', equipment: 'bodyweight', gif: 'Plank' },
  { id: 'prancha-lateral', name: 'Prancha lateral', muscle: 'core', equipment: 'bodyweight', gif: 'Side_Bridge' },
  { id: 'abdominal-supra', name: 'Abdominal supra', muscle: 'core', equipment: 'bodyweight', gif: 'Crunch' },
  { id: 'abdominal-infra', name: 'Abdominal infra (elevação de pernas)', muscle: 'core', equipment: 'bodyweight', gif: 'Flat_Bench_Leg_Pull-In' },
  { id: 'abdominal-maquina', name: 'Abdominal na máquina', muscle: 'core', equipment: 'machine' },
  { id: 'russian-twist', name: 'Russian twist', muscle: 'core', equipment: 'bodyweight', gif: 'Russian_Twist' },
  { id: 'ab-wheel', name: 'Roda abdominal (ab wheel)', muscle: 'core', equipment: 'bodyweight', gif: 'Ab_Roller' },
  { id: 'elevacao-pernas-suspensa', name: 'Elevação de pernas suspenso', muscle: 'core', equipment: 'bodyweight', gif: 'Hanging_Leg_Raise' },
  { id: 'abdominal-cabo', name: 'Abdominal no cabo (crunch)', muscle: 'core', equipment: 'cable' },
  { id: 'dead-bug', name: 'Dead bug', muscle: 'core', equipment: 'bodyweight', gif: 'Dead_Bug' },
  { id: 'pallof-press', name: 'Pallof press (cabo)', muscle: 'core', equipment: 'cable', gif: 'Pallof_Press' },
  { id: 'inclinacao-lateral-barra', name: 'Inclinação lateral (barra)', muscle: 'core', equipment: 'barbell' },
  { id: 'abdominal-inverso', name: 'Abdominal inverso (reverse crunch)', muscle: 'core', equipment: 'bodyweight', gif: 'Reverse_Crunch' },
  { id: 'abdominal-bicicleta', name: 'Abdominal bicicleta (air bike)', muscle: 'core', equipment: 'bodyweight', gif: 'Air_Bike' },
  { id: 'abdominal-banco-declinado', name: 'Abdominal no banco declinado', muscle: 'core', equipment: 'bodyweight' },

  // Glúteos
  { id: 'hip-thrust', name: 'Hip thrust (barra)', muscle: 'glutes', equipment: 'barbell', gif: 'Barbell_Hip_Thrust' },
  { id: 'abducao-maquina', name: 'Abdução de anca (máquina)', muscle: 'glutes', equipment: 'machine' },
  { id: 'agachamento-sumo', name: 'Agachamento sumo (halter)', muscle: 'glutes', equipment: 'dumbbells' },
  { id: 'gluteo-kickback-cabo', name: 'Glúteo no cabo (kickback)', muscle: 'glutes', equipment: 'cable', gif: 'Glute_Kickback' },
  { id: 'step-up', name: 'Step-up (halteres)', muscle: 'glutes', equipment: 'dumbbells', gif: 'Barbell_Step_Ups' },
  { id: 'ponte-gluteo-barra', name: 'Ponte de glúteo (barra)', muscle: 'glutes', equipment: 'barbell', gif: 'Barbell_Glute_Bridge' },
  { id: 'ponte-gluteo-unilateral', name: 'Ponte de glúteo unilateral', muscle: 'glutes', equipment: 'bodyweight' },
  { id: 'monster-walk', name: 'Monster walk (banda elástica)', muscle: 'glutes', equipment: 'bands' },
  { id: 'pull-through-cabo', name: 'Pull through (cabo)', muscle: 'glutes', equipment: 'cable', gif: 'Pull_Through' },

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
  { id: 'mountain-climbers', name: 'Mountain climbers', muscle: 'cardio', equipment: 'none', gif: 'Mountain_Climbers' },
]

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function searchExercises(query: string, muscle?: string | null): ExerciseEntry[] {
  const byMuscle = muscle ? EXERCISES.filter(e => e.muscle === muscle) : EXERCISES
  if (!query.trim()) return byMuscle
  const q = normalize(query)
  return byMuscle.filter(e => normalize(e.name).includes(q))
}
