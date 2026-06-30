import { describe, it, expect, vi, afterEach } from 'vitest'
import { searchOpenFoodFacts } from './openFoodFacts'

function mockFetch(body: unknown, ok = true) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('searchOpenFoodFacts', () => {
  it('returns empty array for blank query without calling fetch', async () => {
    mockFetch({ products: [] })
    const result = await searchOpenFoodFacts('   ')
    expect(result).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })

  it('maps raw products to the simplified shape, preferring the pt name', async () => {
    mockFetch({
      products: [{
        code: '123',
        product_name: 'Iogurte natural',
        product_name_pt: 'Iogurte natural magro',
        brands: 'Marca A, Marca B',
        nutriments: { 'energy-kcal_100g': 59, proteins_100g: 3.5, carbohydrates_100g: 5, fat_100g: 3.3, fiber_100g: 0 },
      }],
    })
    const result = await searchOpenFoodFacts('iogurte')
    expect(result).toEqual([{
      code: '123',
      name: 'Iogurte natural magro',
      brand: 'Marca A',
      per100g: { calories: 59, protein_g: 3.5, carbs_g: 5, fat_g: 3.3, fiber_g: 0 },
    }])
  })

  it('skips products missing a code, name, or calorie value', async () => {
    mockFetch({
      products: [
        { code: '1', product_name: 'Sem calorias', nutriments: {} },
        { code: '2', nutriments: { 'energy-kcal_100g': 100 } },
        { product_name: 'Sem código', nutriments: { 'energy-kcal_100g': 100 } },
      ],
    })
    const result = await searchOpenFoodFacts('x')
    expect(result).toEqual([])
  })

  it('deduplicates repeated product codes', async () => {
    mockFetch({
      products: [
        { code: '1', product_name: 'A', nutriments: { 'energy-kcal_100g': 100 } },
        { code: '1', product_name: 'A duplicado', nutriments: { 'energy-kcal_100g': 100 } },
      ],
    })
    const result = await searchOpenFoodFacts('x')
    expect(result).toHaveLength(1)
  })

  it('throws when the response is not ok', async () => {
    mockFetch({}, false)
    await expect(searchOpenFoodFacts('x')).rejects.toThrow('Open Food Facts: 500')
  })
})
