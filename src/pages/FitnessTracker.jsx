import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import { DIET_MODES, DIET_META, DIET_INFO, ACTIVITIES, FALLBACK_ACTIVITIES } from '../dietData'
import {
  calcBmi, bmiCategory, calcTDEE, idealWeight, calcAge,
  calcGoalCalories, estimateTimeToGoal, ACTIVITY_LEVELS,
} from '../fitnessMath'

export default function FitnessTracker() {
  const { profile, refreshProfile } = useAuth()

  const missingBasics = !profile?.height_cm || !profile?.weight_kg || !profile?.birthday
  if (missingBasics) {
    return (
      <PageShell title="Fitness Tracker">
        <div className="card" style={{ maxWidth: 420, margin: '40px auto 0', textAlign: 'center' }}>
          <h2 style={{ fontSize: 19, marginBottom: 10 }}>A couple details first</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>
            The Fitness Tracker needs your birthday, height, and weight to calculate anything accurately. Add those in My Profile, then come back here.
          </p>
          <Link to="/profile" className="btn-primary" style={{ textDecoration: 'none' }}>Go to My Profile</Link>
        </div>
      </PageShell>
    )
  }

  if (!profile?.fitness_setup_complete) {
    return <FitnessSetup profile={profile} onDone={refreshProfile} />
  }

  return <FitnessDashboard profile={profile} onEdit={refreshProfile} />
}

function FitnessSetup({ profile, onDone }) {
  const { user } = useAuth()
  const [sex, setSex] = useState(profile?.sex || 'female')
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || 'moderate')
  const [dietCategory, setDietCategory] = useState(profile?.diet_category || DIET_MODES[0])
  const [goalChoice, setGoalChoice] = useState(profile?.target_weight_kg ? 'change' : 'maintain')
  const [targetWeight, setTargetWeight] = useState(profile?.target_weight_kg || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('profiles')
      .update({
        sex,
        activity_level: activityLevel,
        diet_category: dietCategory,
        target_weight_kg: goalChoice === 'maintain' ? profile.weight_kg : (targetWeight ? parseFloat(targetWeight) : null),
        fitness_setup_complete: true,
      })
      .eq('id', user.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    onDone()
  }

  return (
    <PageShell title="Fitness Tracker">
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Set up your Fitness Tracker</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 18 }}>
          This helps us recommend a daily calorie target and estimate your timeline.
        </p>
        <form onSubmit={save}>
          <div className="field">
            <label htmlFor="sex">Biological sex</label>
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '-2px 0 6px' }}>Used only for the calorie formula's accuracy.</p>
            <select id="sex" value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="activityLevel">Activity level</label>
            <select id="activityLevel" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
              {ACTIVITY_LEVELS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="dietCategory">Diet mode</label>
            <select id="dietCategory" value={dietCategory} onChange={(e) => setDietCategory(e.target.value)}>
              {DIET_MODES.map((m) => <option key={m} value={m}>{DIET_META[m]?.emoji} {m}</option>)}
            </select>
            {DIET_META[dietCategory] && (
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>{DIET_META[dietCategory].tagline}</p>
            )}
          </div>

          <div className="field">
            <label>Goal</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setGoalChoice('maintain')}
                className={goalChoice === 'maintain' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, fontSize: 13 }}
              >
                Maintain weight
              </button>
              <button
                type="button"
                onClick={() => setGoalChoice('change')}
                className={goalChoice === 'change' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, fontSize: 13 }}
              >
                Reach a target weight
              </button>
            </div>
          </div>

          {goalChoice === 'change' && (
            <div className="field">
              <label htmlFor="targetWeight">Target weight (kg)</label>
              <input id="targetWeight" type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="e.g. 58" required />
            </div>
          )}

          {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Saving…' : 'Set up my tracker'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}

function FitnessDashboard({ profile, onEdit }) {
  const [showInfo, setShowInfo] = useState(false)
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <FitnessSetup profile={profile} onDone={() => { setEditing(false); onEdit() }} />
  }

  const age = calcAge(profile.birthday)
  const bmi = calcBmi(profile.height_cm, profile.weight_kg)
  const bmiCat = bmiCategory(bmi)
  const tdee = calcTDEE(profile.weight_kg, profile.height_cm, age, profile.sex, profile.activity_level)
  const ideal = idealWeight(profile.height_cm, profile.sex)
  const toChange = profile.target_weight_kg ? profile.weight_kg - profile.target_weight_kg : 0
  const goalCals = calcGoalCalories(tdee, toChange)
  const timeline = estimateTimeToGoal(profile.weight_kg, profile.target_weight_kg, profile.diet_category)
  const meta = DIET_META[profile.diet_category]
  const info = DIET_INFO[profile.diet_category]
  const activities = ACTIVITIES[profile.diet_category] || FALLBACK_ACTIVITIES

  return (
    <PageShell title="Fitness Tracker">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 22 }}>Fitness Tracker</h1>
        <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setEditing(true)}>Edit settings</button>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        Mode: <strong style={{ color: 'var(--ink)' }}>{meta?.emoji} {profile.diet_category}</strong> — {meta?.tagline}
      </p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 18 }}>
        <StatCard label="BMI" value={bmi.toFixed(1)} sub={bmiCat.label} color={bmiCat.color} />
        <StatCard label="Maintenance" value={tdee} sub="kcal/day" color="var(--teal-700)" />
        <StatCard label="Ideal weight" value={`${Math.round(ideal)}kg`} sub="estimate" color="var(--pink-700)" />
      </div>

      {/* Goal card */}
      <div className="card" style={{ marginBottom: 18, background: 'var(--teal-100)', border: 'none' }}>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>Your goal</h3>
        {profile.target_weight_kg && Math.abs(toChange) >= 0.1 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              <StatCard label="Current" value={`${profile.weight_kg}kg`} />
              <StatCard label={toChange > 0 ? 'To lose' : 'To gain'} value={`${Math.abs(toChange).toFixed(1)}kg`} color="var(--pink-700)" />
              <StatCard label="Target" value={`${profile.target_weight_kg}kg`} color="var(--teal-700)" />
            </div>
            {timeline && (
              <p style={{ fontSize: 13 }}>
                At roughly this diet mode's typical pace, that's about{' '}
                <strong>{timeline.weeks} week{timeline.weeks !== 1 ? 's' : ''}</strong> (~{timeline.months} months) to reach your target.
              </p>
            )}
          </>
        ) : (
          <p style={{ fontSize: 13 }}>You're set to maintain your current weight of <strong>{profile.weight_kg}kg</strong>.</p>
        )}
      </div>

      {/* Calorie target */}
      <div className="card" style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>Daily calorie target</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <StatCard label="Maintenance" value={tdee} sub="kcal" />
          <StatCard label={toChange > 0 ? 'Fat loss' : toChange < 0 ? 'Gain' : 'Goal'} value={goalCals} sub="kcal" color="var(--pink-700)" />
          <StatCard label="Min safe" value={Math.max(tdee - 1000, 1200)} sub="kcal" color="#f87171" />
        </div>
      </div>

      {/* Diet info */}
      {info && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowInfo(!showInfo)}>
            <h3 style={{ fontSize: 15 }}>About {profile.diet_category}</h3>
            <span style={{ fontSize: 12, color: 'var(--teal-700)', fontWeight: 700 }}>{showInfo ? 'Collapse ▲' : 'Learn more ▾'}</span>
          </div>
          {showInfo && (
            <div style={{ marginTop: 12, fontSize: 13 }}>
              <p style={{ marginBottom: 10 }}>{info.what}</p>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Purpose</p>
              <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>{info.purpose.map((p, i) => <li key={i}>{p}</li>)}</ul>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>What to expect</p>
              <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>{info.effects.map((p, i) => <li key={i}>{p}</li>)}</ul>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Watch out for</p>
              <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>{info.risks.map((p, i) => <li key={i}>{p}</li>)}</ul>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Typical macros</p>
              <p>Carbs {info.macros.carbs} · Protein {info.macros.protein} · Fat {info.macros.fat}</p>
            </div>
          )}
        </div>
      )}

      {/* Recipes link */}
      <div className="card" style={{ marginBottom: 18, textAlign: 'center' }}>
        <p style={{ fontSize: 13, marginBottom: 10 }}>Browse recipes that fit your {profile.diet_category} mode.</p>
        <Link to="/recipes" className="btn-secondary" style={{ textDecoration: 'none' }}>Go to Recipes</Link>
      </div>

      {/* Exercises */}
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Suggested exercises for {profile.diet_category}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activities.map((a, i) => (
          <ExerciseCard key={i} activity={a} />
        ))}
      </div>
    </PageShell>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '12px 8px', textAlign: 'center', boxShadow: 'none', border: '1px solid var(--teal-100)' }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: color || 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{sub || label}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{label}</div>}
    </div>
  )
}

function ExerciseCard({ activity }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{ border: '1px solid var(--teal-100)', boxShadow: 'none', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>{activity.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{activity.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{activity.time} · {activity.cal} · {activity.level}</div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--teal-700)', fontWeight: 700 }}>{open ? '▲' : '▾'}</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, fontSize: 13 }}>
          <p style={{ marginBottom: 6 }}><strong>Why it works:</strong> {activity.tip}</p>
          <p><strong>How:</strong> {activity.how}</p>
        </div>
      )}
    </div>
  )
}
