import { useRef, useState } from 'react'
import { Upload, Trash2, ChevronDown, ChevronUp, AlertCircle, Copy, Check, Download } from 'lucide-react'
import type { MealPlan, DayNutritionLog } from '../../types/nutrition'
import { exportNutritionData, GOAL_PT, dowLabel } from '../../utils/nutrition'

interface Props {
  plans: MealPlan[]
  logs: DayNutritionLog[]
  onAdd: (plan: MealPlan) => void
  onDelete: (id: string) => void
}

const LLM_PROMPT = `És um nutricionista especialista em planeamento alimentar.
Gera um plano alimentar no formato JSON exato abaixo.

REGRAS DO FORMATO:
- "id": string única sem espaços (ex: "plano-perda-peso-v1")
- "goal": apenas um destes valores: "weight_loss", "muscle_gain", "maintenance", "general"
- "type": "weekly" (repete cada semana) ou "custom" (datas específicas)
- "day_of_week": usado quando type="weekly" — 0=Domingo, 1=Segunda, ..., 6=Sábado
- "date": usado quando type="custom" — formato "YYYY-MM-DD"
- "order": ordem das refeições (1, 2, 3...)
- Inclui pelo menos 5 refeições por dia: Pequeno-almoço, Lanche manhã, Almoço, Lanche tarde, Jantar
- Todos os "id" dentro de days e meals devem ser únicos
- "calories" é obrigatório para cada alimento; macros são opcionais mas recomendados

FORMATO JSON (segue exatamente esta estrutura):
{
  "id": "plano-semana-v1",
  "name": "Nome do Plano",
  "description": "Descrição do plano",
  "goal": "weight_loss",
  "daily_calories_target": 2000,
  "type": "weekly",
  "days": [
    {
      "id": "dia-1",
      "day_of_week": 1,
      "label": "Segunda-feira",
      "notes": "Dia de treino intenso",
      "meals": [
        {
          "id": "ref-1-1",
          "order": 1,
          "name": "Pequeno-almoço",
          "time": "08:00",
          "notes": "Refeição rica em proteína",
          "foods": [
            {
              "name": "Aveia",
              "quantity": "80g",
              "calories": 304,
              "protein_g": 10.4,
              "carbs_g": 54.0,
              "fat_g": 6.4,
              "fiber_g": 8.0
            }
          ]
        }
      ]
    }
  ]
}

RESPONDE APENAS COM O JSON, sem texto antes ou depois, sem markdown, sem \`\`\`json.

MEU PEDIDO:
[descreve aqui: objetivo, calorias pretendidas, restrições alimentares, preferências, alergias, tipo de dieta]`

const JSON_EXAMPLE = `{
  "id": "plano-semana-v1",
  "name": "Nome do Plano",
  "description": "Descrição",
  "goal": "weight_loss",       // weight_loss|muscle_gain|maintenance|general
  "daily_calories_target": 2000,
  "type": "weekly",            // weekly|custom
  "days": [
    {
      "id": "dia-1",
      "day_of_week": 1,        // 0=Dom 1=Seg ... 6=Sáb (quando type=weekly)
      "label": "Segunda-feira",
      "notes": "Opcional",
      "meals": [
        {
          "id": "ref-1-1",
          "order": 1,
          "name": "Pequeno-almoço",
          "time": "08:00",
          "notes": "Opcional",
          "foods": [
            {
              "name": "Aveia",
              "quantity": "80g",
              "calories": 304,
              "protein_g": 10.4,
              "carbs_g": 54.0,
              "fat_g": 6.4,
              "fiber_g": 8.0
            }
          ]
        }
      ]
    }
  ]
}`

function validateMealPlan(data: unknown): data is MealPlan {
  if (!data || typeof data !== 'object') return false
  const p = data as Record<string, unknown>
  if (typeof p.id !== 'string') return false
  if (typeof p.name !== 'string') return false
  if (!Array.isArray(p.days)) return false
  if (p.type !== 'weekly' && p.type !== 'custom') return false
  return true
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        copied ? 'bg-green-900/40 text-green-400' : 'bg-[#2e2e2e] text-[#a3a3a3] hover:text-white'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  )
}

export default function NutritionPlansPage({ plans, logs, onAdd, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showFormat, setShowFormat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!validateMealPlan(data)) throw new Error('Formato inválido')
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
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
      <h2 className="text-lg font-bold text-white mb-4">Planos alimentares</h2>

      {/* Actions */}
      <div className="mb-4 space-y-2">
        <input ref={fileRef} type="file" accept=".json,.txt" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#22c55e] rounded-xl text-white font-semibold hover:bg-[#16a34a] transition-colors"
        >
          <Upload size={18} />
          Importar plano (JSON / TXT)
        </button>

        {plans.length > 0 && (
          <button
            onClick={() => exportNutritionData(plans, logs)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#22c55e]/50 transition-colors"
          >
            <Download size={16} />
            Exportar todos os dados
          </button>
        )}
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

      {/* JSON Format */}
      <div className="mb-5 bg-[#1a1a1a] rounded-xl overflow-hidden">
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
              <CopyButton text={JSON_EXAMPLE} />
            </div>
            <pre className="px-4 pb-4 pt-2 text-[10px] text-[#737373] overflow-x-auto leading-relaxed">
              {JSON_EXAMPLE}
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
                    {GOAL_PT[plan.goal ?? ''] ?? plan.goal ?? 'Geral'}
                    {plan.daily_calories_target && ` · ${plan.daily_calories_target} kcal/dia`}
                    {' · '}{plan.days.length} dias · {plan.type === 'weekly' ? 'Semanal' : 'Personalizado'}
                  </p>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDelete(plan.id)}
                    className="p-2 text-[#525252] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
                    className="p-2 text-[#525252]"
                  >
                    {expanded === plan.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === plan.id && (
                <div className="border-t border-[#2e2e2e] px-4 py-3 space-y-2">
                  {plan.description && (
                    <p className="text-[#737373] text-xs mb-3">{plan.description}</p>
                  )}
                  {[...plan.days]
                    .sort((a, b) => (a.day_of_week ?? 0) - (b.day_of_week ?? 0))
                    .map(day => {
                      const label = day.label ?? (day.day_of_week !== undefined ? dowLabel(day.day_of_week) : day.date ?? '')
                      const kcal = day.meals.reduce((acc, m) => acc + m.foods.reduce((a, f) => a + (f.calories ?? 0), 0), 0)
                      return (
                        <div key={day.id} className="bg-[#0f0f0f] rounded-xl px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-white text-sm font-medium capitalize">{label}</p>
                            <span className="text-xs text-[#737373]">{Math.round(kcal)} kcal</span>
                          </div>
                          <p className="text-[#525252] text-xs mt-1">{day.meals.length} refeições</p>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                            {[...day.meals].sort((a, b) => a.order - b.order).slice(0, 5).map(m => (
                              <span key={m.id} className="text-[10px] text-[#737373]">{m.name}</span>
                            ))}
                            {day.meals.length > 5 && (
                              <span className="text-[10px] text-[#525252]">+{day.meals.length - 5} mais</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
