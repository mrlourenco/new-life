import { useRef, useState } from 'react'
import { Upload, Trash2, ChevronDown, ChevronUp, AlertCircle, Copy, Check, Download, Plus, Zap } from 'lucide-react'
import type { NutritionPlan, MealTemplate, DayNutritionLog } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { exportNutritionData, GOAL_PT, dowLabel, templateMacros } from '../../utils/nutrition'
import NutritionPlanBuilder from '../../components/nutrition/NutritionPlanBuilder'
import MacroBar from '../../components/nutrition/MacroBar'

interface Props {
  plans: NutritionPlan[]
  templates: MealTemplate[]
  logs: DayNutritionLog[]
  onSave: (plan: NutritionPlan) => void
  onDelete: (id: string) => void
  onActivate: (id: string | null) => void
  onImportTemplates: (templates: MealTemplate[]) => void
}

const LLM_PROMPT = `És um nutricionista especialista em planeamento alimentar.
Gera uma biblioteca de refeições reutilizáveis e um plano semanal em formato JSON.

REGRAS:
- "templates": lista de refeições reutilizáveis (peças que o plano referencia por ID)
- "plan.days": mapeia dia da semana a IDs de templates (0=Dom, 1=Seg, ..., 6=Sáb)
- "category": um de "pequeno-almoço", "lanche-manha", "almoço", "lanche-tarde", "jantar", "outro"
- "goal": "weight_loss" | "muscle_gain" | "maintenance" | "general"
- Inclui pelo menos 5 refeições por dia
- Cada alimento deve ter "calories"; macros são recomendados

FORMATO JSON:
{
  "version": 2,
  "templates": [
    {
      "id": "pa-aveia",
      "name": "Aveia com leite",
      "category": "pequeno-almoço",
      "notes": "Opcional",
      "foods": [
        { "name": "Aveia", "quantity": "80g", "calories": 304, "protein_g": 10.4, "carbs_g": 54, "fat_g": 6.4, "fiber_g": 8 },
        { "name": "Leite meio-gordo", "quantity": "200ml", "calories": 92, "protein_g": 6.4, "carbs_g": 9.4, "fat_g": 3 }
      ]
    }
  ],
  "plan": {
    "id": "plano-definicao-v1",
    "name": "Plano de definição",
    "description": "Défice calórico moderado com foco em proteína",
    "goal": "weight_loss",
    "daily_calories_target": 1800,
    "days": [
      { "day_of_week": 1, "template_ids": ["pa-aveia", "lanche-fruta", "almoco-frango", "lanche-iogurte", "jantar-peixe"] },
      { "day_of_week": 2, "template_ids": ["pa-ovos", "lanche-fruta", "almoco-massa", "lanche-iogurte", "jantar-carne"] }
    ]
  }
}

RESPONDE APENAS COM O JSON, sem markdown, sem \`\`\`json.

MEU PEDIDO:
[objetivo, calorias pretendidas, restrições alimentares, preferências, dias a cobrir]`

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${copied ? 'bg-green-900/40 text-green-400' : 'bg-[#2e2e2e] text-[#a3a3a3] hover:text-white'}`}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  )
}

function validateImport(data: unknown): { templates?: MealTemplate[]; plan?: Omit<NutritionPlan, 'active'> } | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  if (d.version !== 2) return null
  return { templates: Array.isArray(d.templates) ? d.templates as MealTemplate[] : undefined, plan: d.plan as Omit<NutritionPlan, 'active'> | undefined }
}

export default function NutritionPlansPage({ plans, templates, logs, onSave, onDelete, onActivate, onImportTemplates }: Props) {
  const [showBuilder, setShowBuilder] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (showBuilder) {
    return (
      <NutritionPlanBuilder
        templates={templates}
        onSave={plan => { onSave(plan); setShowBuilder(false) }}
        onCancel={() => setShowBuilder(false)}
      />
    )
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        const parsed = validateImport(data)
        if (!parsed) throw new Error('Formato inválido (version: 2 necessário)')
        if (parsed.templates?.length) onImportTemplates(parsed.templates)
        if (parsed.plan) onSave({ ...parsed.plan, active: false })
        setError(null)
      } catch (err) { setError((err as Error).message) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const planDayKcal = (plan: NutritionPlan) => {
    const counts: number[] = plan.days.map(d => {
      const kcal = d.template_ids.reduce((acc, id) => {
        const t = templates.find(tt => tt.id === id)
        return acc + (t ? templateMacros(t).calories : 0)
      }, 0)
      return kcal
    })
    return counts.length ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length) : 0
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
      <h2 className="text-lg font-bold text-white">Planos alimentares</h2>

      {/* Actions */}
      <div className="space-y-2">
        <button onClick={() => setShowBuilder(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#22c55e] rounded-xl text-white font-semibold">
          <Plus size={18} />Criar plano manualmente
        </button>
        <input ref={fileRef} type="file" accept=".json,.txt" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#22c55e]/50">
          <Upload size={16} />Importar plano via JSON (v2)
        </button>
        {(plans.length > 0 || templates.length > 0) && (
          <button onClick={() => exportNutritionData(templates, plans, logs)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#22c55e]/50">
            <Download size={16} />Exportar todos os dados
          </button>
        )}
      </div>

      {error && (
        <div className="flex gap-2 items-start px-3 py-2.5 bg-red-900/30 border border-red-800/50 rounded-xl text-sm text-red-400">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* LLM Prompt */}
      <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
        <button onClick={() => setShowPrompt(!showPrompt)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#a3a3a3]">
          <span className="flex items-center gap-2"><Zap size={14} />Prompt para ChatGPT / Claude</span>
          {showPrompt ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showPrompt && (
          <div className="border-t border-[#2e2e2e]">
            <div className="flex justify-end px-3 pt-2"><CopyButton text={LLM_PROMPT} /></div>
            <pre className="px-4 pb-4 pt-2 text-[10px] text-[#737373] overflow-x-auto leading-relaxed whitespace-pre-wrap">{LLM_PROMPT}</pre>
          </div>
        )}
      </div>

      {/* Plans list */}
      {plans.length === 0 ? (
        <p className="text-center text-[#525252] text-sm py-8">Sem planos. Cria um manualmente ou importa via JSON.</p>
      ) : (
        <div className="space-y-3">
          {[...plans].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)).map(plan => {
            const avgKcal = planDayKcal(plan)
            const isExpanded = expanded === plan.id
            return (
              <div key={plan.id} className={`bg-[#1a1a1a] rounded-2xl overflow-hidden ${plan.active ? 'ring-1 ring-[#22c55e]' : ''}`}>
                <div className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0" onClick={() => setExpanded(isExpanded ? null : plan.id)}>
                      <div className="flex items-center gap-2">
                        {plan.active && <span className="text-[10px] bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full font-medium">Ativo</span>}
                        <p className="text-white font-semibold truncate">{plan.name}</p>
                      </div>
                      <p className="text-[#737373] text-xs mt-0.5">
                        {GOAL_PT[plan.goal ?? ''] ?? 'Geral'}
                        {plan.daily_calories_target && ` · ${plan.daily_calories_target} kcal alvo`}
                        {avgKcal > 0 && ` · ~${avgKcal} kcal/dia médio`}
                        {` · ${plan.days.length} dias`}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => onDelete(plan.id)} className="p-1.5 text-[#525252] hover:text-red-400"><Trash2 size={15} /></button>
                      <button onClick={() => setExpanded(isExpanded ? null : plan.id)} className="p-1.5 text-[#525252]">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Activate / deactivate */}
                  <button
                    onClick={() => onActivate(plan.active ? null : plan.id)}
                    className={`mt-3 w-full py-2 rounded-xl text-xs font-semibold transition-colors ${plan.active ? 'bg-[#2e2e2e] text-[#737373]' : 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 hover:border-[#22c55e]/60'}`}>
                    {plan.active ? 'Desativar' : 'Definir como ativo'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#2e2e2e] px-4 py-3 space-y-3">
                    {plan.description && <p className="text-[#737373] text-xs">{plan.description}</p>}
                    {[...plan.days].sort((a, b) => a.day_of_week - b.day_of_week).map(day => {
                      const dayTemplates = day.template_ids.map(id => templates.find(t => t.id === id)).filter(Boolean) as MealTemplate[]
                      const kcal = dayTemplates.reduce((acc, t) => acc + templateMacros(t).calories, 0)
                      // Group by category display order
                      const byCategory = MEAL_CATEGORIES.map(cat => ({
                        cat,
                        items: dayTemplates.filter(t => t.category === cat.id),
                      })).filter(g => g.items.length > 0)
                      return (
                        <div key={day.day_of_week} className="bg-[#0f0f0f] rounded-xl p-3">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-semibold text-white">{dowLabel(day.day_of_week)}</p>
                            <span className="text-xs text-[#737373]">{Math.round(kcal)} kcal total</span>
                          </div>
                          {byCategory.length === 0 && (
                            <p className="text-[10px] text-[#525252]">Sem refeições</p>
                          )}
                          {byCategory.map(({ cat, items }) => (
                            <div key={cat.id} className="mb-2 last:mb-0">
                              <p className="text-[10px] text-[#525252] font-semibold uppercase tracking-wider mb-1">{cat.label}</p>
                              <div className="space-y-1.5">
                                {items.map(t => {
                                  const m = templateMacros(t)
                                  return (
                                    <div key={t.id} className="bg-[#1a1a1a] rounded-xl px-3 py-2.5">
                                      <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs font-medium text-white truncate">{t.name}</p>
                                        <span className="text-xs font-bold text-white ml-2 flex-shrink-0">{Math.round(m.calories)} kcal</span>
                                      </div>
                                      <MacroBar macros={m} compact />
                                      <div className="flex gap-3 mt-1">
                                        <span className="text-[10px] text-[#60a5fa]">P {Math.round(m.protein_g)}g</span>
                                        <span className="text-[10px] text-[#f97316]">C {Math.round(m.carbs_g)}g</span>
                                        <span className="text-[10px] text-[#a78bfa]">G {Math.round(m.fat_g)}g</span>
                                      </div>
                                      {t.foods.length > 0 && (
                                        <p className="text-[9px] text-[#3f3f3f] mt-1 truncate">
                                          {t.foods.map(f => f.name).join(' · ')}
                                        </p>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                          {day.template_ids.some(id => !templates.find(t => t.id === id)) && (
                            <p className="text-[9px] text-[#525252] mt-1">
                              {day.template_ids.filter(id => !templates.find(t => t.id === id)).length} refeição(ões) não encontrada(s) na biblioteca
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
