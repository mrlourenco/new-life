import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import type { DayNutritionLog, NutritionPlan } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { dayTotals, entryMacros, getActivePlan, getWeekDates, getMonthDates, dowShort } from '../../utils/nutrition'
import MacroBar from '../../components/nutrition/MacroBar'
import CalorieChart, { MacroLegend } from '../../components/nutrition/CalorieChart'

interface Props {
  logs: DayNutritionLog[]
  plans: NutritionPlan[]
  today: string
  onDeleteLog: (id: string) => void
}

type View = 'week' | 'month' | 'day'

export default function NutritionEvolutionPage({ logs, plans, today, onDeleteLog }: Props) {
  const [view, setView] = useState<View>('week')
  const [offset, setOffset] = useState(0)   // week/month offset from current
  const [detailDate, setDetailDate] = useState<string | null>(null)

  const activePlan = getActivePlan(plans)
  const target = activePlan?.daily_calories_target

  // Derive reference date from offset
  const refDate = (() => {
    const d = new Date(today + 'T12:00:00')
    if (view === 'week') d.setDate(d.getDate() - offset * 7)
    else if (view === 'month') d.setMonth(d.getMonth() - offset)
    return d.toISOString().slice(0, 10)
  })()

  const logByDate = new Map(logs.map(l => [l.date, l]))

  // Day detail
  const dayLog = detailDate ? logByDate.get(detailDate) : null
  if (detailDate) {
    const entries = [...(dayLog?.entries ?? [])].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
    const totals = dayLog ? dayTotals(dayLog) : null
    const label = new Date(detailDate + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
    return (
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setDetailDate(null)} className="p-1.5 bg-[#1a1a1a] rounded-xl text-[#a3a3a3]">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-bold text-white capitalize flex-1">{label}</h2>
          {dayLog && (
            <button onClick={() => { onDeleteLog(dayLog.id); setDetailDate(null) }} className="p-1.5 text-[#525252] hover:text-red-400">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {totals && (
          <div className="bg-[#1a1a1a] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Total</p>
              <p className="text-lg font-bold text-white">
                {Math.round(totals.calories)}
                {target && <span className="text-sm font-normal text-[#737373]"> / {target} kcal</span>}
              </p>
            </div>
            <MacroBar macros={totals} target={target} />
          </div>
        )}

        {entries.length === 0 ? (
          <p className="text-center text-[#525252] text-sm py-8">Sem refeições registadas neste dia.</p>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => {
              const m = entryMacros(entry)
              return (
                <div key={entry.id} className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{entry.name}</p>
                      <p className="text-[10px] text-[#525252]">
                        {MEAL_CATEGORIES.find(c => c.id === entry.category)?.label}
                        {entry.time && ` · ${entry.time}`}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-white flex-shrink-0 ml-2">{Math.round(m.calories)} kcal</p>
                  </div>
                  <div className="mt-2 flex gap-3">
                    <span className="text-[10px] text-[#60a5fa]">P {Math.round(m.protein_g)}g</span>
                    <span className="text-[10px] text-[#f97316]">C {Math.round(m.carbs_g)}g</span>
                    <span className="text-[10px] text-[#a78bfa]">G {Math.round(m.fat_g)}g</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Week view
  if (view === 'week') {
    const weekDates = getWeekDates(refDate)
    const weekStart = new Date(weekDates[0] + 'T12:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
    const weekEnd = new Date(weekDates[6] + 'T12:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
    const bars = weekDates.map(date => {
      const l = logByDate.get(date)
      return {
        label: dowShort(new Date(date + 'T12:00:00').getDay()),
        value: l ? Math.round(dayTotals(l).calories) : 0,
        isToday: date === today,
        onClick: () => setDetailDate(date),
      }
    })
    const totalWeek = bars.reduce((acc, b) => acc + b.value, 0)
    const avgWeek = bars.filter(b => b.value > 0).length > 0
      ? Math.round(totalWeek / bars.filter(b => b.value > 0).length)
      : 0

    return (
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        <ViewTabs view={view} onChange={v => { setView(v); setOffset(0) }} />
        <div className="flex items-center justify-between">
          <button onClick={() => setOffset(o => o + 1)} className="p-2 bg-[#1a1a1a] rounded-xl text-[#a3a3a3]"><ChevronLeft size={16} /></button>
          <p className="text-sm text-white font-medium">{weekStart} – {weekEnd}</p>
          <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0} className="p-2 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4">
          <CalorieChart bars={bars} target={target} />
          <div className="flex justify-between items-center mt-3">
            <MacroLegend />
            {avgWeek > 0 && <p className="text-[10px] text-[#737373]">Média: {avgWeek} kcal</p>}
          </div>
        </div>

        {target && (
          <p className="text-[10px] text-[#525252] text-center">
            Linha tracejada = {target} kcal/dia. Toca numa barra para ver o detalhe.
          </p>
        )}

        <div className="space-y-2">
          {weekDates.map(date => {
            const l = logByDate.get(date)
            const kcal = l ? Math.round(dayTotals(l).calories) : 0
            const d = new Date(date + 'T12:00:00')
            return (
              <button key={date} onClick={() => setDetailDate(date)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl ${date === today ? 'bg-[#1a1a1a] ring-1 ring-[#f97316]' : 'bg-[#1a1a1a]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center ${date === today ? 'bg-[#f97316]' : 'bg-[#2e2e2e]'}`}>
                    <span className={`text-[9px] font-medium ${date === today ? 'text-black' : 'text-[#737373]'}`}>{dowShort(d.getDay())}</span>
                    <span className={`text-xs font-bold leading-tight ${date === today ? 'text-black' : 'text-white'}`}>{d.getDate()}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-white font-medium">{kcal > 0 ? `${kcal} kcal` : '—'}</p>
                    {l && <p className="text-[10px] text-[#525252]">{l.entries.length} refeições</p>}
                  </div>
                </div>
                {target && kcal > 0 && (
                  <span className={`text-[10px] font-medium ${kcal >= target * 0.85 && kcal <= target * 1.15 ? 'text-[#22c55e]' : kcal > target * 1.15 ? 'text-red-400' : 'text-[#f97316]'}`}>
                    {Math.round(kcal / target * 100)}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Month view
  const refD = new Date(refDate + 'T12:00:00')
  const monthDates = getMonthDates(refD.getFullYear(), refD.getMonth())
  const monthLabel = refD.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  const firstDow = (new Date(refD.getFullYear(), refD.getMonth(), 1).getDay() + 6) % 7 // Mon=0
  const dayNames = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const monthMax = Math.max(...monthDates.map(d => {
    const l = logByDate.get(d)
    return l ? dayTotals(l).calories : 0
  }), target ?? 0, 1)

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
      <ViewTabs view={view} onChange={v => { setView(v); setOffset(0) }} />
      <div className="flex items-center justify-between">
        <button onClick={() => setOffset(o => o + 1)} className="p-2 bg-[#1a1a1a] rounded-xl text-[#a3a3a3]"><ChevronLeft size={16} /></button>
        <p className="text-sm text-white font-medium capitalize">{monthLabel}</p>
        <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0} className="p-2 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] disabled:opacity-30"><ChevronRight size={16} /></button>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((d, i) => <p key={i} className="text-[9px] text-[#525252] text-center font-medium">{d}</p>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
          {monthDates.map(date => {
            const l = logByDate.get(date)
            const kcal = l ? dayTotals(l).calories : 0
            const pct = Math.min(kcal / monthMax, 1)
            const isToday = date === today
            const atTarget = target && kcal >= target * 0.85 && kcal <= target * 1.15
            const over = target && kcal > target * 1.15
            const bg = kcal === 0 ? 'bg-[#2e2e2e]' : over ? 'bg-red-500/70' : atTarget ? 'bg-[#22c55e]/80' : 'bg-[#f97316]/60'
            const day = parseInt(date.slice(8))
            return (
              <button key={date} onClick={() => setDetailDate(date)}
                className={`aspect-square rounded-lg flex items-center justify-center relative ${bg} ${isToday ? 'ring-1 ring-white' : ''}`}
                style={{ opacity: kcal === 0 ? 0.4 : 0.4 + pct * 0.6 }}>
                <span className="text-[10px] font-bold text-white">{day}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-3">
          <MacroLegend />
        </div>
      </div>

      <p className="text-[10px] text-[#525252] text-center">Toca num dia para ver o detalhe.</p>
    </div>
  )
}

function ViewTabs({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex bg-[#1a1a1a] rounded-xl p-1">
      {(['week', 'month'] as View[]).map(v => (
        <button key={v} onClick={() => onChange(v)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${view === v ? 'bg-[#2e2e2e] text-white' : 'text-[#525252]'}`}>
          {v === 'week' ? 'Semana' : 'Mês'}
        </button>
      ))}
    </div>
  )
}
