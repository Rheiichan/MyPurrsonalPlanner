export function calcBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null
  const h = heightCm / 100
  return weightKg / (h * h)
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa' }
  if (bmi < 25) return { label: 'Normal', color: '#34d399' }
  if (bmi < 30) return { label: 'Overweight', color: '#fbbf24' }
  return { label: 'Obese', color: '#f87171' }
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very: 1.9,
}

export const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { key: 'light', label: 'Light (1-3 days/week)' },
  { key: 'moderate', label: 'Moderate (3-5 days/week)' },
  { key: 'active', label: 'Active (6-7 days/week)' },
  { key: 'very', label: 'Very active (hard exercise + physical job)' },
]

// Mifflin-St Jeor equation
export function calcTDEE(weightKg, heightCm, age, sex, activityLevel) {
  const bmr = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.375))
}

// Devine formula approximation for ideal body weight
export function idealWeight(heightCm, sex) {
  const inchesOver5ft = heightCm / 2.54 - 60
  return sex === 'male' ? 50 + 2.3 * inchesOver5ft : 45.5 + 2.3 * inchesOver5ft
}

export function calcAge(birthday) {
  if (!birthday) return null
  const b = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - b.getFullYear()
  const m = today.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--
  return age
}

// Weekly weight-change rate (kg/week) achievable on each diet mode, for
// estimating time-to-goal. Modes not listed default to a conservative 0.5.
const DIET_RATE = {
  Keto: 0.75,
  'Low Carb': 0.5,
  Carnivore: 0.8,
  'Clean Eating': 0.375,
  'Calorie Deficit': 0.6,
}
export function getWeeklyRate(dietMode) {
  return DIET_RATE[dietMode] || 0.5
}
// Healthy, conservative weekly rate for weight *gain* goals.
const GAIN_RATE_KG_PER_WEEK = 0.25

export function calcGoalCalories(tdee, toLoseKg) {
  if (toLoseKg > 0) return tdee - 500 // deficit
  if (toLoseKg < 0) return tdee + 300 // surplus
  return tdee // maintain
}

// Returns { weeks, months } or null if already at goal / no target set.
export function estimateTimeToGoal(currentWeight, targetWeight, dietMode) {
  if (!targetWeight) return null
  const diff = currentWeight - targetWeight
  if (Math.abs(diff) < 0.1) return null
  const rate = diff > 0 ? getWeeklyRate(dietMode) : GAIN_RATE_KG_PER_WEEK
  const weeks = Math.ceil(Math.abs(diff) / rate)
  const months = Math.round((weeks / 4.33) * 10) / 10
  return { weeks, months, direction: diff > 0 ? 'lose' : 'gain', amountKg: Math.abs(diff) }
}
