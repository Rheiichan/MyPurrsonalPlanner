import {
  IconCalendar, IconMood, IconFeeling, IconBudget, IconRecipes,
  IconFitness, IconSleep, IconSelfcare, IconGrocery, IconProjects, IconTravel, IconNotebook,
  IconGoals, IconGratitude, IconLock, IconProfile,
} from './components/icons'

export const MODULES = [
  { key: 'calendar', label: 'Calendar', Icon: IconCalendar, path: '/calendar', available: true },
  { key: 'mood', label: 'Mood Tracker', Icon: IconMood, path: '/mood', available: true },
  { key: 'feeling', label: 'How Are You Feeling?', Icon: IconFeeling, path: '/feeling', available: true },
  { key: 'goals', label: 'Goals', Icon: IconGoals, path: '/goals', available: true },
  { key: 'gratitude', label: 'Gratitude Journal', Icon: IconGratitude, path: '/gratitude', available: true },
  { key: 'secret-diary', label: 'Secret Diary', Icon: IconLock, path: '/secret-diary', available: true },
  { key: 'budget', label: 'Budgeting', Icon: IconBudget, path: '/budget', available: true },
  { key: 'recipes', label: 'Recipes', Icon: IconRecipes, path: '/recipes', available: true },
  { key: 'fitness', label: 'Fitness Tracker', Icon: IconFitness, path: '/fitness', available: true },
  { key: 'sleep', label: 'Sleep Tracker', Icon: IconSleep, path: '/sleep', available: true },
  { key: 'selfcare', label: 'Self-Care Challenge', Icon: IconSelfcare, path: '/selfcare', available: true },
  { key: 'grocery', label: 'Grocery List', Icon: IconGrocery, path: '/grocery', available: true },
  { key: 'projects', label: 'Project Planner', Icon: IconProjects, path: '/projects', available: true },
  { key: 'travel', label: 'Travel Planner', Icon: IconTravel, path: '/travel', available: true },
  { key: 'notebooks', label: 'Notebooks', Icon: IconNotebook, path: '/notebooks', available: true },
  { key: 'profile', label: 'My Profile', Icon: IconProfile, path: '/profile', available: true },
]
