import { useState, useRef } from 'react'
import { Upload, Trash2, ChevronDown, ChevronUp, AlertCircle, Plus, Copy, Check } from 'lucide-react'
import type { WorkoutPlan } from '../types/workout'
import PlanBuilder from '../components/PlanBuilder'

interface Props {
  plans: WorkoutPlan[]
  onAdd: (plan: WorkoutPlan) => void
  onDelete: (id: string) => void
}

const GOAL_LABELS: Record<string, string> = {
  strength: 'Força',
  hypertrophy: 'Hipertrofia',
  endurance: 'Resistência',
  general: 'Geral',
}

const LLM_PROMPT = `És um personal trainer especialista em programação de treino.
Gera um plano de treino no formato JSON exato abaixo.

REGRAS DO FORMATO:
- "id": string única sem espaços (ex: "ppl-hypertrofia-v1")
- "goal": apenas um destes valores: "strength", "hypertrophy", "endurance", "general"
- "day_of_week": 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
- "reps": pode ser "8-10", "12", "AMRAP", "30s", etc.
- "rest_seconds": número inteiro (ex: 90)
- "muscle": em inglês minúsculas (ex: "chest", "back", "legs", "shoulders", "biceps", "triceps", "core", "glutes", "cardio")
- "equipment": em inglês (ex: "barbell", "dumbbells", "cable", "machine", "bodyweight")
- "weight_suggestion": opcional, ex: "70% 1RM", "bodyweight", "moderado"
- Todos os "id" dentro de sessions e exercises devem ser únicos

FORMATO JSON (segue exatamente esta estrutura):
{
  "id": "...",
  "name": "...",
  "goal": "...",
  "description": "...",
  "days_per_week": 3,
  "sessions": [
    {
      "id": "...",
      "name": "...",
      "day_of_week": 1,
      "muscle_groups": ["chest", "shoulders", "triceps"],
      "exercises": [
        {
          "id": "...",
          "name": "Nome em Português",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "muscle": "chest",
          "equipment": "barbell",
          "notes": "Dica técnica opcional",
          "weight_suggestion": "70% 1RM"
        }
      ]
    }
  ]
}

RESPONDE APENAS COM O JSON, sem texto antes ou depois, sem markdown, sem \`\`\`json.

MEU PEDIDO:
[descreve aqui o teu objetivo, dias disponíveis por semana, equipamento disponível, nível de experiência]`

const EXAMPLE_PLAN: WorkoutPlan = {
  id: 'example-ppl-v1',
  name: 'Push/Pull/Legs — Hipertrofia',
  goal: 'hypertrophy',
  description: 'Programa 6 dias/semana para hipertrofia muscular',
  days_per_week: 6,
  sessions: [
    {
      id: 'push-a',
      name: 'Push A',
      day_of_week: 1,
      muscle_groups: ['chest', 'shoulders', 'triceps'],
      exercises: [
        { id: 'p1', name: 'Supino Plano', sets: 4, reps: '8-10', rest_seconds: 90, muscle: 'chest', equipment: 'barbell', notes: 'Controlar descida em 3 seg' },
        { id: 'p2', name: 'Press Militar', sets: 3, reps: '10-12', rest_seconds: 75, muscle: 'shoulders', equipment: 'barbell' },
        { id: 'p3', name: 'Crucifixo com Halteres', sets: 3, reps: '12-15', rest_seconds: 60, muscle: 'chest', equipment: 'dumbbells' },
        { id: 'p4', name: 'Extensão de Tríceps', sets: 3, reps: '12-15', rest_seconds: 60, muscle: 'triceps', equipment: 'cable' },
      ]
    },
    {
      id: 'pull-a',
      name: 'Pull A',
      day_of_week: 2,
      muscle_groups: ['back', 'biceps'],
      exercises: [
        { id: 'pu1', name: 'Barra Fixa', sets: 4, reps: '6-8', rest_seconds: 120, muscle: 'back', equipment: 'bodyweight' },
        { id: 'pu2', name: 'Remada com Barra', sets: 4, reps: '8-10', rest_seconds: 90, muscle: 'back', equipment: 'barbell' },
        { id: 'pu3', name: 'Rosca Direta', sets: 3, reps: '10-12', rest_seconds: 60, muscle: 'biceps', equipment: 'barbell' },
      ]
    },
    {
      id: 'legs-a',
      name: 'Legs A',
      day_of_week: 3,
      muscle_groups: ['legs', 'glutes'],
      exercises: [
        { id: 'l1', name: 'Agachamento', sets: 4, reps: '6-8', rest_seconds: 120, muscle: 'legs', equipment: 'barbell', weight_suggestion: '70-80% 1RM' },
        { id: 'l2', name: 'Leg Press', sets: 3, reps: '10-12', rest_seconds: 90, muscle: 'legs', equipment: 'machine' },
        { id: 'l3', name: 'Extensão de Pernas', sets: 3, reps: '12-15', rest_seconds: 60, muscle: 'legs', equipment: 'machine' },
        { id: 'l4', name: 'Panturrilha em Pé', sets: 4, reps: '15-20', rest_seconds: 45, muscle: 'legs', equipment: 'machine' },
      ]
    },
  ]
}

function validatePlan(data: unknown): data is WorkoutPlan {
  if (!data || typeof data !== 'object') return false
  const p = data as Record<string, unknown>
  if (typeof p.id !== 'string') return false
  if (typeof p.name !== 'string') return false
  if (!Array.isArray(p.sessions)) return false
  return true
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? 'bg-green-900/40 text-green-400' : 'bg-[#2e2e2e] text-[#a3a3a3] hover:text-white'}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  )
}

export default function PlansPage({ plans, onAdd, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showFormat, setShowFormat] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!validatePlan(data)) throw new Error('Formato inválido')
        onAdd(data)
        setError(null)
      } catch {
        setError('JSON inválido ou formato incorreto. Verifica a estrutura do ficheiro.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (showBuilder) {
    return (
      <PlanBuilder
        onSave={plan => { onAdd(plan); setShowBuilder(false) }}
        onCancel={() => setShowBuilder(false)}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-14 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Planos</h1>
      </div>

      {/* Actions */}
      <div className="mb-6 space-y-2">
        <button
          onClick={() => setShowBuilder(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#f97316] rounded-xl text-white font-semibold hover:bg-[#ea6c0a] transition-colors"
        >
          <Plus size={18} />
          Criar plano na app
        </button>

        <input ref={fileRef} type="file" accept=".json,.txt" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#f97316]/50 transition-colors"
        >
          <Upload size={16} />
          Importar ficheiro JSON / TXT
        </button>

        <button
          onClick={() => { onAdd(EXAMPLE_PLAN); setError(null) }}
          className="w-full py-3 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#f97316]/50 transition-colors"
        >
          Carregar plano de exemplo
        </button>
      </div>

      {error && (
        <div className="flex gap-2 items-start px-3 py-2.5 bg-red-900/30 border border-red-800/50 rounded-xl mb-4 text-sm text-red-400">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* LLM Prompt */}
      <div className="mb-3 bg-[#1a1a1a] rounded-xl overflow-hidden">
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#a3a3a3]"
        >
          <span>Prompt para ChatGPT / Claude</span>
          {showPrompt ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showPrompt && (
          <div className="border-t border-[#2e2e2e]">
            <div className="flex justify-end px-3 pt-2">
              <CopyButton text={LLM_PROMPT} />
            </div>
            <pre className="px-4 pb-4 pt-2 text-[10px] text-[#737373] overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {LLM_PROMPT}
            </pre>
          </div>
        )}
      </div>

      {/* JSON Format reference */}
      <div className="mb-4 bg-[#1a1a1a] rounded-xl overflow-hidden">
        <button
          onClick={() => setShowFormat(!showFormat)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#a3a3a3]"
        >
          <span>Formato JSON esperado</span>
          {showFormat ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showFormat && (
          <div className="border-t border-[#2e2e2e]">
            <div className="flex justify-end px-3 pt-2">
              <CopyButton text={`{
  "id": "meu-plano-v1",
  "name": "Nome do Plano",
  "goal": "hypertrophy",
  "description": "...",
  "days_per_week": 3,
  "sessions": [
    {
      "id": "sessao-1",
      "name": "Push A",
      "day_of_week": 1,
      "muscle_groups": ["chest","shoulders"],
      "exercises": [
        {
          "id": "ex-1",
          "name": "Supino Plano",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "muscle": "chest",
          "equipment": "barbell",
          "notes": "Opcional",
          "weight_suggestion": "70% 1RM"
        }
      ]
    }
  ]
}`} />
            </div>
            <pre className="px-4 pb-4 pt-2 text-[10px] text-[#737373] overflow-x-auto leading-relaxed">
{`{
  "id": "meu-plano-v1",
  "name": "Nome do Plano",
  "goal": "hypertrophy",    // strength|hypertrophy|endurance|general
  "description": "...",
  "days_per_week": 3,
  "sessions": [
    {
      "id": "sessao-1",
      "name": "Push A",
      "day_of_week": 1,     // 0=Dom 1=Seg ... 6=Sáb
      "muscle_groups": ["chest","shoulders"],
      "exercises": [
        {
          "id": "ex-1",
          "name": "Supino Plano",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "muscle": "chest",
          "equipment": "barbell",
          "notes": "Opcional",
          "weight_suggestion": "70% 1RM"
        }
      ]
    }
  ]
}`}
            </pre>
          </div>
        )}
      </div>

      {/* Plans list */}
      {plans.length === 0 ? (
        <p className="text-center text-[#525252] text-sm py-8">Sem planos importados</p>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <div key={plan.id} className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  className="flex-1 text-left"
                  onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
                >
                  <p className="text-white font-semibold">{plan.name}</p>
                  <p className="text-[#737373] text-xs mt-0.5">
                    {GOAL_LABELS[plan.goal] ?? plan.goal} · {plan.days_per_week}×/semana · {plan.sessions.length} sessões
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => onDelete(plan.id)} className="p-2 text-[#525252] hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => setExpanded(expanded === plan.id ? null : plan.id)} className="p-2 text-[#525252]">
                    {expanded === plan.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === plan.id && (
                <div className="border-t border-[#2e2e2e] px-4 py-3 space-y-2">
                  {plan.description && <p className="text-[#737373] text-xs mb-3">{plan.description}</p>}
                  {plan.sessions.map(session => (
                    <div key={session.id} className="bg-[#0f0f0f] rounded-xl px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm font-medium">{session.name}</p>
                        {session.day_of_week !== undefined && (
                          <span className="text-[10px] text-[#737373]">
                            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][session.day_of_week]}
                          </span>
                        )}
                      </div>
                      <p className="text-[#525252] text-xs mt-1">{session.exercises.length} exercícios</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {session.exercises.slice(0, 4).map(e => (
                          <span key={e.id} className="text-[10px] text-[#737373]">{e.name}</span>
                        ))}
                        {session.exercises.length > 4 && (
                          <span className="text-[10px] text-[#525252]">+{session.exercises.length - 4} mais</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
