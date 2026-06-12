export interface FoodEntry {
  id: string
  name: string
  category: string
  per100g: { calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number }
  defaultPortionG: number
  defaultPortionLabel: string
}

export const FOOD_CATEGORIES = [
  'Cereais e Derivados',
  'Proteínas',
  'Laticínios',
  'Vegetais',
  'Frutas',
  'Leguminosas',
  'Gorduras e Oleaginosas',
  'Outros',
]

export const FOODS: FoodEntry[] = [
  // Cereais e Derivados
  { id: 'aveia', name: 'Aveia', category: 'Cereais e Derivados', per100g: { calories: 379, protein_g: 13, carbs_g: 68, fat_g: 7, fiber_g: 10 }, defaultPortionG: 80, defaultPortionLabel: '80g (1 dose)' },
  { id: 'arroz-branco-cozido', name: 'Arroz branco cozido', category: 'Cereais e Derivados', per100g: { calories: 130, protein_g: 2.4, carbs_g: 28, fat_g: 0.3, fiber_g: 0.3 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 dose)' },
  { id: 'arroz-integral-cozido', name: 'Arroz integral cozido', category: 'Cereais e Derivados', per100g: { calories: 112, protein_g: 2.6, carbs_g: 24, fat_g: 0.9, fiber_g: 1.8 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 dose)' },
  { id: 'massa-cozida', name: 'Massa cozida', category: 'Cereais e Derivados', per100g: { calories: 158, protein_g: 5.8, carbs_g: 31, fat_g: 0.9, fiber_g: 1.8 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 dose)' },
  { id: 'pao-integral', name: 'Pão integral', category: 'Cereais e Derivados', per100g: { calories: 247, protein_g: 8.5, carbs_g: 47, fat_g: 3.4, fiber_g: 6.5 }, defaultPortionG: 50, defaultPortionLabel: '50g (2 fatias)' },
  { id: 'pao-branco', name: 'Pão branco', category: 'Cereais e Derivados', per100g: { calories: 266, protein_g: 8.4, carbs_g: 52, fat_g: 3.3, fiber_g: 2.7 }, defaultPortionG: 50, defaultPortionLabel: '50g (2 fatias)' },
  { id: 'batata-doce-cozida', name: 'Batata-doce cozida', category: 'Cereais e Derivados', per100g: { calories: 86, protein_g: 1.6, carbs_g: 20, fat_g: 0.1, fiber_g: 3 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 unid. média)' },
  { id: 'batata-cozida', name: 'Batata cozida', category: 'Cereais e Derivados', per100g: { calories: 87, protein_g: 1.9, carbs_g: 20, fat_g: 0.1, fiber_g: 1.8 }, defaultPortionG: 150, defaultPortionLabel: '150g' },
  { id: 'quinoa-cozida', name: 'Quinoa cozida', category: 'Cereais e Derivados', per100g: { calories: 120, protein_g: 4.4, carbs_g: 22, fat_g: 1.9, fiber_g: 2.8 }, defaultPortionG: 150, defaultPortionLabel: '150g' },

  // Proteínas
  { id: 'frango-peito-cozido', name: 'Frango (peito) cozido', category: 'Proteínas', per100g: { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 peito)' },
  { id: 'frango-coxa-cozida', name: 'Frango (coxa) cozida', category: 'Proteínas', per100g: { calories: 179, protein_g: 24, carbs_g: 0, fat_g: 8.9, fiber_g: 0 }, defaultPortionG: 120, defaultPortionLabel: '120g' },
  { id: 'peru-peito', name: 'Peru (peito) cozido', category: 'Proteínas', per100g: { calories: 135, protein_g: 29, carbs_g: 0, fat_g: 1.5, fiber_g: 0 }, defaultPortionG: 150, defaultPortionLabel: '150g' },
  { id: 'bife-vaca-magro', name: 'Bife de vaca magro', category: 'Proteínas', per100g: { calories: 187, protein_g: 27, carbs_g: 0, fat_g: 8.7, fiber_g: 0 }, defaultPortionG: 150, defaultPortionLabel: '150g' },
  { id: 'atum-agua', name: 'Atum em água', category: 'Proteínas', per100g: { calories: 116, protein_g: 25, carbs_g: 0, fat_g: 1.4, fiber_g: 0 }, defaultPortionG: 100, defaultPortionLabel: '100g (1 lata)' },
  { id: 'salmao', name: 'Salmão', category: 'Proteínas', per100g: { calories: 208, protein_g: 20, carbs_g: 0, fat_g: 13, fiber_g: 0 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 filete)' },
  { id: 'bacalhau-cozido', name: 'Bacalhau cozido', category: 'Proteínas', per100g: { calories: 140, protein_g: 32, carbs_g: 0, fat_g: 1, fiber_g: 0 }, defaultPortionG: 150, defaultPortionLabel: '150g' },
  { id: 'ovo-inteiro', name: 'Ovo inteiro', category: 'Proteínas', per100g: { calories: 143, protein_g: 12.6, carbs_g: 0.7, fat_g: 9.5, fiber_g: 0 }, defaultPortionG: 60, defaultPortionLabel: '60g (1 ovo L)' },
  { id: 'clara-ovo', name: 'Clara de ovo', category: 'Proteínas', per100g: { calories: 52, protein_g: 11, carbs_g: 0.7, fat_g: 0.2, fiber_g: 0 }, defaultPortionG: 33, defaultPortionLabel: '33g (1 clara)' },

  // Laticínios
  { id: 'leite-meio-gordo', name: 'Leite meio-gordo', category: 'Laticínios', per100g: { calories: 46, protein_g: 3.2, carbs_g: 4.7, fat_g: 1.5, fiber_g: 0 }, defaultPortionG: 200, defaultPortionLabel: '200ml (1 copo)' },
  { id: 'iogurte-natural', name: 'Iogurte natural', category: 'Laticínios', per100g: { calories: 59, protein_g: 3.5, carbs_g: 5, fat_g: 3.3, fiber_g: 0 }, defaultPortionG: 125, defaultPortionLabel: '125g (1 iogurte)' },
  { id: 'iogurte-grego', name: 'Iogurte grego natural', category: 'Laticínios', per100g: { calories: 97, protein_g: 9, carbs_g: 3.6, fat_g: 5, fiber_g: 0 }, defaultPortionG: 150, defaultPortionLabel: '150g' },
  { id: 'queijo-fresco', name: 'Queijo fresco', category: 'Laticínios', per100g: { calories: 78, protein_g: 8.5, carbs_g: 3.3, fat_g: 3, fiber_g: 0 }, defaultPortionG: 100, defaultPortionLabel: '100g (1 queijinho)' },
  { id: 'cottage', name: 'Queijo cottage', category: 'Laticínios', per100g: { calories: 98, protein_g: 11, carbs_g: 3.4, fat_g: 4.3, fiber_g: 0 }, defaultPortionG: 150, defaultPortionLabel: '150g' },
  { id: 'requeijao', name: 'Requeijão', category: 'Laticínios', per100g: { calories: 115, protein_g: 7, carbs_g: 4, fat_g: 8, fiber_g: 0 }, defaultPortionG: 100, defaultPortionLabel: '100g' },

  // Vegetais
  { id: 'brocolo', name: 'Brócolos', category: 'Vegetais', per100g: { calories: 34, protein_g: 2.8, carbs_g: 7, fat_g: 0.4, fiber_g: 2.6 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 dose)' },
  { id: 'espinafres', name: 'Espinafres', category: 'Vegetais', per100g: { calories: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.4, fiber_g: 2.2 }, defaultPortionG: 100, defaultPortionLabel: '100g' },
  { id: 'alface', name: 'Alface', category: 'Vegetais', per100g: { calories: 15, protein_g: 1.4, carbs_g: 2.9, fat_g: 0.2, fiber_g: 1.3 }, defaultPortionG: 80, defaultPortionLabel: '80g (base salada)' },
  { id: 'tomate', name: 'Tomate', category: 'Vegetais', per100g: { calories: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2, fiber_g: 1.2 }, defaultPortionG: 120, defaultPortionLabel: '120g (1 tomate médio)' },
  { id: 'cenoura', name: 'Cenoura', category: 'Vegetais', per100g: { calories: 41, protein_g: 0.9, carbs_g: 10, fat_g: 0.2, fiber_g: 2.8 }, defaultPortionG: 100, defaultPortionLabel: '100g (1 cenoura)' },
  { id: 'pepino', name: 'Pepino', category: 'Vegetais', per100g: { calories: 15, protein_g: 0.6, carbs_g: 3.6, fat_g: 0.1, fiber_g: 0.5 }, defaultPortionG: 100, defaultPortionLabel: '100g' },
  { id: 'curgete', name: 'Curgete', category: 'Vegetais', per100g: { calories: 17, protein_g: 1.2, carbs_g: 3.1, fat_g: 0.3, fiber_g: 1 }, defaultPortionG: 150, defaultPortionLabel: '150g' },
  { id: 'couve-brocolo', name: 'Couve', category: 'Vegetais', per100g: { calories: 43, protein_g: 1.9, carbs_g: 9, fat_g: 0.1, fiber_g: 3.8 }, defaultPortionG: 100, defaultPortionLabel: '100g' },
  { id: 'abobora', name: 'Abóbora', category: 'Vegetais', per100g: { calories: 26, protein_g: 1, carbs_g: 6.5, fat_g: 0.1, fiber_g: 0.5 }, defaultPortionG: 150, defaultPortionLabel: '150g' },
  { id: 'cebola', name: 'Cebola', category: 'Vegetais', per100g: { calories: 40, protein_g: 1.1, carbs_g: 9.3, fat_g: 0.1, fiber_g: 1.7 }, defaultPortionG: 60, defaultPortionLabel: '60g (meia cebola)' },

  // Frutas
  { id: 'banana', name: 'Banana', category: 'Frutas', per100g: { calories: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3, fiber_g: 2.6 }, defaultPortionG: 120, defaultPortionLabel: '120g (1 banana média)' },
  { id: 'maca', name: 'Maçã', category: 'Frutas', per100g: { calories: 52, protein_g: 0.3, carbs_g: 14, fat_g: 0.2, fiber_g: 2.4 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 maçã média)' },
  { id: 'laranja', name: 'Laranja', category: 'Frutas', per100g: { calories: 47, protein_g: 0.9, carbs_g: 12, fat_g: 0.1, fiber_g: 2.4 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 laranja média)' },
  { id: 'morango', name: 'Morango', category: 'Frutas', per100g: { calories: 33, protein_g: 0.7, carbs_g: 8, fat_g: 0.3, fiber_g: 2 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 punhado)' },
  { id: 'mirtilo', name: 'Mirtilo', category: 'Frutas', per100g: { calories: 57, protein_g: 0.7, carbs_g: 14, fat_g: 0.3, fiber_g: 2.4 }, defaultPortionG: 100, defaultPortionLabel: '100g' },
  { id: 'kiwi', name: 'Kiwi', category: 'Frutas', per100g: { calories: 61, protein_g: 1.1, carbs_g: 15, fat_g: 0.5, fiber_g: 3 }, defaultPortionG: 80, defaultPortionLabel: '80g (1 kiwi)' },
  { id: 'pera', name: 'Pêra', category: 'Frutas', per100g: { calories: 57, protein_g: 0.4, carbs_g: 15, fat_g: 0.1, fiber_g: 3.1 }, defaultPortionG: 150, defaultPortionLabel: '150g (1 pêra média)' },
  { id: 'melao', name: 'Melão', category: 'Frutas', per100g: { calories: 34, protein_g: 0.8, carbs_g: 8.2, fat_g: 0.2, fiber_g: 0.9 }, defaultPortionG: 200, defaultPortionLabel: '200g (1 fatia)' },

  // Leguminosas
  { id: 'grao-cozido', name: 'Grão de bico cozido', category: 'Leguminosas', per100g: { calories: 164, protein_g: 8.9, carbs_g: 27, fat_g: 2.6, fiber_g: 7.6 }, defaultPortionG: 120, defaultPortionLabel: '120g (1 dose)' },
  { id: 'feijao-vermelho-cozido', name: 'Feijão vermelho cozido', category: 'Leguminosas', per100g: { calories: 127, protein_g: 8.7, carbs_g: 23, fat_g: 0.5, fiber_g: 6.4 }, defaultPortionG: 120, defaultPortionLabel: '120g' },
  { id: 'lentilhas-cozidas', name: 'Lentilhas cozidas', category: 'Leguminosas', per100g: { calories: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4, fiber_g: 7.9 }, defaultPortionG: 120, defaultPortionLabel: '120g' },
  { id: 'ervilhas-cozidas', name: 'Ervilhas cozidas', category: 'Leguminosas', per100g: { calories: 81, protein_g: 5.4, carbs_g: 14, fat_g: 0.4, fiber_g: 5.5 }, defaultPortionG: 100, defaultPortionLabel: '100g' },

  // Gorduras e Oleaginosas
  { id: 'azeite', name: 'Azeite', category: 'Gorduras e Oleaginosas', per100g: { calories: 884, protein_g: 0, carbs_g: 0, fat_g: 100, fiber_g: 0 }, defaultPortionG: 10, defaultPortionLabel: '10ml (1 c. sopa)' },
  { id: 'manteiga', name: 'Manteiga', category: 'Gorduras e Oleaginosas', per100g: { calories: 717, protein_g: 0.9, carbs_g: 0.1, fat_g: 81, fiber_g: 0 }, defaultPortionG: 10, defaultPortionLabel: '10g (1 c. chá)' },
  { id: 'abacate', name: 'Abacate', category: 'Gorduras e Oleaginosas', per100g: { calories: 160, protein_g: 2, carbs_g: 9, fat_g: 15, fiber_g: 6.7 }, defaultPortionG: 100, defaultPortionLabel: '100g (meio abacate)' },
  { id: 'amendoim', name: 'Amendoim', category: 'Gorduras e Oleaginosas', per100g: { calories: 567, protein_g: 25.8, carbs_g: 16, fat_g: 49, fiber_g: 8.5 }, defaultPortionG: 30, defaultPortionLabel: '30g (1 punhado)' },
  { id: 'manteiga-amendoim', name: 'Manteiga de amendoim', category: 'Gorduras e Oleaginosas', per100g: { calories: 588, protein_g: 25, carbs_g: 20, fat_g: 50, fiber_g: 6 }, defaultPortionG: 30, defaultPortionLabel: '30g (2 c. sopa)' },
  { id: 'amendoa', name: 'Amêndoa', category: 'Gorduras e Oleaginosas', per100g: { calories: 579, protein_g: 21, carbs_g: 22, fat_g: 50, fiber_g: 12.5 }, defaultPortionG: 30, defaultPortionLabel: '30g (1 punhado)' },
  { id: 'noz', name: 'Nozes', category: 'Gorduras e Oleaginosas', per100g: { calories: 654, protein_g: 15, carbs_g: 14, fat_g: 65, fiber_g: 6.7 }, defaultPortionG: 30, defaultPortionLabel: '30g (4-5 nozes)' },

  // Outros
  { id: 'whey-protein', name: 'Proteína Whey', category: 'Outros', per100g: { calories: 380, protein_g: 75, carbs_g: 7, fat_g: 7, fiber_g: 0 }, defaultPortionG: 30, defaultPortionLabel: '30g (1 medida)' },
  { id: 'granola', name: 'Granola', category: 'Outros', per100g: { calories: 471, protein_g: 10, carbs_g: 58, fat_g: 22, fiber_g: 6 }, defaultPortionG: 50, defaultPortionLabel: '50g' },
  { id: 'mel', name: 'Mel', category: 'Outros', per100g: { calories: 304, protein_g: 0.3, carbs_g: 82, fat_g: 0, fiber_g: 0.2 }, defaultPortionG: 15, defaultPortionLabel: '15g (1 c. sopa)' },
  { id: 'chocolate-negro', name: 'Chocolate negro 70%', category: 'Outros', per100g: { calories: 598, protein_g: 5.5, carbs_g: 46, fat_g: 43, fiber_g: 11 }, defaultPortionG: 30, defaultPortionLabel: '30g (3 quadrados)' },
]

export function searchFoods(query: string): FoodEntry[] {
  if (!query.trim()) return FOODS
  const q = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return FOODS.filter(f => {
    const name = f.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const cat = f.category.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return name.includes(q) || cat.includes(q)
  })
}

export function calcMacros(food: FoodEntry, grams: number) {
  const r = grams / 100
  return {
    calories: Math.round(food.per100g.calories * r * 10) / 10,
    protein_g: Math.round(food.per100g.protein_g * r * 10) / 10,
    carbs_g: Math.round(food.per100g.carbs_g * r * 10) / 10,
    fat_g: Math.round(food.per100g.fat_g * r * 10) / 10,
    fiber_g: Math.round(food.per100g.fiber_g * r * 10) / 10,
  }
}
