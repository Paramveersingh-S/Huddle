export const SPENDING_CATEGORIES = [
  'food',
  'shopping',
  'housing',
  'transportation',
  'entertainment',
  'utilities',
  'health',
  'education',
  'personal_care',
  'travel',
  'other',
] as const;

export type SpendingCategory = typeof SPENDING_CATEGORIES[number];

// Used for LLM fallback prompt
export const CATEGORY_DESCRIPTIONS = `
- food: Groceries, restaurants, fast food, coffee shops.
- shopping: Clothes, electronics, retail stores, online shopping.
- housing: Rent, mortgage, home maintenance, furniture.
- transportation: Gas, rideshare, public transit, car maintenance.
- entertainment: Movies, games, subscriptions, hobbies, events.
- utilities: Electricity, water, internet, phone bills.
- health: Doctor visits, pharmacy, fitness, insurance.
- education: Tuition, books, courses.
- personal_care: Haircuts, cosmetics, spa.
- travel: Flights, hotels, vacation expenses.
- other: Anything else that doesn't fit the above.
`;
