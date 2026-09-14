import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import FolderTabs from '../components/FolderTabs'
import {
  INCOME_TYPES, EXPENSE_CATEGORIES, SAVINGS_TYPES,
  currentYearMonth, isSameMonth, rollForwardRecurringExpenses,
} from '../budgeting'

const TABS = [
  { key: 'incomes', label: 'Add Incomes' },
  { key: 'expenses', label: 'Add Expenses' },
  { key: 'allocate', label: 'Allocate' },
  { key: 'savings', label: 'Savings' },
  { key: 'summary', label: 'Summary' },
  { key: 'info', label: 'Info' },
]

function peso(n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Budgeting() {
  const { user } = useAuth()
  const [tab, setTab] = useState('incomes')
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [savings, setSavings] = useState([])
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    const [{ data: inc }, { data: exp }, { data: sav }, { data: allocs }] = await Promise.all([
      supabase.from('budget_incomes').select('*').eq('user_id', user.id).order('income_date', { ascending: false }),
      supabase.from('budget_expenses').select('*').eq('user_id', user.id).order('due_date', { ascending: false }),
      supabase.from('budget_savings').select('*').eq('user_id', user.id).order('saved_date', { ascending: false }),
      supabase.from('budget_allocations').select('*').eq('user_id', user.id),
    ])
    let expenseList = exp || []
    const created = await rollForwardRecurringExpenses(user.id, expenseList)
    if (created.length > 0) expenseList = [...created, ...expenseList]

    setIncomes(inc || [])
    setExpenses(expenseList)
    setSavings(sav || [])
    setAllocations(allocs || [])
    setLoading(false)
  }

  useEffect(() => { if (user) loadAll() }, [user])

  const thisYm = currentYearMonth()
  const monthIncome = incomes.filter((i) => isSameMonth(i.income_date, thisYm)).reduce((s, i) => s + Number(i.amount), 0)
  const monthExpenses = expenses.filter((e) => isSameMonth(e.due_date, thisYm)).reduce((s, e) => s + Number(e.amount), 0)
  const monthSaved = savings.filter((s) => isSameMonth(s.saved_date, thisYm)).reduce((s, sv) => s + Number(sv.amount), 0)
  const leftover = monthIncome - monthExpenses - monthSaved

  return (
    <PageShell title="Budgeting">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Budgeting</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 14 }}>
        Income-first: decide where every peso goes before you spend it.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
        <MiniStat label="Income this month" value={peso(monthIncome)} />
        <MiniStat label="Expenses this month" value={peso(monthExpenses)} color="var(--pink-700)" />
        <MiniStat label="Saved this month" value={peso(monthSaved)} color="var(--teal-700)" />
        <MiniStat label="Left over" value={peso(leftover)} color={leftover < 0 ? '#f87171' : 'var(--teal-700)'} />
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : (
        <FolderTabs tabs={TABS} active={tab} onChange={setTab} scrollable>
          {tab === 'incomes' && <IncomesTab user={user} incomes={incomes} onChange={loadAll} />}
          {tab === 'expenses' && <ExpensesTab user={user} expenses={expenses} onChange={loadAll} />}
          {tab === 'allocate' && <AllocateTab user={user} incomes={incomes} expenses={expenses} allocations={allocations} onChange={loadAll} />}
          {tab === 'savings' && <SavingsTab user={user} savings={savings} leftover={leftover} onChange={loadAll} />}
          {tab === 'summary' && <SummaryTab incomes={incomes} expenses={expenses} savings={savings} />}
          {tab === 'info' && <InfoTab />}
        </FolderTabs>
      )}
    </PageShell>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div className="card" style={{ padding: '12px 10px', textAlign: 'center', boxShadow: 'none', border: '1px solid var(--teal-100)' }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: color || 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function IncomesTab({ user, incomes, onChange }) {
  const [source, setSource] = useState('')
  const [incomeType, setIncomeType] = useState('Salary')
  const [amount, setAmount] = useState('')
  const [incomeDate, setIncomeDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function addIncome(e) {
    e.preventDefault()
    if (!source.trim() || !amount || !incomeDate) return
    setSaving(true)
    await supabase.from('budget_incomes').insert({
      user_id: user.id, source: source.trim(), income_type: incomeType,
      amount: parseFloat(amount), income_date: incomeDate,
    })
    setSaving(false)
    setSource(''); setAmount(''); setIncomeDate('')
    onChange()
  }

  async function remove(id) {
    await supabase.from('budget_incomes').delete().eq('id', id)
    onChange()
  }

  return (
    <div>
      <form onSubmit={addIncome} className="card" style={{ marginBottom: 16, background: 'var(--teal-100)', border: 'none' }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Add income</h3>
        <div className="field">
          <label htmlFor="incSource">Source</label>
          <input id="incSource" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Salary - Sept 15" required />
        </div>
        <div className="field">
          <label htmlFor="incType">Type</label>
          <select id="incType" value={incomeType} onChange={(e) => setIncomeType(e.target.value)}>
            {INCOME_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="incAmount">Amount</label>
          <input id="incAmount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
        </div>
        <div className="field">
          <label htmlFor="incDate">Date received</label>
          <input id="incDate" type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} required />
        </div>
        <button className="btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add income'}</button>
      </form>

      {incomes.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No income logged yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {incomes.map((i) => (
            <div key={i.id} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'none', border: '1px solid var(--teal-100)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{i.source}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                  {i.income_type} · {new Date(i.income_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, color: 'var(--teal-700)' }}>{peso(i.amount)}</span>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => remove(i.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ExpensesTab({ user, expenses, onChange }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Bills')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [bank, setBank] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [saving, setSaving] = useState(false)

  async function addExpense(e) {
    e.preventDefault()
    if (!name.trim() || !amount || !dueDate) return
    setSaving(true)
    await supabase.from('budget_expenses').insert({
      user_id: user.id, name: name.trim(), category, amount: parseFloat(amount),
      due_date: dueDate, bank: bank.trim() || null, is_recurring: isRecurring,
    })
    setSaving(false)
    setName(''); setAmount(''); setDueDate(''); setBank(''); setIsRecurring(false)
    onChange()
  }

  async function togglePaid(exp) {
    await supabase.from('budget_expenses').update({ is_paid: !exp.is_paid }).eq('id', exp.id)
    onChange()
  }

  async function remove(id) {
    await supabase.from('budget_expenses').delete().eq('id', id)
    onChange()
  }

  return (
    <div>
      <form onSubmit={addExpense} className="card" style={{ marginBottom: 16, background: 'var(--pink-100)', border: 'none' }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Add expense</h3>
        <div className="field">
          <label htmlFor="expName">Name</label>
          <input id="expName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electricity Bill" required />
        </div>
        <div className="field">
          <label htmlFor="expCategory">Category</label>
          <select id="expCategory" value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="expAmount">Amount</label>
          <input id="expAmount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
        </div>
        <div className="field">
          <label htmlFor="expDue">Due date</label>
          <input id="expDue" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="expBank">Bank / e-wallet (optional)</label>
          <input id="expBank" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="e.g. BPI, GCash" />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, fontWeight: 700 }}>
          <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
          Make this recurring (repeats every month)
        </label>
        <button className="btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add expense'}</button>
      </form>

      {expenses.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No expenses logged yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {expenses.map((e) => (
            <div key={e.id} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'none', border: '1px solid var(--teal-100)', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: 'pointer' }}>
                <input type="checkbox" checked={e.is_paid} onChange={() => togglePaid(e)} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, textDecoration: e.is_paid ? 'line-through' : 'none', color: e.is_paid ? 'var(--ink-soft)' : 'var(--ink)' }}>
                    {e.name} {e.is_recurring && <span className="pill" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', marginLeft: 6, fontSize: 10 }}>Recurring</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {e.category} · Due {new Date(e.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {e.bank && ` · ${e.bank}`}
                  </div>
                </div>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, color: 'var(--pink-700)' }}>{peso(e.amount)}</span>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => remove(e.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AllocateTab({ user, incomes, expenses, allocations, onChange }) {
  const [selectedIncomeId, setSelectedIncomeId] = useState(incomes[0]?.id || '')
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedIncome = incomes.find((i) => i.id === selectedIncomeId)

  // How much of THIS income has been assigned to each expense so far
  function allocatedByThisIncome(expenseId) {
    const row = allocations.find((a) => a.income_id === selectedIncomeId && a.expense_id === expenseId)
    return row ? Number(row.amount) : 0
  }
  // How much every income combined has assigned to this expense (incl. this one)
  function totalAllocatedToExpense(expenseId) {
    return allocations
      .filter((a) => a.expense_id === expenseId)
      .reduce((sum, a) => sum + Number(a.amount), 0)
  }

  function draftValue(expenseId) {
    if (drafts[expenseId] !== undefined) return drafts[expenseId]
    const existing = allocatedByThisIncome(expenseId)
    return existing > 0 ? String(existing) : ''
  }

  const totalDraftedForThisIncome = expenses.reduce((sum, e) => {
    const v = drafts[e.id] !== undefined ? drafts[e.id] : (allocatedByThisIncome(e.id) || '')
    return sum + (parseFloat(v) || 0)
  }, 0)
  const incomeAmount = selectedIncome ? Number(selectedIncome.amount) : 0
  const remaining = incomeAmount - totalDraftedForThisIncome

  async function saveAllocations() {
    if (!selectedIncome) return
    setSaving(true)
    for (const e of expenses) {
      if (drafts[e.id] === undefined) continue
      const amount = parseFloat(drafts[e.id]) || 0
      const existing = allocations.find((a) => a.income_id === selectedIncomeId && a.expense_id === e.id)
      if (amount <= 0 && existing) {
        await supabase.from('budget_allocations').delete().eq('id', existing.id)
      } else if (amount > 0) {
        await supabase.from('budget_allocations').upsert(
          { user_id: user.id, income_id: selectedIncomeId, expense_id: e.id, amount },
          { onConflict: 'income_id,expense_id' }
        )
      }
    }
    setSaving(false)
    setSaved(true)
    setDrafts({})
    onChange()
    setTimeout(() => setSaved(false), 2000)
  }

  if (incomes.length === 0) {
    return <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Add an income first, then come back here to allocate it.</p>
  }
  if (expenses.length === 0) {
    return <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Add some expenses first, then come back here to allocate income to them.</p>
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>
        Pick an income, then decide how much of it goes toward each expense — before you spend a single peso.
      </p>

      <div className="field">
        <label htmlFor="allocIncome">Income</label>
        <select id="allocIncome" value={selectedIncomeId} onChange={(e) => { setSelectedIncomeId(e.target.value); setDrafts({}) }}>
          {incomes.map((i) => (
            <option key={i.id} value={i.id}>
              {i.source} — {peso(i.amount)} ({new Date(i.income_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </option>
          ))}
        </select>
      </div>

      {selectedIncome && (
        <>
          <div
            className="card"
            style={{ marginBottom: 16, background: remaining < 0 ? '#FBE7E7' : 'var(--teal-100)', border: 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Allocated</span>
              <span><b>{peso(totalDraftedForThisIncome)}</b> / {peso(incomeAmount)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: 'white', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', borderRadius: 8,
                  width: `${Math.min(100, (totalDraftedForThisIncome / (incomeAmount || 1)) * 100)}%`,
                  background: remaining < 0 ? '#f87171' : 'var(--teal-500)',
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: remaining < 0 ? '#c0392b' : 'var(--ink-soft)', marginTop: 8, marginBottom: 0 }}>
              {remaining < 0
                ? `You've allocated ${peso(Math.abs(remaining))} more than this income.`
                : `${peso(remaining)} left to allocate.`}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {expenses.map((e) => {
              const totalForExpense = totalAllocatedToExpense(e.id)
              const stillNeeded = Number(e.amount) - totalForExpense
              return (
                <div key={e.id} className="card" style={{ padding: '12px 16px', boxShadow: 'none', border: '1px solid var(--teal-100)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                        {e.category} · Needs {peso(e.amount)} · Covered so far: {peso(totalForExpense)}
                        {stillNeeded > 0 ? ` (₱${stillNeeded.toFixed(2)} short)` : ' ✓ fully covered'}
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={draftValue(e.id)}
                      onChange={(ev) => setDrafts((d) => ({ ...d, [e.id]: ev.target.value }))}
                      placeholder="0.00"
                      style={{ width: 100, padding: '6px 10px', borderRadius: 8, border: '2px solid var(--teal-100)', fontSize: 13, flexShrink: 0 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {saved && <p style={{ color: 'var(--teal-700)', fontSize: 13, marginBottom: 10 }}>Allocations saved!</p>}
          <button className="btn-primary" onClick={saveAllocations} disabled={saving}>
            {saving ? 'Saving…' : 'Save allocations'}
          </button>
        </>
      )}
    </div>
  )
}

function SavingsTab({ user, savings, leftover, onChange }) {
  const [savingsType, setSavingsType] = useState('personal')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [bank, setBank] = useState('')
  const [savedDate, setSavedDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [warning, setWarning] = useState('')

  async function addSaving(e) {
    e.preventDefault()
    if (!amount || !bank.trim()) return
    if (Number(amount) > leftover) {
      setWarning(`Heads up — that's more than your ₱${leftover.toFixed(2)} left over this month. Saved anyway, but you may want to double check.`)
    } else {
      setWarning('')
    }
    setSaving(true)
    await supabase.from('budget_savings').insert({
      user_id: user.id, savings_type: savingsType, name: name.trim() || null,
      amount: parseFloat(amount), bank: bank.trim(), saved_date: savedDate || new Date().toLocaleDateString('en-CA'),
    })
    setSaving(false)
    setName(''); setAmount(''); setBank(''); setSavedDate('')
    onChange()
  }

  async function remove(id) {
    await supabase.from('budget_savings').delete().eq('id', id)
    onChange()
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, background: leftover < 0 ? '#FBE7E7' : 'var(--teal-100)', border: 'none', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Available to save this month</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: leftover < 0 ? '#f87171' : 'var(--teal-700)' }}>{peso(leftover)}</p>
      </div>

      <form onSubmit={addSaving} className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Add to savings</h3>
        <div className="field">
          <label htmlFor="savType">Type</label>
          <select id="savType" value={savingsType} onChange={(e) => setSavingsType(e.target.value)}>
            {SAVINGS_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="savName">Label (optional)</label>
          <input id="savName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vacation Fund" />
        </div>
        <div className="field">
          <label htmlFor="savAmount">Amount</label>
          <input id="savAmount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
        </div>
        <div className="field">
          <label htmlFor="savBank">Bank / e-wallet</label>
          <input id="savBank" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="e.g. CIMB, Maya" required />
        </div>
        <div className="field">
          <label htmlFor="savDate">Date (optional, defaults to today)</label>
          <input id="savDate" type="date" value={savedDate} onChange={(e) => setSavedDate(e.target.value)} />
        </div>
        {warning && <p style={{ color: 'var(--pink-700)', fontSize: 12.5, marginBottom: 12 }}>{warning}</p>}
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add to savings'}</button>
      </form>

      {savings.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Nothing saved yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {savings.map((s) => {
            const typeLabel = SAVINGS_TYPES.find((t) => t.key === s.savings_type)?.label
            return (
              <div key={s.id} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'none', border: '1px solid var(--teal-100)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name || typeLabel}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {typeLabel} · {s.bank} · {new Date(s.saved_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--teal-700)' }}>{peso(s.amount)}</span>
                  <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => remove(s.id)}>Remove</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryTab({ incomes, expenses, savings }) {
  const [monthFilter, setMonthFilter] = useState('all')

  // Build one chronological ledger: incomes add to the balance, expenses
  // and savings subtract from it (savings still leaves your pocket, even
  // though it's going somewhere useful).
  const ledger = [
    ...incomes.map((i) => ({ id: 'inc-' + i.id, date: i.income_date, label: i.source, type: 'Income', signedAmount: Number(i.amount) })),
    ...expenses.map((e) => ({ id: 'exp-' + e.id, date: e.due_date, label: e.name, type: 'Expense', signedAmount: -Number(e.amount) })),
    ...savings.map((s) => ({ id: 'sav-' + s.id, date: s.saved_date, label: s.name || 'Savings', type: 'Savings', signedAmount: -Number(s.amount) })),
  ].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  let running = 0
  const withBalance = ledger.map((row) => {
    running += row.signedAmount
    return { ...row, balance: running }
  })

  const months = Array.from(new Set(ledger.map((r) => r.date.slice(0, 7)))).sort().reverse()
  const shown = monthFilter === 'all' ? withBalance : withBalance.filter((r) => r.date.slice(0, 7) === monthFilter)
  const finalBalance = withBalance.length > 0 ? withBalance[withBalance.length - 1].balance : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
          Every transaction, in order, with a running balance after each one.
        </p>
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '2px solid var(--teal-100)', fontSize: 12.5 }}>
          <option value="all">All time</option>
          {months.map((m) => (
            <option key={m} value={m}>{new Date(m + '-01T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ marginBottom: 16, background: finalBalance < 0 ? '#FBE7E7' : 'var(--teal-100)', border: 'none', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Current balance</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: finalBalance < 0 ? '#f87171' : 'var(--teal-700)' }}>{peso(finalBalance)}</p>
      </div>

      {shown.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Nothing to show yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {shown.map((row) => {
            const typeColor = row.type === 'Income' ? 'var(--teal-700)' : row.type === 'Savings' ? 'var(--pink-700)' : '#c0392b'
            return (
              <div key={row.id} className="card" style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'none', border: '1px solid var(--teal-100)', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{row.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                    <span style={{ color: typeColor, fontWeight: 700 }}>{row.type}</span>
                    {' · '}
                    {new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: row.signedAmount < 0 ? '#c0392b' : 'var(--teal-700)' }}>
                    {row.signedAmount < 0 ? '-' : '+'}{peso(Math.abs(row.signedAmount))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Balance: {peso(row.balance)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InfoCard({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <h3 style={{ fontSize: 15 }}>{title}</h3>
        <span style={{ fontSize: 12, color: 'var(--teal-700)', fontWeight: 700 }}>{open ? 'Collapse ▲' : 'Read ▾'}</span>
      </div>
      {open && <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.6 }}>{children}</div>}
    </div>
  )
}

function InfoTab() {
  return (
    <div>
      <InfoCard title="How income-first budgeting works">
        <p>
          Instead of spending first and seeing what's left, you flip the order: every time money comes in,
          decide right away exactly where each peso is going — bills, savings, funds, and a little for yourself.
          By the time you're done allocating an income, you already know what's covered and what's still open,
          instead of guessing mid-month or feeling guilty at the end of it.
        </p>
      </InfoCard>

      <InfoCard title="Sinking Funds vs. Emergency Funds">
        <p style={{ marginBottom: 10 }}>
          <strong>Sinking Fund:</strong> money set aside gradually for something you know is coming — tuition,
          a trip, car registration, holiday gifts. It's planned and predictable; you're just spreading the cost
          out ahead of time instead of feeling it all at once.
        </p>
        <p>
          <strong>Emergency Fund:</strong> money set aside for the things you can't predict — a sudden repair,
          a medical expense, an unexpected gap in income. The goal is usually 3-6 months of essential expenses,
          kept separate so it's there when you actually need it.
        </p>
      </InfoCard>

      <InfoCard title="Debt Snowball Method">
        <p>
          List your debts smallest balance to largest, ignoring interest rates. Put any extra money toward the
          smallest one while paying minimums on the rest. Once it's gone, roll that whole payment into the next
          smallest — and so on. The math isn't always the cheapest path, but knocking out a full debt early
          builds momentum and keeps you motivated to keep going.
        </p>
      </InfoCard>

      <InfoCard title="Debt Avalanche Method">
        <p>
          List your debts by interest rate, highest to lowest. Put extra money toward the highest-interest debt
          first while paying minimums on everything else, then move to the next highest once it's paid off.
          This usually saves the most money overall since you're cutting off the most expensive interest first —
          it just takes more patience before you see a debt fully disappear.
        </p>
      </InfoCard>

      <InfoCard title="Giving yourself a reward">
        <p>
          After bills, savings, and funds are covered, whatever's left doesn't have to just sit there or
          disappear into random spending — give it a name. Setting aside even a small "reward" amount for
          something just for you (a treat, a hobby, a night out) makes the whole system feel sustainable
          instead of restrictive, so you're less likely to abandon it a few months in.
        </p>
      </InfoCard>
    </div>
  )
}
