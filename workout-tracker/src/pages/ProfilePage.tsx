import { useState } from 'react'
import { Trash2, Scale, Target, RefreshCw, LogOut, Mail, Cloud } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { MacroTargets, WeightEntry } from '../types/profile'
import type { DayNutritionLog, NutritionPlan, WeekAssignment } from '../types/nutrition'
import NutritionEvolutionPage from './nutrition/NutritionEvolutionPage'
import BackupSection from '../components/BackupSection'

type ProfileTab = 'perfil' | 'evolucao'

const KCAL: Record<keyof MacroTargets, number> = { protein_g: 4, carbs_g: 4, fat_g: 9, fiber_g: 2 }
const MACRO_MAX: Record<keyof MacroTargets, number> = { protein_g: 500, carbs_g: 500, fat_g: 200, fiber_g: 100 }

function targetKcal(t: MacroTargets) {
  return Math.round(t.protein_g * 4 + t.carbs_g * 4 + t.fat_g * 9 + t.fiber_g * 2)
}

function MacroInput({ label, field, value, color, onChange }: {
  label: string; field: keyof MacroTargets; value: number; color: string; onChange: (v: number) => void
}) {
  const kcal = Math.round(value * KCAL[field])
  return (
    <div className="bg-[#1a1a1a] rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
        <span className="text-xs text-[#737373]">{value}g · <span className="text-white">{kcal} kcal</span></span>
      </div>
      <div className="flex items-center gap-3">
        <input type="range" min={0} max={MACRO_MAX[field]} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 accent-[#22c55e] h-1.5" />
        <div className="flex items-center gap-1 bg-[#0f0f0f] rounded-lg px-2 py-1 w-20">
          <input type="number" value={value} onChange={e => onChange(Math.max(0, Number(e.target.value)))}
            className="w-full bg-transparent text-white text-sm text-right outline-none" />
          <span className="text-[10px] text-[#525252] flex-shrink-0">g</span>
        </div>
      </div>
    </div>
  )
}

interface Props {
  macroTargets: MacroTargets
  weightEntries: WeightEntry[]
  weekStartDay: 0 | 1
  nutritionLogs: DayNutritionLog[]
  nutritionPlans: NutritionPlan[]
  nutritionAssignments: WeekAssignment[]
  today: string
  onSaveMacroTargets: (t: MacroTargets) => void
  onSaveWeekStartDay: (d: 0 | 1) => void
  onAddWeightEntry: (e: WeightEntry) => void
  onDeleteWeightEntry: (id: string) => void
  onDeleteNutritionLog: (id: string) => void
  user: User | null
  syncing: boolean
  emailSent: boolean
  onSignIn: (email: string) => Promise<{ error: unknown }>
  onSignOut: () => Promise<void>
  onSyncNow: () => Promise<void>
}

export default function ProfilePage({
  macroTargets, weightEntries, weekStartDay, nutritionLogs, nutritionPlans, nutritionAssignments, today,
  onSaveMacroTargets, onSaveWeekStartDay, onAddWeightEntry, onDeleteWeightEntry, onDeleteNutritionLog,
  user, syncing, emailSent, onSignIn, onSignOut, onSyncNow,
}: Props) {
  const [tab, setTab] = useState<ProfileTab>('perfil')
  const [targets, setTargets] = useState<MacroTargets>({ ...macroTargets })
  const [dirty, setDirty] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [weightNote, setWeightNote] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [signInError, setSignInError] = useState('')

  const handleSignIn = async () => {
    if (!emailInput.trim()) return
    setSignInError('')
    const { error } = await onSignIn(emailInput.trim())
    if (error) setSignInError('Erro ao enviar o link. Verifica o email e tenta novamente.')
  }

  const update = (key: keyof MacroTargets, val: number) => {
    setTargets(prev => ({ ...prev, [key]: val }))
    setDirty(true)
  }

  const save = () => { onSaveMacroTargets(targets); setDirty(false) }

  const logWeight = () => {
    const kg = parseFloat(weightInput)
    if (!kg || kg <= 0) return
    onAddWeightEntry({ id: crypto.randomUUID(), date: today, weight_kg: kg, note: weightNote || undefined })
    setWeightInput('')
    setWeightNote('')
  }

  const recentEntries = [...weightEntries].reverse().slice(0, 30)
  const latestWeight = recentEntries[0]?.weight_kg
  const prevWeight = recentEntries[1]?.weight_kg
  const weightDelta = latestWeight && prevWeight ? +(latestWeight - prevWeight).toFixed(1) : null
  const chartEntries = [...weightEntries].slice(-14)
  const minW = chartEntries.length ? Math.min(...chartEntries.map(e => e.weight_kg)) - 1 : 0
  const maxW = chartEntries.length ? Math.max(...chartEntries.map(e => e.weight_kg)) + 1 : 100

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'evolucao', label: 'Evolução' },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-tab bar */}
      <div className="flex border-b border-[#1a1a1a] px-2 pt-12 bg-[#0f0f0f]">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
              tab === id ? 'text-[#f97316] border-[#f97316]' : 'text-[#525252] border-transparent hover:text-[#a3a3a3]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'evolucao' && (
        <NutritionEvolutionPage
          logs={nutritionLogs} plans={nutritionPlans} assignments={nutritionAssignments} today={today} weekStartDay={weekStartDay} onDeleteLog={onDeleteNutritionLog}
        />
      )}

      {tab === 'perfil' && (
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-6">
          {/* Macro targets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[#22c55e]" />
                <p className="text-sm font-semibold text-white">Objetivos de macros</p>
              </div>
              {dirty && (
                <button onClick={save} className="px-3 py-1.5 bg-[#22c55e] rounded-lg text-xs font-semibold text-black">
                  Guardar
                </button>
              )}
            </div>

            <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#737373]">Total calórico estimado pelos macros</p>
                <p className="text-2xl font-bold text-white mt-0.5">{targetKcal(targets)} <span className="text-sm font-normal text-[#737373]">kcal/dia</span></p>
              </div>
              <div className="text-right text-[10px] text-[#525252] space-y-0.5">
                <p><span className="text-[#60a5fa]">P</span> {targets.protein_g}g = {Math.round(targets.protein_g * 4)} kcal</p>
                <p><span className="text-[#f97316]">C</span> {targets.carbs_g}g = {Math.round(targets.carbs_g * 4)} kcal</p>
                <p><span className="text-[#a78bfa]">G</span> {targets.fat_g}g = {Math.round(targets.fat_g * 9)} kcal</p>
                <p><span className="text-[#14b8a6]">F</span> {targets.fiber_g}g = {Math.round(targets.fiber_g * 2)} kcal</p>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 text-xs text-[#737373]">
              <p>Cores no resumo de Nutrição → Hoje:</p>
              <div className="flex gap-4 mt-1.5">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />Dentro do alvo</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />+10%</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />+20%</span>
              </div>
            </div>

            <MacroInput label="Proteína" field="protein_g" value={targets.protein_g} color="text-[#60a5fa]" onChange={v => update('protein_g', v)} />
            <MacroInput label="Carboidratos" field="carbs_g" value={targets.carbs_g} color="text-[#f97316]" onChange={v => update('carbs_g', v)} />
            <MacroInput label="Gordura" field="fat_g" value={targets.fat_g} color="text-[#a78bfa]" onChange={v => update('fat_g', v)} />
            <MacroInput label="Fibra" field="fiber_g" value={targets.fiber_g} color="text-[#14b8a6]" onChange={v => update('fiber_g', v)} />

            {dirty && (
              <button onClick={save} className="w-full py-3 bg-[#22c55e] rounded-xl text-white font-semibold text-sm">
                Guardar objetivos
              </button>
            )}
          </div>

          {/* Week start day */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Início da semana</p>
            <div className="grid grid-cols-2 gap-2">
              {([1, 0] as const).map(d => (
                <button key={d} onClick={() => onSaveWeekStartDay(d)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${weekStartDay === d ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}>
                  {d === 1 ? 'Segunda-feira' : 'Domingo'}
                </button>
              ))}
            </div>
          </div>

          {/* Weight tracking */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-[#22c55e]" />
              <p className="text-sm font-semibold text-white">Peso corporal</p>
            </div>

            {latestWeight && (
              <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{latestWeight} <span className="text-sm font-normal text-[#737373]">kg</span></p>
                  <p className="text-xs text-[#525252] mt-0.5">Último registo</p>
                </div>
                {weightDelta !== null && (
                  <div className={`text-sm font-semibold text-right ${weightDelta < 0 ? 'text-[#22c55e]' : weightDelta > 0 ? 'text-[#f97316]' : 'text-[#737373]'}`}>
                    {weightDelta > 0 ? '+' : ''}{weightDelta} kg
                    <p className="text-[10px] text-[#525252] font-normal">vs anterior</p>
                  </div>
                )}
              </div>
            )}

            {chartEntries.length >= 2 && (
              <div className="bg-[#1a1a1a] rounded-xl p-3">
                <p className="text-[10px] text-[#525252] mb-2 uppercase tracking-wider font-semibold">Últimas {chartEntries.length} pesagens</p>
                <div className="flex items-end gap-1 h-16">
                  {chartEntries.map((e, i) => {
                    const pct = maxW === minW ? 50 : ((e.weight_kg - minW) / (maxW - minW)) * 100
                    const isLast = i === chartEntries.length - 1
                    return (
                      <div key={e.id} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className="w-full rounded-sm" style={{ height: `${Math.max(4, pct)}%`, background: isLast ? '#22c55e' : '#2e2e2e' }} />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-[#525252]">{chartEntries[0]?.date.slice(5)}</span>
                  <span className="text-[9px] text-[#525252]">{chartEntries[chartEntries.length - 1]?.date.slice(5)}</span>
                </div>
              </div>
            )}

            <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 space-y-3">
              <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Registar peso</p>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 flex-1 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 focus-within:border-[#22c55e]">
                  <input type="number" value={weightInput} onChange={e => setWeightInput(e.target.value)}
                    placeholder="70.5" step="0.1" min="0"
                    className="flex-1 bg-transparent text-white text-sm outline-none w-0" />
                  <span className="text-xs text-[#525252] flex-shrink-0">kg</span>
                </div>
                <button onClick={logWeight} disabled={!weightInput || parseFloat(weightInput) <= 0}
                  className="px-4 py-2.5 bg-[#22c55e] rounded-xl text-black text-sm font-semibold disabled:opacity-40">
                  +
                </button>
              </div>
              <input value={weightNote} onChange={e => setWeightNote(e.target.value)} placeholder="Nota (opcional)"
                className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#22c55e]" />
            </div>

            {recentEntries.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#525252] uppercase tracking-wider font-semibold">Histórico</p>
                {recentEntries.map(e => (
                  <div key={e.id} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{e.weight_kg} kg</span>
                        {e.note && <span className="text-[10px] text-[#525252] truncate">{e.note}</span>}
                      </div>
                      <p className="text-[10px] text-[#525252] mt-0.5">
                        {new Date(e.date + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <button onClick={() => onDeleteWeightEntry(e.id)} className="p-1.5 text-[#525252] hover:text-red-400 flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account / Sync */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cloud size={16} className="text-[#22c55e]" />
              <p className="text-sm font-semibold text-white">Conta e sincronização</p>
            </div>

            {user ? (
              <div className="bg-[#1a1a1a] rounded-xl px-4 py-4 space-y-3">
                <div>
                  <p className="text-xs text-[#737373]">Sessão iniciada como</p>
                  <p className="text-sm text-white font-medium mt-0.5 break-all">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onSyncNow}
                    disabled={syncing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl text-[#22c55e] text-sm font-medium disabled:opacity-40"
                  >
                    <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'A sincronizar…' : 'Sincronizar'}
                  </button>
                  <button
                    onClick={onSignOut}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-[#737373] text-sm hover:text-red-400 hover:border-red-400/30"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            ) : emailSent ? (
              <div className="bg-[#1a1a1a] rounded-xl px-4 py-4 text-center space-y-1">
                <Mail size={20} className="text-[#22c55e] mx-auto" />
                <p className="text-sm text-white font-medium">Link enviado!</p>
                <p className="text-xs text-[#737373]">Verifica o teu email e clica no link para entrar.</p>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] rounded-xl px-4 py-4 space-y-3">
                <p className="text-xs text-[#737373]">Inicia sessão para sincronizar os teus dados entre dispositivos. Sem palavra-passe — recebes um link por email.</p>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                  placeholder="email@exemplo.com"
                  className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#22c55e]"
                />
                {signInError && <p className="text-xs text-red-400">{signInError}</p>}
                <button
                  onClick={handleSignIn}
                  disabled={!emailInput.trim()}
                  className="w-full py-2.5 bg-[#22c55e] rounded-xl text-black text-sm font-semibold disabled:opacity-40"
                >
                  Enviar link de acesso
                </button>
              </div>
            )}
          </div>

          <BackupSection />
        </div>
      )}
    </div>
  )
}
