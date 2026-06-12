export interface ShoppingItem {
  id: string
  name: string
  quantity?: string
  inStock: boolean
  manual: boolean
}

export interface ShoppingList {
  items: ShoppingItem[]
  generatedAt?: string
  planId?: string
}
