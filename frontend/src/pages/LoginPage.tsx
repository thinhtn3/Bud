import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

  .bud-login-root {
    min-height: 100vh;
    background: #08090a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    font-feature-settings: "cv01", "ss03";
  }

  .bud-login-card {
    width: 100%;
    max-width: 400px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 40px 36px;
  }

  .bud-login-brand {
    text-align: center;
    margin-bottom: 32px;
  }
  .bud-login-logo {
    font-size: 48px;
    font-weight: 900;
    color: #9fe870;
    letter-spacing: -1.056px;
    line-height: 1;
    display: block;
  }
  .bud-login-tagline {
    font-size: 13px;
    font-weight: 400;
    color: #62666d;
    letter-spacing: -0.13px;
    margin-top: 6px;
    display: block;
  }

  .bud-login-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bud-login-label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    font-weight: 510;
    color: #8a8f98;
    letter-spacing: -0.13px;
  }

  .bud-login-input {
    width: 100%;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 400;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    color: #f7f8f8;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .bud-login-input::placeholder { color: #8a8f98; }
  .bud-login-input:focus {
    border-color: rgba(255,255,255,0.16);
    box-shadow: rgba(0,0,0,0.1) 0px 4px 12px;
  }

  .bud-login-error {
    font-size: 12px;
    color: #d03238;
    font-weight: 400;
    letter-spacing: -0.13px;
    padding: 2px 0;
  }

  .bud-login-submit {
    width: 100%;
    background: #9fe870;
    color: #163300;
    border: none;
    border-radius: 9999px;
    padding: 11px 24px;
    font-size: 14px;
    font-weight: 600;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    margin-top: 4px;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  }
  .bud-login-submit:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 20px rgba(159,232,112,0.25);
  }
  .bud-login-submit:active:not(:disabled) { transform: scale(0.98); }
  .bud-login-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  .bud-login-footer {
    margin-top: 20px;
    text-align: center;
    font-size: 13px;
    color: #62666d;
    font-weight: 400;
    letter-spacing: -0.13px;
  }
  .bud-login-footer a {
    color: #7170ff;
    text-decoration: none;
    font-weight: 510;
    transition: color 0.15s;
  }
  .bud-login-footer a:hover { color: #828fff; }

  .bud-login-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 24px 0;
  }
`

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="bud-login-root">
        <div className="bud-login-card">
          <div className="bud-login-brand">
            <span className="bud-login-logo">Bud</span>
            <span className="bud-login-tagline">Your finances, simplified</span>
          </div>

          <div className="bud-login-divider" />

          <form className="bud-login-form" onSubmit={handleSubmit}>
            <label className="bud-login-label">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className="bud-login-input"
              />
            </label>

            <label className="bud-login-label">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                className="bud-login-input"
              />
            </label>

            {error && <p className="bud-login-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bud-login-submit"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="bud-login-footer">
            No account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  )
}
