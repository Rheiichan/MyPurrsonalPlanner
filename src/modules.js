import {
  IconCalendar, IconMood, IconFeeling, IconBudget, IconRecipes,
  IconFitness, IconSleep, IconSelfcare, IconGrocery, IconProjects, IconTravel, IconNotebook,
} from './components/icons'

export const MODULES = [
  { key: 'calendar', label: 'Calendar', Icon: IconCalendar, path: '/calendar', available: true },
  { key: 'mood', label: 'Mood Tracker', Icon: IconMood, path: '/mood', available: true },
  { key: 'feeling', label: 'How Are You Feeling?', Icon: IconFeeling, path: '/feeling', available: false },
  { key: 'budget', label: 'Budgeting', Icon: IconBudget, path: '/budget', available: false },
  { key: 'recipes', label: 'Recipes', Icon: IconRecipes, path: '/recipes', available: false },
  { key: 'fitness', label: 'Fitness Tracker', Icon: IconFitness, path: '/fitness', available: false },
  { key: 'sleep', label: 'Sleep Tracker', Icon: IconSleep, path: '/sleep', available: false },
  { key: 'selfcare', label: 'Self-Care Challenge', Icon: IconSelfcare, path: '/selfcare', available: false },
  { key: 'grocery', label: 'Grocery List', Icon: IconGrocery, path: '/grocery', available: false },
  { key: 'projects', label: 'Project Planner', Icon: IconProjects, path: '/projects', available: false },
  { key: 'travel', label: 'Travel Planner', Icon: IconTravel, path: '/travel', available: false },
  { key: 'notebooks', label: 'Notebooks', Icon: IconNotebook, path: '/notebooks', available: false },
]
