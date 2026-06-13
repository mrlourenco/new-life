import { useState } from 'react'
import type { ShoppingList, ShoppingItem } from '../types/shopping'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage'

function load(): ShoppingList {
  return loadJSON<ShoppingList>(STORAGE_KEYS.shoppingList) ?? { items: [] }
}

export function useShoppingStore() {
  const [list, setList] = useState<ShoppingList>(load)

  const setItems = (items: ShoppingItem[]) => {
    const updated = { ...list, items }
    setList(updated)
    saveJSON(STORAGE_KEYS.shoppingList, updated)
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
    saveJSON(STORAGE_KEYS.shoppingList, updated)
  }

  return { list, toggleItem, addManualItem, deleteItem, regenerate }
}
