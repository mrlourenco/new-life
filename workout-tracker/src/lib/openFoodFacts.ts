// Client for the public Open Food Facts search API — no API key required.
// Used to augment the curated local food database (src/data/foods.ts) with
// branded/packaged products, especially ones sold in Portugal.
export interface OffProduct {
  code: string
  name: string
  brand?: string
  per100g: { calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number }
}

interface RawProduct {
  code?: string
  product_name?: string
  product_name_pt?: string
  brands?: string
  nutriments?: Record<string, number>
}

const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl'

function toOffProduct(raw: RawProduct): OffProduct | null {
  const name = raw.product_name_pt || raw.product_name
  const n = raw.nutriments
  const calories = n?.['energy-kcal_100g']
  if (!raw.code || !name || calories == null) return null

  return {
    code: raw.code,
    name,
    brand: raw.brands?.split(',')[0]?.trim() || undefined,
    per100g: {
      calories,
      protein_g: n?.proteins_100g ?? 0,
      carbs_g: n?.carbohydrates_100g ?? 0,
      fat_g: n?.fat_100g ?? 0,
      fiber_g: n?.fiber_100g ?? 0,
    },
  }
}

export async function searchOpenFoodFacts(query: string, signal?: AbortSignal): Promise<OffProduct[]> {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '20',
    fields: 'code,product_name,product_name_pt,brands,nutriments',
  })

  const res = await fetch(`${SEARCH_URL}?${params}`, { signal })
  if (!res.ok) throw new Error(`Open Food Facts: ${res.status}`)
  const data = await res.json() as { products?: RawProduct[] }

  const seen = new Set<string>()
  const results: OffProduct[] = []
  for (const raw of data.products ?? []) {
    const product = toOffProduct(raw)
    if (!product || seen.has(product.code)) continue
    seen.add(product.code)
    results.push(product)
  }
  return results
}
