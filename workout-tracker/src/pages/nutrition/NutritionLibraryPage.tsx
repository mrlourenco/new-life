import { useRef, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Upload, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { MealTemplate } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { templateMacros } from '../../utils/nutrition'
import MacroBar from '../../components/nutrition/MacroBar'
import MealTemplateEditor from '../../components/nutrition/MealTemplateEditor'

interface Props {
  templates: MealTemplate[]
  onSave: (t: MealTemplate) => void
  onDelete: (id: string) => void
  onImport: (templates: MealTemplate[]) => void
}

const LLM_PROMPT = `És um nutricionista especialista em planeamento alimentar.
Gera uma biblioteca de refeições reutilizáveis em formato JSON.

REGRAS:
- "category": um de "pequeno-almoço", "lanche-manha", "almoço", "lanche-tarde", "jantar", "outro"
- Inclui pelo menos 15 refeições variadas, cobrindo todas as categorias
- Cada alimento deve ter "calories" obrigatório; macros são recomendados

FORMATO JSON (array de templates):
[
  {
    "id": "pa-aveia-banana",
    "name": "Aveia com banana",
    "category": "pequeno-almoço",
    "notes": "Rica em fibra e energia",
    "foods": [
      { "name": "Aveia", "quantity": "80g", "calories": 304, "protein_g": 10.4, "carbs_g": 54, "fat_g": 6.4, "fiber_g": 8 },
      { "name": "Banana", "quantity": "1 unidade (120g)", "calories": 107, "protein_g": 1.3, "carbs_g": 27.6, "fat_g": 0.4, "fiber_g": 3.1 }
    ]
  }
]

RESPONDE APENAS COM O ARRAY JSON, sem texto antes ou depois, sem markdown.

MEU PEDIDO:
[descreve aqui: preferências alimentares, restrições, objetivo, número de refeições pretendidas por categoria]`

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

function validateTemplates(data: unknown): data is MealTemplate[] {
  if (!Array.isArray(data)) return false
  return data.every(t => typeof t?.id === 'string' && typeof t?.name === 'string' && Array.isArray(t?.foods))
}

export default function NutritionLibraryPage({ templates, onSave, onDelete, onImport }: Props) {
  const [editing, setEditing] = useState<MealTemplate | 'new' | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (editing) {
    return (
      <MealTemplateEditor
        template={editing === 'new' ? undefined : editing}
        onSave={t => { onSave(t); setEditing(null) }}
        onCancel={() => setEditing(null)}
      />
    )
  }

  let filtered = templates
  if (category) filtered = filtered.filter(t => t.category === category)
  if (query) filtered = filtered.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        // Accept array of templates directly or {templates: [...]}
        const arr = Array.isArray(data) ? data : data.templates
        if (!validateTemplates(arr)) throw new Error('Formato inválido')
        onImport(arr)
        setError(null)
      } catch { setError('JSON inválido. Verifica o formato.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Refeições</h2>
        <button onClick={() => setEditing('new')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#22c55e] rounded-xl text-white text-sm font-semibold">
          <Plus size={16} />Nova
        </button>
      </div>

      {/* Import */}
      <div className="mb-4 space-y-2">
        <input ref={fileRef} type="file" accept=".json,.txt" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#22c55e]/50">
          <Upload size={15} />Importar refeições (JSON)
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mb-3 px-1">{error}</p>}

      {/* LLM Prompt */}
      <div className="mb-4 bg-[#1a1a1a] rounded-xl overflow-hidden">
        <button onClick={() => setShowPrompt(!showPrompt)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#a3a3a3]">
          <span>Prompt para gerar refeições (ChatGPT / Claude)</span>
          {showPrompt ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showPrompt && (
          <div className="border-t border-[#2e2e2e]">
            <div className="flex justify-end px-3 pt-2"><CopyButton text={LLM_PROMPT} /></div>
            <pre className="px-4 pb-4 pt-2 text-[10px] text-[#737373] overflow-x-auto leading-relaxed whitespace-pre-wrap">{LLM_PROMPT}</pre>
          </div>
        )}
      </div>

      {/* Search & filter */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
          <Search size={14} className="text-[#525252]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar..."
            className="flex-1 bg-transparent text-white text-sm placeholder-[#525252] outline-none" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button onClick={() => setCategory(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${!category ? 'bg-[#22c55e] text-black' : 'bg-[#2e2e2e] text-[#a3a3a3]'}`}>
            Todas
          </button>
          {MEAL_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(category === cat.id ? null : cat.id)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-medium ${category === cat.id ? 'bg-[#22c55e] text-black' : 'bg-[#2e2e2e] text-[#a3a3a3]'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-center text-[#525252] text-sm py-8">
          {templates.length === 0 ? 'Sem refeições. Cria a primeira ou importa via JSON.' : 'Sem resultados.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => {
            const m = templateMacros(t)
            const catLabel = MEAL_CATEGORIES.find(c => c.id === t.category)?.label
            return (
              <div key={t.id} className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                      <span className="text-sm font-bold text-white flex-shrink-0">{Math.round(m.calories)} kcal</span>
                    </div>
                    <p className="text-[10px] text-[#525252] mt-0.5">{catLabel} · {t.foods.length} alimentos</p>
                    <div className="mt-2"><MacroBar macros={m} compact /></div>
                    <div className="flex gap-3 mt-1.5">
                      <span className="text-[10px] text-[#60a5fa]">P {Math.round(m.protein_g)}g</span>
                      <span className="text-[10px] text-[#f97316]">C {Math.round(m.carbs_g)}g</span>
                      <span className="text-[10px] text-[#a78bfa]">G {Math.round(m.fat_g)}g</span>
                      {m.fiber_g > 0 && <span className="text-[10px] text-[#14b8a6]">F {Math.round(m.fiber_g)}g</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => setEditing(t)} className="p-1.5 text-[#525252] hover:text-[#a3a3a3]"><Pencil size={14} /></button>
                    <button onClick={() => onDelete(t.id)} className="p-1.5 text-[#525252] hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
