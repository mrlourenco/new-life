import { EXERCISES } from '../data/exercises'
import type { WorkoutPlan, WorkoutSession, Exercise } from '../types/workout'

export interface PlanPrefs {
  goal: WorkoutPlan['goal']
  days: number
  equipment: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
}

function uid() { return Math.random().toString(36).slice(2, 9) }

function buildPrompt(prefs: PlanPrefs): string {
  const levelLabel = { beginner: 'iniciante', intermediate: 'intermédio', advanced: 'avançado' }[prefs.level]
  const goalLabel = { hypertrophy: 'hipertrofia', strength: 'força', endurance: 'resistência', general: 'geral' }[prefs.goal]

  const catalog = EXERCISES
    .filter(e => e.muscle !== 'cardio' && (prefs.equipment.includes(e.equipment) || e.equipment === 'bodyweight'))
    .map(e => `${e.id} | ${e.name} | ${e.muscle} | ${e.equipment}`)
    .join('\n')

  return `És um personal trainer experiente. Cria um plano de treino semanal em JSON.

CATÁLOGO DE EXERCÍCIOS (usa APENAS estes; copia o nome exatamente):
id | nome | músculo | equipamento
${catalog}

PREFERÊNCIAS DO UTILIZADOR:
- Objetivo: ${goalLabel}
- Dias por semana: ${prefs.days}
- Equipamento disponível: ${prefs.equipment.join(', ')}
- Nível: ${levelLabel}

REGRAS:
1. Cria exatamente ${prefs.days} sessões (uma por dia de treino)
2. Cada sessão deve ter 4-6 exercícios para iniciante, 5-7 para intermédio, 6-9 para avançado
3. Distribui os grupos musculares de forma equilibrada ao longo da semana
4. Séries: 3 para iniciante, 3-4 para intermédio, 4-5 para avançado
5. Reps: conforme objetivo (hipertrofia 8-12, força 4-6, resistência 12-20, geral 8-15)
6. Descanso (rest_seconds): força 180-240, hipertrofia 60-120, resistência 30-60
7. Usa APENAS exercícios do catálogo acima com o nome EXATO

Responde APENAS com JSON válido, sem texto adicional, com esta estrutura exata:
{
  "name": "nome descritivo do plano",
  "goal": "${prefs.goal}",
  "days_per_week": ${prefs.days},
  "sessions": [
    {
      "name": "nome da sessão (ex: Push A, Pernas, Full Body)",
      "muscle_groups": ["músculo1", "músculo2"],
      "exercises": [
        {
          "name": "nome exato do exercício do catálogo",
          "muscle": "músculo",
          "equipment": "equipamento",
          "sets": 4,
          "reps": "8-12",
          "rest_seconds": 90
        }
      ]
    }
  ]
}`
}

export async function generateWorkoutPlan(prefs: PlanPrefs): Promise<WorkoutPlan> {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('VITE_GEMINI_API_KEY não configurada no ficheiro .env')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(prefs) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Gemini API error ${res.status}`)
  }

  const data = await res.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const raw = JSON.parse(text) as {
    name: string
    goal: WorkoutPlan['goal']
    days_per_week: number
    sessions: Array<{
      name: string
      muscle_groups: string[]
      exercises: Array<{
        name: string
        muscle: string
        equipment: string
        sets: number
        reps: string
        rest_seconds: number
      }>
    }>
  }

  const sessions: WorkoutSession[] = raw.sessions.map(s => ({
    id: uid(),
    name: s.name,
    muscle_groups: s.muscle_groups ?? [],
    exercises: s.exercises.map(e => ({
      id: uid(),
      name: e.name,
      muscle: e.muscle,
      equipment: e.equipment,
      sets: e.sets,
      reps: String(e.reps),
      rest_seconds: e.rest_seconds,
    } satisfies Exercise)),
  }))

  return {
    id: uid(),
    name: raw.name,
    goal: raw.goal ?? prefs.goal,
    days_per_week: sessions.length,
    sessions,
    updated_at: new Date().toISOString(),
  }
}
