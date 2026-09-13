import { supabase } from './lib/supabase'

export const INCOME_TYPES = ['Salary', 'Business', 'Allowance', 'Remittance', 'Others']
export const EXPENSE_CATEGORIES = ['Bills', 'Education', 'Groceries', 'Lifestyle', 'Others']
export const SAVINGS_TYPES = [
  { key: 'personal', label: 'Personal Savings' },
  { key: 'sinking', label: 'Sinking Fund' },
  { key: 'emergency', label: 'Emergency Fund' },
]

export function currentYearMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function isSameMonth(dateStr, yearMonth) {
  return dateStr && dateStr.slice(0, 7) === yearMonth
}

// Bumps a due date forward by one calendar month, clamping to the shorter
// month's last day when needed (e.g. Jan 31 -> Feb 28).
function addOneMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  const lastDayOfNextMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  next.setDate(Math.min(day, lastDayOfNextMonth))
  return next.toLocaleDateString('en-CA')
}

// For every recurring expense whose due date has fallen behind the current
// month, generates the missing month-by-month instances up to (and
// including) the current month. Matches by name+category+amount+bank to
// avoid creating duplicates if run more than once. Safe to call every time
// the Budgeting page loads.
export async function rollForwardRecurringExpenses(userId, allExpenses) {
  const thisYm = currentYearMonth()
  const recurring = allExpenses.filter((e) => e.is_recurring)
  const newlyCreated = []

  for (const template of recurring) {
    let cursorDate = template.due_date
    let cursorYm = cursorDate.slice(0, 7)
    let guard = 0
    while (cursorYm < thisYm && guard < 36) {
      guard++
      const nextDate = addOneMonth(cursorDate)
      const nextYm = nextDate.slice(0, 7)
      const alreadyExists = allExpenses.some(
        (e) => e.name === template.name && e.category === template.category &&
          Number(e.amount) === Number(template.amount) && e.due_date.slice(0, 7) === nextYm
      ) || newlyCreated.some(
        (e) => e.name === template.name && e.due_date.slice(0, 7) === nextYm
      )
      if (!alreadyExists) {
        const { data } = await supabase
          .from('budget_expenses')
          .insert({
            user_id: userId,
            name: template.name,
            category: template.category,
            amount: template.amount,
            due_date: nextDate,
            bank: template.bank,
            is_recurring: true,
          })
          .select()
          .maybeSingle()
        if (data) newlyCreated.push(data)
      }
      cursorDate = nextDate
      cursorYm = nextYm
    }
  }
  return newlyCreated
}
