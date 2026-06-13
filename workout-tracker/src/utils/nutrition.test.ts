import { describe, it, expect } from 'vitest'
import {
  sumFoods,
  dayTotals,
  getWeekDates,
  getMonthDates,
  getDayTemplateIds,
  generateShoppingItemsFromDayMap,
} from './nutrition'
import type { MealTemplate, DayNutritionLog, NutritionPlan, WeekAssignment } from '../types/nutrition'

describe('sumFoods', () => {
  it('sums calories and macros', () => {
    const result = sumFoods([
      { calories: 100, protein_g: 10, carbs_g: 5, fat_g: 2, fiber_g: 1 },
      { calories: 200, protein_g: 20, carbs_g: 10, fat_g: 4, fiber_g: 2 },
    ])
    expect(result).toEqual({ calories: 300, protein_g: 30, carbs_g: 15, fat_g: 6, fiber_g: 3 })
  })

  it('treats missing macros as zero', () => {
    const result = sumFoods([{ calories: 150 }])
    expect(result).toEqual({ calories: 150, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 })
  })
})

describe('dayTotals', () => {
  it('sums across all entries of the day', () => {
    const log: DayNutritionLog = {
      id: 'l1',
      date: '2026-06-12',
      entries: [
        { id: 'e1', name: 'A', category: 'almoço', foods: [{ name: 'x', quantity: '1', calories: 100, protein_g: 10 }] },
        { id: 'e2', name: 'B', category: 'jantar', foods: [{ name: 'y', quantity: '1', calories: 50, carbs_g: 5 }] },
      ],
    }
    const totals = dayTotals(log)
    expect(totals.calories).toBe(150)
    expect(totals.protein_g).toBe(10)
    expect(totals.carbs_g).toBe(5)
  })
})

describe('getWeekDates', () => {
  // 2026-06-12 is a Friday
  it('returns 7 consecutive dates starting Monday by default', () => {
    const week = getWeekDates('2026-06-12')
    expect(week).toHaveLength(7)
    expect(week[0]).toBe('2026-06-08') // Monday
    expect(week[6]).toBe('2026-06-14') // Sunday
    expect(week).toContain('2026-06-12')
  })

  it('starts on Sunday when startDay is 0', () => {
    const week = getWeekDates('2026-06-12', 0)
    expect(week[0]).toBe('2026-06-07') // Sunday
    expect(week[6]).toBe('2026-06-13') // Saturday
  })

  it('handles a date that is itself the week start', () => {
    expect(getWeekDates('2026-06-08')[0]).toBe('2026-06-08')
    expect(getWeekDates('2026-06-07', 0)[0]).toBe('2026-06-07')
  })

  it('crosses month boundaries', () => {
    const week = getWeekDates('2026-07-01') // Wednesday
    expect(week[0]).toBe('2026-06-29')
    expect(week[6]).toBe('2026-07-05')
  })
})

describe('getMonthDates', () => {
  it('returns every day of the month with correct boundaries', () => {
    const june = getMonthDates(2026, 5)
    expect(june).toHaveLength(30)
    expect(june[0]).toBe('2026-06-01')
    expect(june[29]).toBe('2026-06-30')
  })

  it('handles February in a leap year', () => {
    const feb = getMonthDates(2028, 1)
    expect(feb).toHaveLength(29)
    expect(feb[28]).toBe('2028-02-29')
  })
})

describe('getDayTemplateIds', () => {
  const plan: NutritionPlan = {
    id: 'p1',
    name: 'Plano',
    days: [{ day_of_week: 5, template_ids: ['t-friday'] }], // Friday
  }
  const assignment: WeekAssignment = {
    id: 'a1',
    week_start: '2026-06-08',
    plan_id: 'p1',
    day_overrides: [{ date: '2026-06-12', template_ids: ['t-override'] }],
  }

  it('returns the day override when one exists', () => {
    expect(getDayTemplateIds('2026-06-12', [assignment], [plan], 1)).toEqual(['t-override'])
  })

  it('falls back to the plan day when there is no override', () => {
    const noOverride = { ...assignment, day_overrides: [] }
    expect(getDayTemplateIds('2026-06-12', [noOverride], [plan], 1)).toEqual(['t-friday'])
  })

  it('returns empty when the week has no assignment', () => {
    expect(getDayTemplateIds('2026-06-12', [], [plan], 1)).toEqual([])
  })

  it('returns empty when the assignment has no plan and no override', () => {
    const planless: WeekAssignment = { id: 'a2', week_start: '2026-06-08', day_overrides: [] }
    expect(getDayTemplateIds('2026-06-12', [planless], [plan], 1)).toEqual([])
  })
})

describe('generateShoppingItemsFromDayMap', () => {
  const templates: MealTemplate[] = [
    {
      id: 't1', name: 'Almoço frango', category: 'almoço',
      foods: [
        { name: 'Frango', quantity: '150g', calories: 200 },
        { name: 'Arroz', quantity: '80g', calories: 280 },
      ],
    },
    {
      id: 't2', name: 'Jantar frango', category: 'jantar',
      foods: [{ name: 'frango', quantity: '150g', calories: 200 }],
    },
  ]

  it('aggregates repeated foods case-insensitively with a count', () => {
    const items = generateShoppingItemsFromDayMap(
      [{ date: '2026-06-12', templateIds: ['t1', 't2'] }],
      templates,
      '2026-06-12'
    )
    const chicken = items.find(i => i.name === 'Frango')
    expect(chicken).toBeDefined()
    expect(chicken!.quantity).toBe('150g × 2')
    expect(items.find(i => i.name === 'Arroz')!.quantity).toBe('80g')
  })

  it('skips dates before fromDate', () => {
    const items = generateShoppingItemsFromDayMap(
      [
        { date: '2026-06-10', templateIds: ['t1'] },
        { date: '2026-06-12', templateIds: ['t2'] },
      ],
      templates,
      '2026-06-12'
    )
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Frango')
  })

  it('ignores unknown template ids', () => {
    const items = generateShoppingItemsFromDayMap(
      [{ date: '2026-06-12', templateIds: ['missing'] }],
      templates,
      '2026-06-12'
    )
    expect(items).toHaveLength(0)
  })
})
