import { useState, useRef } from 'react'
import { Upload, ChevronDown, ChevronUp, AlertCircle, Plus, Copy, Check } from 'lucide-react'
import type { WorkoutPlan } from '../../types/workout'
import { validatePlan } from '../../utils/validateWorkoutPlan'

interface Props {
  onAdd: (plan: WorkoutPlan) => void
  onCreateClick: () => void
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

export default function PlanImportSection({ onAdd, onCreateClick }: Props) {
  const [showFormat, setShowFormat] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  return (
    <>
      {/* Actions */}
      <div className="mb-6 space-y-2">
        <button
          onClick={onCreateClick}
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
    </>
  )
}
