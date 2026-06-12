import { useState } from 'react'
import type { ShoppingList, ShoppingItem } from '../types/shopping'

const KEY = 'nl_shopping_v1'

function load(): ShoppingList {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as ShoppingList
  } catch { /* dados corrompidos — recomeça com lista vazia */ }
  return { items: [] }
}

function persist(list: ShoppingList) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function useShoppingStore() {
  const [list, setList] = useState<ShoppingList>(load)

  const setItems = (items: ShoppingItem[]) => {
    const updated = { ...list, items }
    setList(updated)
    persist(updated)
  }

  const toggleItem = (id: string) => {
    setItems(list.items.map(i => i.id === id ? { ...i, inStock: !i.inStock } : i))
  }

  const addManualItem = (name: string) => {
    if (!name.trim()) return
    setItems([...list.items, { id: crypto.randomUUID(), name: name.trim(), inStock: false, manual: true }])
  }

  const deleteItem = (id: string) => {
    setItems(list.items.filter(i => i.id !== id))
  }

  const regenerate = (newAutoItems: ShoppingItem[], planId: string) => {
    const manuals = list.items.filter(i => i.manual)
    // Keep the in-stock state of items the user already checked off
    const inStockNames = new Set(list.items.filter(i => i.inStock).map(i => i.name.toLowerCase().trim()))
    const merged = newAutoItems.map(i => inStockNames.has(i.name.toLowerCase().trim()) ? { ...i, inStock: true } : i)
    const updated: ShoppingList = {
      items: [...merged, ...manuals],
      generatedAt: new Date().toISOString(),
      planId,
    }
    setList(updated)
    persist(updated)
  }

  return { list, toggleItem, addManualItem, deleteItem, regenerate }
}
