// Shared between My Profile's selective data-clearing tool and the Admin
// panel's "Message about data usage" composer, so both always agree on
// what counts as a "category."
export const DATA_CATEGORIES = [
  { key: 'calendar', label: 'Calendar events & to-dos', tables: ['calendar_events', 'daily_todos'] },
  { key: 'quicktodo', label: 'Quick To-Do list', tables: ['quick_todos'] },
  { key: 'mood', label: 'Mood logs', tables: ['mood_logs'] },
  { key: 'sleep', label: 'Sleep logs', tables: ['sleep_logs'] },
  { key: 'goals', label: 'Goals', tables: ['goals'] },
  { key: 'gratitude', label: 'Gratitude journal & achievements', tables: ['gratitude_entries', 'achievements'] },
  { key: 'diary', label: 'Secret diary entries', tables: ['diary_entries'] },
  { key: 'fitness', label: 'Fitness logs (calories & weight)', tables: ['food_logs', 'weight_logs'] },
  { key: 'selfcare', label: 'Self-care challenge progress', tables: ['selfcare_logs'] },
  { key: 'recipes', label: 'Saved recipes', tables: ['user_recipes'] },
  { key: 'grocery', label: 'Grocery list', tables: ['grocery_checks', 'grocery_custom_items'] },
  { key: 'notebooks', label: 'Notebooks (resets to 10 blank ones)', tables: ['notebook_pages', 'notebooks'] },
  { key: 'projects', label: 'Projects', tables: ['project_items', 'projects'] },
  { key: 'travel', label: 'Travel planner trips', tables: ['trip_itinerary_items', 'trip_packing_items', 'trips'] },
  { key: 'budgeting', label: 'Budgeting data', tables: ['budget_allocations', 'budget_incomes', 'budget_expenses', 'budget_savings'] },
]

export const DATA_TABLES = DATA_CATEGORIES.flatMap((c) => c.tables)
