import { Dumbbell, History, ClipboardList } from 'lucide-react'

export type Tab = 'today' | 'history' | 'plans'

interface Props {
  tab: Tab
  onChange: (t: Tab) => void
  hasActive: boolean
}

const TABS = [
  { id: 'today' as Tab, label: 'Hoje', Icon: Dumbbell },
  { id: 'history' as Tab, label: 'Histórico', Icon: History },
  { id: 'plans' as Tab, label: 'Planos', Icon: ClipboardList },
]

export default function BottomNav({ tab, onChange, hasActive }: Props) {
  return (
    <nav className="flex border-t border-[#1a1a1a] bg-[#0f0f0f] pb-safe">
      {TABS.map(({ id, label, Icon }) => {
        const active = tab === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center gap-1 py-3 relative"
          >
            {id === 'today' && hasActive && (
              <span className="absolute top-2 right-[calc(50%-12px)] w-2 h-2 bg-[#f97316] rounded-full" />
            )}
            <Icon
              size={22}
              className={active ? 'text-[#f97316]' : 'text-[#525252]'}
            />
            <span className={`text-[10px] font-medium ${active ? 'text-[#f97316]' : 'text-[#525252]'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
