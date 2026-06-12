import type { DayMacros } from '../../types/nutrition'

interface Props {
  macros: DayMacros
  target?: number
  compact?: boolean
}

export default function MacroBar({ macros, target, compact = false }: Props) {
  const total = macros.protein_g + macros.carbs_g + macros.fat_g
  const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0

  const pP = pct(macros.protein_g)
  const pC = pct(macros.carbs_g)
  const pF = pct(macros.fat_g)

  return (
    <div>
      {!compact && (
        <div className="flex justify-between items-end mb-1.5">
          <div className="flex gap-3 text-xs">
            <span className="text-[#60a5fa]">P: {Math.round(macros.protein_g)}g</span>
            <span className="text-[#f97316]">C: {Math.round(macros.carbs_g)}g</span>
            <span className="text-[#a78bfa]">G: {Math.round(macros.fat_g)}g</span>
            {macros.fiber_g > 0 && <span className="text-[#14b8a6]">F: {Math.round(macros.fiber_g)}g</span>}
          </div>
          <div className="text-right">
            <span className="text-white font-bold">{Math.round(macros.calories)}</span>
            {target && <span className="text-[#737373] text-xs"> / {target} kcal</span>}
          </div>
        </div>
      )}

      {/* Stacked macro bar */}
      <div className="h-2 bg-[#2e2e2e] rounded-full overflow-hidden flex">
        {pP > 0 && <div className="bg-[#60a5fa] transition-all" style={{ width: `${pP}%` }} />}
        {pC > 0 && <div className="bg-[#f97316] transition-all" style={{ width: `${pC}%` }} />}
        {pF > 0 && <div className="bg-[#a78bfa] transition-all" style={{ width: `${pF}%` }} />}
      </div>

      {!compact && target && (
        <div className="mt-1">
          <div className="h-1 bg-[#2e2e2e] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${macros.calories > target ? 'bg-red-500' : 'bg-[#4ade80]'}`}
              style={{ width: `${Math.min((macros.calories / target) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#525252] mt-0.5 text-right">
            {Math.round(macros.calories / target * 100)}% do objetivo
          </p>
        </div>
      )}
    </div>
  )
}
