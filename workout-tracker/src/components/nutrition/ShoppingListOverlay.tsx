import { useState } from 'react'
import { X, RefreshCw, Copy, Check, Trash2, Plus, ShoppingCart } from 'lucide-react'
import type { ShoppingItem, ShoppingList } from '../../types/shopping'

interface Props {
  list: ShoppingList
  canRegenerate: boolean
  onToggle: (id: string) => void
  onAdd: (name: string) => void
  onDelete: (id: string) => void
  onRegenerate: () => void
  onClose: () => void
}

export default function ShoppingListOverlay({ list, canRegenerate, onToggle, onAdd, onDelete, onRegenerate, onClose }: Props) {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const needed = list.items.filter(i => !i.inStock)
  const have = list.items.filter(i => i.inStock)

  const handleAdd = () => {
    if (!input.trim()) return
    onAdd(input.trim())
    setInput('')
  }

  const copyList = () => {
    const text = needed.map(i => `• ${i.name}${i.quantity ? ` (${i.quantity})` : ''}`).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function ItemRow({ item }: { item: ShoppingItem }) {
    return (
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${item.inStock ? 'bg-[#0f2318]' : 'bg-[#1a1a1a]'}`}>
        <button onClick={() => onToggle(item.id)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.inStock ? 'border-[#22c55e] bg-[#22c55e]' : 'border-[#3f3f3f]'}`}>
          {item.inStock && <Check size={10} className="text-black" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${item.inStock ? 'text-[#525252] line-through' : 'text-white'}`}>{item.name}</p>
          {item.quantity && <p className="text-[10px] text-[#525252]">{item.quantity}</p>}
        </div>
        {item.manual && (
          <span className="text-[9px] text-[#3f3f3f] flex-shrink-0">manual</span>
        )}
        <button onClick={() => onDelete(item.id)} className="p-1 text-[#525252] hover:text-red-400 flex-shrink-0">
          <Trash2 size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <div className="flex items-center gap-2 flex-1">
          <ShoppingCart size={16} className="text-[#22c55e]" />
          <h2 className="text-white font-semibold">Lista de compras</h2>
        </div>
        <button onClick={copyList} disabled={needed.length === 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${copied ? 'bg-green-900/40 text-green-400' : 'bg-[#2e2e2e] text-[#a3a3a3] hover:text-white'} disabled:opacity-30`}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-4">
        {/* Regenerate */}
        {canRegenerate && (
          <button onClick={onRegenerate}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#22c55e]/50">
            <RefreshCw size={14} />Regenerar do plano ativo
          </button>
        )}

        {list.items.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart size={28} className="text-[#525252] mx-auto mb-2" />
            <p className="text-[#525252] text-sm">Lista vazia.</p>
            {canRegenerate && <p className="text-[#3f3f3f] text-xs mt-1">Gera a partir do plano ativo ou adiciona itens manualmente.</p>}
          </div>
        )}

        {/* Need to buy */}
        {needed.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold">
              Preciso comprar ({needed.length})
            </p>
            {needed.map(i => <ItemRow key={i.id} item={i} />)}
          </div>
        )}

        {/* Have */}
        {have.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-[#525252] uppercase tracking-wider font-semibold">
              Tenho em casa ({have.length})
            </p>
            {have.map(i => <ItemRow key={i.id} item={i} />)}
          </div>
        )}

        {/* Add manual item */}
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Adicionar item..."
            className="flex-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#22c55e]" />
          <button onClick={handleAdd} disabled={!input.trim()}
            className="px-4 py-2.5 bg-[#22c55e] rounded-xl text-black text-sm font-semibold disabled:opacity-40">
            <Plus size={16} />
          </button>
        </div>

        {list.generatedAt && (
          <p className="text-[9px] text-[#3f3f3f] text-center">
            Gerada em {new Date(list.generatedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
