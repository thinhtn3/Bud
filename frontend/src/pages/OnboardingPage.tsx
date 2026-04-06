import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL as string

const GOAL_OPTIONS = [
  { key: 'save_money', label: 'Save Money', icon: '🏦' },
  { key: 'track_spending', label: 'Track Spending', icon: '📊' },
  { key: 'pay_off_debt', label: 'Pay Off Debt', icon: '💳' },
  { key: 'build_emergency', label: 'Emergency Fund', icon: '🛡️' },
  { key: 'invest_more', label: 'Invest More', icon: '📈' },
  { key: 'reduce_expenses', label: 'Reduce Expenses', icon: '✂️' },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

const PERIODS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Biweekly' },
  { key: 'monthly', label: 'Monthly' },
]

const TOTAL_STEPS = 4

type OnboardingData = {
  financial_goals: string[]
  budget_period: 'weekly' | 'biweekly' | 'monthly'
  budget_amount: string
  carry_over_excess: boolean
  monthly_income: string
  currency: string
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

  @keyframes blob-drift-1 {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(40px, -30px) scale(1.08); }
    66%  { transform: translate(-20px, 20px) scale(0.95); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes blob-drift-2 {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(-50px, 30px) scale(1.05); }
    66%  { transform: translate(30px, -40px) scale(0.92); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  .ob-root {
    min-height: 100vh;
    background: #08090a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    font-feature-settings: "cv01", "ss03";
    position: relative;
    overflow: hidden;
  }

  .ob-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    will-change: transform;
  }
  .ob-blob-1 {
    width: 600px; height: 600px;
    top: -10%; left: -8%;
    background: radial-gradient(circle, rgba(159,232,112,0.09) 0%, transparent 70%);
    filter: blur(60px);
    animation: blob-drift-1 45s ease-in-out infinite;
  }
  .ob-blob-2 {
    width: 500px; height: 500px;
    bottom: -15%; right: -5%;
    background: radial-gradient(circle, rgba(94,106,210,0.08) 0%, transparent 70%);
    filter: blur(70px);
    animation: blob-drift-2 55s ease-in-out infinite;
  }

  .ob-card {
    width: 100%;
    max-width: 560px;
    background: #0f1011;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 48px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6);
    position: relative;
  }

  .ob-wordmark {
    font-size: 20px;
    font-weight: 900;
    color: #9fe870;
    letter-spacing: -0.5px;
    margin-bottom: 32px;
    display: block;
  }

  .ob-progress {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 36px;
  }
  .ob-progress-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
    transition: background 0.2s, width 0.2s;
  }
  .ob-progress-dot.active {
    background: #9fe870;
    width: 20px;
    border-radius: 3px;
  }
  .ob-progress-dot.done {
    background: rgba(159,232,112,0.35);
  }
  .ob-progress-label {
    font-size: 12px;
    color: #62666d;
    font-weight: 400;
    margin-left: 4px;
  }

  .ob-heading {
    font-size: 22px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.44px;
    line-height: 1.2;
    margin-bottom: 6px;
  }
  .ob-subheading {
    font-size: 13px;
    color: #62666d;
    letter-spacing: -0.13px;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  /* Goal grid */
  .ob-goals-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 32px;
  }
  .ob-goal-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    font-family: 'Inter', sans-serif;
    text-align: left;
  }
  .ob-goal-pill:hover {
    border-color: rgba(159,232,112,0.2);
    background: rgba(159,232,112,0.03);
  }
  .ob-goal-pill.selected {
    border-color: rgba(159,232,112,0.45);
    background: rgba(159,232,112,0.06);
  }
  .ob-goal-icon {
    font-size: 18px;
    line-height: 1;
    flex-shrink: 0;
  }
  .ob-goal-label {
    font-size: 13px;
    font-weight: 400;
    color: #c8cccc;
    letter-spacing: -0.13px;
  }
  .ob-goal-pill.selected .ob-goal-label {
    color: #e8f5e1;
  }

  /* Segmented control */
  .ob-segment-group {
    display: flex;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 4px;
    gap: 4px;
    margin-bottom: 20px;
  }
  .ob-segment-btn {
    flex: 1;
    background: none;
    border: none;
    border-radius: 7px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 400;
    font-family: 'Inter', sans-serif;
    color: #62666d;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .ob-segment-btn.active {
    background: #9fe870;
    color: #163300;
    font-weight: 600;
  }

  /* Fields */
  .ob-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 16px;
  }
  .ob-field-label {
    font-size: 11px;
    font-weight: 510;
    color: #8a8f98;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .ob-field-hint {
    font-size: 11px;
    color: #4a4f57;
    margin-top: 2px;
  }
  .ob-input-wrap {
    position: relative;
  }
  .ob-input-prefix {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: #4a4f57;
    pointer-events: none;
  }
  .ob-input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px;
    padding: 9px 13px;
    font-size: 14px;
    font-weight: 400;
    font-family: 'Inter', sans-serif;
    font-feature-settings: "cv01","ss03";
    color: #f7f8f8;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .ob-input.has-prefix { padding-left: 28px; }
  .ob-input::placeholder { color: #4a4f57; }
  .ob-input:focus {
    border-color: rgba(159,232,112,0.3);
    box-shadow: 0 0 0 3px rgba(159,232,112,0.06);
  }

  /* Toggle */
  .ob-toggle-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    margin-bottom: 20px;
    cursor: pointer;
  }
  .ob-toggle-row:hover { border-color: rgba(255,255,255,0.1); }
  .ob-toggle {
    width: 36px;
    height: 20px;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    position: relative;
    flex-shrink: 0;
    margin-top: 1px;
    transition: background 0.2s;
    cursor: pointer;
    border: none;
    padding: 0;
  }
  .ob-toggle.on { background: #9fe870; }
  .ob-toggle::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    top: 3px;
    left: 3px;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .ob-toggle.on::after { left: 19px; }
  .ob-toggle-text {}
  .ob-toggle-title {
    font-size: 14px;
    font-weight: 400;
    color: #c8cccc;
    letter-spacing: -0.14px;
    margin-bottom: 3px;
  }
  .ob-toggle-desc {
    font-size: 12px;
    color: #62666d;
    line-height: 1.5;
  }

  /* Actions */
  .ob-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
  }
  .ob-back-btn {
    background: none;
    border: none;
    color: #62666d;
    font-size: 14px;
    font-weight: 400;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 10px 0;
    transition: color 0.15s;
  }
  .ob-back-btn:hover { color: #8a8f98; }
  .ob-continue-btn {
    flex: 1;
    background: #9fe870;
    color: #163300;
    border: none;
    border-radius: 9999px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    font-feature-settings: "cv01","ss03";
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  }
  .ob-continue-btn:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 24px rgba(159,232,112,0.28);
  }
  .ob-continue-btn:active:not(:disabled) { transform: scale(0.98); }
  .ob-continue-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .ob-error {
    font-size: 12px;
    color: #d03238;
    margin-bottom: 12px;
  }

  @media (max-width: 600px) {
    .ob-card { padding: 32px 24px; }
    .ob-goals-grid { grid-template-columns: 1fr; }
  }
`

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    financial_goals: [],
    budget_period: 'monthly',
    budget_amount: '',
    carry_over_excess: false,
    monthly_income: '',
    currency: 'USD',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function toggleGoal(key: string) {
    setData(d => ({
      ...d,
      financial_goals: d.financial_goals.includes(key)
        ? d.financial_goals.filter(g => g !== key)
        : [...d.financial_goals, key],
    }))
  }

  function validateStep(): string | null {
    if (step === 1 && data.financial_goals.length === 0) return 'Select at least one goal to continue.'
    if (step === 2) {
      if (!data.budget_period) return 'Select a budget period.'
      const amt = parseFloat(data.budget_amount)
      if (!data.budget_amount || isNaN(amt) || amt <= 0) return 'Enter a valid budget amount.'
    }
    return null
  }

  function handleContinue() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError(null)
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/me/preferences`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financial_goals: data.financial_goals,
          budget_period: data.budget_period,
          budget_amount: parseFloat(data.budget_amount),
          carry_over_excess: data.carry_over_excess,
          monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
          currency: data.currency,
        }),
      })
      if (!res.ok) throw new Error('Failed to save preferences')
      await refreshUser()
      navigate('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ob-root">
        <div className="ob-blob ob-blob-1" />
        <div className="ob-blob ob-blob-2" />

        <div className="ob-card">
          <span className="ob-wordmark">Bud</span>

          {/* Progress indicator */}
          <div className="ob-progress">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`ob-progress-dot ${i + 1 === step ? 'active' : i + 1 < step ? 'done' : ''}`}
              />
            ))}
            <span className="ob-progress-label">Step {step} of {TOTAL_STEPS}</span>
          </div>

          {/* Step 1 — Goals */}
          {step === 1 && (
            <>
              <h1 className="ob-heading">What are your goals?</h1>
              <p className="ob-subheading">Select everything that applies — you can always update this later.</p>
              <div className="ob-goals-grid">
                {GOAL_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className={`ob-goal-pill ${data.financial_goals.includes(opt.key) ? 'selected' : ''}`}
                    onClick={() => toggleGoal(opt.key)}
                    type="button"
                  >
                    <span className="ob-goal-icon">{opt.icon}</span>
                    <span className="ob-goal-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2 — Budget */}
          {step === 2 && (
            <>
              <h1 className="ob-heading">Set up your budget</h1>
              <p className="ob-subheading">How often do you want to track your spending?</p>

              <div className="ob-field">
                <span className="ob-field-label">Budget period</span>
                <div className="ob-segment-group">
                  {PERIODS.map(p => (
                    <button
                      key={p.key}
                      type="button"
                      className={`ob-segment-btn ${data.budget_period === p.key ? 'active' : ''}`}
                      onClick={() => setData(d => ({ ...d, budget_period: p.key as OnboardingData['budget_period'] }))}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ob-field">
                <label className="ob-field-label">Budget amount</label>
                <div className="ob-input-wrap">
                  <span className="ob-input-prefix">$</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="e.g. 2000"
                    value={data.budget_amount}
                    onChange={e => setData(d => ({ ...d, budget_amount: e.target.value }))}
                    className="ob-input has-prefix"
                  />
                </div>
                <span className="ob-field-hint">How much you plan to spend per {data.budget_period} period</span>
              </div>
            </>
          )}

          {/* Step 3 — Settings */}
          {step === 3 && (
            <>
              <h1 className="ob-heading">Fine-tune your settings</h1>
              <p className="ob-subheading">Customize how Bud handles your budget.</p>

              <div
                className="ob-toggle-row"
                onClick={() => setData(d => ({ ...d, carry_over_excess: !d.carry_over_excess }))}
              >
                <button
                  type="button"
                  className={`ob-toggle ${data.carry_over_excess ? 'on' : ''}`}
                  onClick={e => { e.stopPropagation(); setData(d => ({ ...d, carry_over_excess: !d.carry_over_excess })) }}
                />
                <div className="ob-toggle-text">
                  <div className="ob-toggle-title">Carry over excess budget</div>
                  <div className="ob-toggle-desc">If you spend less than your budget, roll the remainder into next period.</div>
                </div>
              </div>

              <div className="ob-field">
                <label className="ob-field-label">Monthly income <span style={{ color: '#4a4f57', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <div className="ob-input-wrap">
                  <span className="ob-input-prefix">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 5000"
                    value={data.monthly_income}
                    onChange={e => setData(d => ({ ...d, monthly_income: e.target.value }))}
                    className="ob-input has-prefix"
                  />
                </div>
                <span className="ob-field-hint">Helps Bud show you meaningful spending insights</span>
              </div>
            </>
          )}

          {/* Step 4 — Currency */}
          {step === 4 && (
            <>
              <h1 className="ob-heading">Choose your currency</h1>
              <p className="ob-subheading">All amounts will be displayed in this currency.</p>

              <div className="ob-segment-group" style={{ flexWrap: 'wrap', marginBottom: 32 }}>
                {CURRENCIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`ob-segment-btn ${data.currency === c ? 'active' : ''}`}
                    onClick={() => setData(d => ({ ...d, currency: c }))}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          {error && <p className="ob-error">{error}</p>}

          <div className="ob-actions">
            {step > 1 && (
              <button
                type="button"
                className="ob-back-btn"
                onClick={() => { setError(null); setStep(s => s - 1) }}
                disabled={submitting}
              >
                Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button type="button" className="ob-continue-btn" onClick={handleContinue}>
                Continue
              </button>
            ) : (
              <button type="button" className="ob-continue-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Setting up…' : 'Finish setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
