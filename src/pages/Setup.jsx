import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'

function calcBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null
  const h = heightCm / 100
  const bmi = weightKg / (h * h)
  let category, message, suggestedRange
  const minNormal = 18.5 * h * h
  const maxNormal = 24.9 * h * h
  suggestedRange = `${minNormal.toFixed(1)}–${maxNormal.toFixed(1)} kg`

  if (bmi < 18.5) {
    category = 'Underweight'
    message = `Gaining a little may help you reach a healthier range. A steady, gradual gain — a bit more food and some strength training — tends to work best.`
  } else if (bmi < 25) {
    category = 'Normal'
    message = `You're in a healthy range for your height. Keep up your balanced habits.`
  } else if (bmi < 30) {
    category = 'Overweight'
    message = `A gradual, sustainable calorie deficit paired with regular movement can help bring this down over time.`
  } else {
    category = 'Obese'
    message = `A structured plan — combining diet adjustments and consistent activity — can help you move toward a healthier weight. Consider looping in a doctor for a plan tailored to you.`
  }
  return { bmi: bmi.toFixed(1), category, message, suggestedRange }
}

export default function Setup() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [dietMode, setDietMode] = useState('maintain')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const bmiResult = calcBmi(parseFloat(height), parseFloat(weight))

  async function finish() {
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('profiles')
      .update({
        name: name || null,
        birthday: birthday || null,
        height_cm: height ? parseFloat(height) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        diet_mode: dietMode,
        onboarding_complete: true,
      })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    await refreshProfile()
    navigate('/hub')
  }

  return (
    <AuthShell>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ flex: 1, height: 6, borderRadius: 100, background: s <= step ? 'var(--teal-500)' : 'var(--teal-100)' }} />
        ))}
      </div>

      {step === 1 && (
        <>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>What should we call you?</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 18 }}>We'll greet you by name across your planner.</p>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
          </div>
          <div className="field">
            <label htmlFor="birthday">Birthday (optional)</label>
            <input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ width: '100%' }} disabled={!name} onClick={() => setStep(2)}>
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>Height & weight</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 18 }}>
            Totally optional — but sharing these lets your Fitness Tracker give you a helpful starting point.
          </p>
          <div className="field">
            <label htmlFor="height">Height (cm)</label>
            <input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 160" />
          </div>
          <div className="field">
            <label htmlFor="weight">Weight (kg)</label>
            <input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 55" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>
              {height && weight ? 'Continue' : 'Skip for now'}
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>You're all set{name ? `, ${name}` : ''}!</h2>
          {bmiResult ? (
            <div style={{ background: 'var(--teal-100)', borderRadius: 16, padding: 16, margin: '14px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>Your BMI</p>
              <p className="display" style={{ fontSize: 28, color: 'var(--teal-700)', margin: '2px 0' }}>
                {bmiResult.bmi} · {bmiResult.category}
              </p>
              <p style={{ fontSize: 13, margin: '8px 0 0' }}>{bmiResult.message}</p>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '6px 0 0' }}>
                Suggested healthy range for your height: {bmiResult.suggestedRange}
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: '14px 0' }}>
              No worries — you can add your height and weight later from Settings to unlock fitness insights.
            </p>
          )}
          <div className="field">
            <label htmlFor="dietMode">What's your focus right now?</label>
            <select id="dietMode" value={dietMode} onChange={(e) => setDietMode(e.target.value)}>
              <option value="lose">Lose weight</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain weight</option>
            </select>
          </div>
          {error && <p style={{ color: 'var(--pink-700)', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary" style={{ flex: 1 }} disabled={saving} onClick={finish}>
              {saving ? 'Setting up…' : 'Enter my planner'}
            </button>
          </div>
        </>
      )}
    </AuthShell>
  )
}
