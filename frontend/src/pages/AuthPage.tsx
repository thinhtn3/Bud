import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

type Mode = 'login' | 'register'

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
  @keyframes blob-drift-3 {
    0%   { transform: translate(0px, 0px) scale(1); }
    50%  { transform: translate(25px, 35px) scale(1.1); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  .auth-root {
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

  /* ── Mesh blobs ──────────────────────────────────────────────── */
  .auth-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    will-change: transform;
  }
  .auth-blob-1 {
    width: 600px;
    height: 600px;
    top: -10%;
    left: -8%;
    background: radial-gradient(circle, rgba(159,232,112,0.09) 0%, transparent 70%);
    filter: blur(60px);
    animation: blob-drift-1 45s ease-in-out infinite;
  }
  .auth-blob-2 {
    width: 500px;
    height: 500px;
    bottom: -15%;
    right: -5%;
    background: radial-gradient(circle, rgba(94,106,210,0.08) 0%, transparent 70%);
    filter: blur(70px);
    animation: blob-drift-2 55s ease-in-out infinite;
  }
  .auth-blob-3 {
    width: 380px;
    height: 380px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(159,232,112,0.05) 0%, transparent 70%);
    filter: blur(80px);
    animation: blob-drift-3 38s ease-in-out infinite;
  }

  /* ── Island ─────────────────────────────────────────────────── */
  .auth-island {
    width: 100%;
    max-width: 920px;
    height: 600px;
    background: #0f1011;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    display: flex;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  }

  /* ── Form panes ──────────────────────────────────────────────── */
  .auth-pane {
    width: 50%;
    height: 100%;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 52px 48px;
    position: relative;
  }

  .auth-wordmark {
    font-size: 22px;
    font-weight: 900;
    color: #9fe870;
    letter-spacing: -0.5px;
    margin-bottom: 32px;
    display: block;
  }

  .auth-heading {
    font-size: 24px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.48px;
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .auth-subheading {
    font-size: 13px;
    font-weight: 400;
    color: #62666d;
    letter-spacing: -0.13px;
    margin-bottom: 28px;
  }

  /* ── Form controls ───────────────────────────────────────────── */
  .auth-form { display: flex; flex-direction: column; gap: 11px; }

  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .auth-field-label {
    font-size: 11px;
    font-weight: 510;
    color: #8a8f98;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .auth-input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px;
    padding: 9px 13px;
    font-size: 14px;
    font-weight: 400;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    color: #f7f8f8;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .auth-input::placeholder { color: #4a4f57; }
  .auth-input:focus {
    border-color: rgba(159,232,112,0.3);
    box-shadow: 0 0 0 3px rgba(159,232,112,0.06);
  }
  .auth-input:disabled { opacity: 0.45; }

  .auth-input-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .auth-error {
    font-size: 12px;
    color: #d03238;
    font-weight: 400;
    letter-spacing: -0.1px;
  }

  .auth-submit {
    width: 100%;
    background: #9fe870;
    color: #163300;
    border: none;
    border-radius: 9999px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    margin-top: 6px;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  }
  .auth-submit:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 24px rgba(159,232,112,0.28);
  }
  .auth-submit:active:not(:disabled) { transform: scale(0.98); }
  .auth-submit:disabled { opacity: 0.4; cursor: not-allowed; }

  .auth-switch {
    margin-top: 18px;
    font-size: 13px;
    color: #62666d;
    font-weight: 400;
  }
  .auth-switch-btn {
    background: none;
    border: none;
    color: #7170ff;
    font-size: 13px;
    font-weight: 510;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;
    margin-left: 4px;
    transition: color 0.15s;
  }
  .auth-switch-btn:hover { color: #828fff; }

  /* ── Sliding visual panel ────────────────────────────────────── */
  .auth-panel {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    z-index: 10;
    overflow: hidden;
    transition: left 0.72s cubic-bezier(0.76, 0, 0.24, 1);
    border-radius: 0;
  }
  .auth-panel.is-login  { left: 50%; }
  .auth-panel.is-register { left: 0%; }

  /* Panel rounded edges on the outer side */
  .auth-panel.is-login  { border-radius: 0 18px 18px 0; }
  .auth-panel.is-register { border-radius: 18px 0 0 18px; }

  /* Two visuals that crossfade inside the panel */
  .auth-visual {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 40px 36px;
    transition: opacity 0.35s ease 0.2s;
  }

  /* Login visual — dark grid, professional */
  .auth-visual-login {
    background: #080f08;
  }
  .auth-visual-login::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(159,232,112,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(159,232,112,0.07) 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .auth-visual-login::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 70% at 50% 30%, rgba(159,232,112,0.16) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(22,51,0,0.5) 0%, transparent 50%);
  }

  /* Register visual — organic, warm green */
  .auth-visual-register {
    background: #060d06;
  }
  .auth-visual-register::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 100% 80% at 20% 60%, rgba(159,232,112,0.22) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 80% 20%, rgba(94,106,210,0.12) 0%, transparent 50%),
      radial-gradient(ellipse 40% 60% at 60% 90%, rgba(22,51,0,0.7) 0%, transparent 50%);
  }
  .auth-visual-register::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle 2px at 25% 35%, rgba(159,232,112,0.6) 0%, transparent 100%),
      radial-gradient(circle 1.5px at 60% 25%, rgba(159,232,112,0.4) 0%, transparent 100%),
      radial-gradient(circle 2px at 75% 65%, rgba(159,232,112,0.5) 0%, transparent 100%),
      radial-gradient(circle 1px at 40% 75%, rgba(159,232,112,0.3) 0%, transparent 100%);
  }

  /* Panel opacity states */
  .auth-panel.is-login  .auth-visual-login  { opacity: 1; }
  .auth-panel.is-login  .auth-visual-register { opacity: 0; }
  .auth-panel.is-register .auth-visual-login  { opacity: 0; }
  .auth-panel.is-register .auth-visual-register { opacity: 1; }

  /* Panel text content */
  .auth-panel-copy {
    position: relative;
    z-index: 1;
  }
  .auth-panel-tag {
    display: inline-block;
    font-size: 10px;
    font-weight: 510;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #163300;
    background: #9fe870;
    border-radius: 9999px;
    padding: 3px 10px;
    margin-bottom: 12px;
  }
  .auth-panel-headline {
    font-size: 26px;
    font-weight: 900;
    color: #f7f8f8;
    letter-spacing: -0.6px;
    line-height: 1.15;
    margin-bottom: 10px;
  }
  .auth-panel-body {
    font-size: 13px;
    font-weight: 400;
    color: rgba(247,248,248,0.45);
    letter-spacing: -0.13px;
    line-height: 1.6;
    max-width: 220px;
  }

  /* ── Success state ───────────────────────────────────────────── */
  .auth-success {
    text-align: center;
    padding: 0 8px;
  }
  .auth-success-icon {
    width: 44px;
    height: 44px;
    background: rgba(159,232,112,0.12);
    border: 1px solid rgba(159,232,112,0.25);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 20px;
  }
  .auth-success-title {
    font-size: 20px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.4px;
    margin-bottom: 8px;
  }
  .auth-success-body {
    font-size: 13px;
    color: #8a8f98;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .auth-success-email {
    color: #f7f8f8;
    font-weight: 510;
  }
  .auth-back-btn {
    background: none;
    border: none;
    color: #7170ff;
    font-size: 13px;
    font-weight: 510;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }
  .auth-back-btn:hover { color: #828fff; }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (max-width: 680px) {
    .auth-island { height: auto; flex-direction: column; max-width: 420px; }
    .auth-pane { width: 100%; padding: 40px 32px; }
    .auth-panel { display: none; }
  }
`

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [mode, setMode] = useState<Mode>(
    location.pathname === '/register' ? 'register' : 'login'
  )

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState<string | null>(null)
  const [regSuccess, setRegSuccess] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    navigate(next === 'login' ? '/login' : '/register', { replace: true })
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      await login(loginEmail, loginPassword)
      navigate('/')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setRegError(null)
    const trimmed = regName.trim()
    if (trimmed.length < 2 || trimmed.length > 30) {
      setRegError('Display name must be 2–30 characters')
      return
    }
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match')
      return
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters')
      return
    }
    setRegLoading(true)
    try {
      await register(regEmail, regPassword, trimmed)
      setRegSuccess(true)
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="auth-island">

          {/* ── Login pane (left) ──────────────────────────────── */}
          <div className="auth-pane">
            <span className="auth-wordmark">Bud</span>
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subheading">Sign in to your account</p>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label className="auth-field-label">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  disabled={loginLoading}
                  className="auth-input"
                />
              </div>
              <div className="auth-field">
                <label className="auth-field-label">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  disabled={loginLoading}
                  className="auth-input"
                />
              </div>

              {loginError && <p className="auth-error">{loginError}</p>}

              <button type="submit" disabled={loginLoading} className="auth-submit">
                {loginLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="auth-switch">
              No account?
              <button className="auth-switch-btn" onClick={() => switchMode('register')}>
                Create one
              </button>
            </p>
          </div>

          {/* ── Register pane (right) ──────────────────────────── */}
          <div className="auth-pane">
            {regSuccess ? (
              <div className="auth-success">
                <div className="auth-success-icon">✓</div>
                <h2 className="auth-success-title">Check your email</h2>
                <p className="auth-success-body">
                  We sent a confirmation link to{' '}
                  <span className="auth-success-email">{regEmail}</span>.
                  Click it to activate your account.
                </p>
                <button className="auth-back-btn" onClick={() => switchMode('login')}>
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <span className="auth-wordmark">Bud</span>
                <h1 className="auth-heading">Create account</h1>
                <p className="auth-subheading">Start tracking your finances</p>

                <form className="auth-form" onSubmit={handleRegister}>
                  <div className="auth-field">
                    <label className="auth-field-label">Display name</label>
                    <input
                      type="text"
                      autoComplete="username"
                      required
                      placeholder="Your name"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      disabled={regLoading}
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-field-label">Email</label>
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      disabled={regLoading}
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-input-row">
                    <div className="auth-field">
                      <label className="auth-field-label">Password</label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        required
                        placeholder="Min. 8 chars"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        disabled={regLoading}
                        className="auth-input"
                      />
                    </div>
                    <div className="auth-field">
                      <label className="auth-field-label">Confirm</label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        required
                        placeholder="••••••••"
                        value={regConfirm}
                        onChange={e => setRegConfirm(e.target.value)}
                        disabled={regLoading}
                        className="auth-input"
                      />
                    </div>
                  </div>

                  {regError && <p className="auth-error">{regError}</p>}

                  <button type="submit" disabled={regLoading} className="auth-submit">
                    {regLoading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>

                <p className="auth-switch">
                  Already have an account?
                  <button className="auth-switch-btn" onClick={() => switchMode('login')}>
                    Sign in
                  </button>
                </p>
              </>
            )}
          </div>

          {/* ── Sliding visual panel ───────────────────────────── */}
          <div className={`auth-panel ${mode === 'login' ? 'is-login' : 'is-register'}`}>

            {/* Login visual — grid / terminal */}
            <div className="auth-visual auth-visual-login">
              <div className="auth-panel-copy">
                <span className="auth-panel-tag">Personal Finance</span>
                <p className="auth-panel-headline">Your money,{'\n'}your rules.</p>
                <p className="auth-panel-body">
                  Track every transaction. Know exactly where your money goes.
                </p>
              </div>
            </div>

            {/* Register visual — organic / fresh */}
            <div className="auth-visual auth-visual-register">
              <div className="auth-panel-copy">
                <span className="auth-panel-tag">Get Started</span>
                <p className="auth-panel-headline">Financial clarity{'\n'}starts here.</p>
                <p className="auth-panel-body">
                  Join and take control of your spending in minutes.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  )
}
