import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --canvas: #08090a; --panel: #0f1011; --surface: #191a1b; --elevated: #28282c;
  --t1: #f7f8f8; --t2: #d0d6e0; --tm: #8a8f98; --ts: #62666d;
  --green: #9fe870; --green-bg: #163300;
  --red: #d03238;
  --accent: #5e6ad2; --accent-hi: #7170ff;
  --b0: rgba(255,255,255,0); --b1: rgba(255,255,255,.05); --b2: rgba(255,255,255,.08);
}

.lp { background: var(--canvas); color: var(--t1); min-height: 100vh; overflow-x: hidden;
  font-family: 'Inter',-apple-system,sans-serif; font-feature-settings:"cv01","ss03"; }

/* ── Blobs ───────────────────────────────────────────────────────────────── */
@keyframes b1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,-40px) scale(1.07)}66%{transform:translate(-30px,25px) scale(.95)}}
@keyframes b2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-50px,40px) scale(1.05)}66%{transform:translate(35px,-50px) scale(.93)}}
@keyframes b3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,30px) scale(1.08)}}
.blob{position:fixed;border-radius:50%;pointer-events:none;will-change:transform;z-index:0;}
.blob-1{width:800px;height:800px;top:-18%;right:-8%;background:radial-gradient(circle,rgba(159,232,112,.058) 0%,transparent 65%);filter:blur(90px);animation:b1 20s ease-in-out infinite;}
.blob-2{width:700px;height:700px;bottom:0;left:-14%;background:radial-gradient(circle,rgba(94,106,210,.075) 0%,transparent 65%);filter:blur(90px);animation:b2 25s ease-in-out infinite;}
.blob-3{width:500px;height:500px;top:42%;left:28%;background:radial-gradient(circle,rgba(159,232,112,.028) 0%,transparent 65%);filter:blur(70px);animation:b3 17s ease-in-out infinite;}

/* ── Reveal animations ───────────────────────────────────────────────────── */
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.rv{opacity:0;}.rv.in{animation:fadeUp .7s cubic-bezier(.16,1,.3,1) forwards;}
.rv.d1{animation-delay:.08s}.rv.d2{animation-delay:.16s}.rv.d3{animation-delay:.24s}.rv.d4{animation-delay:.34s}.rv.d5{animation-delay:.44s}

/* ── Nav ─────────────────────────────────────────────────────────────────── */
.lp-nav{position:sticky;top:0;z-index:100;height:60px;padding:0 40px;
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(8,9,10,.88);backdrop-filter:blur(24px) saturate(180%);
  border-bottom:1px solid var(--b1);}
.nav-logo{display:flex;align-items:center;gap:9px;font-size:17px;font-weight:700;
  letter-spacing:-.4px;color:var(--t1);text-decoration:none;}
.nav-links{display:flex;align-items:center;gap:28px;list-style:none;}
.nav-links a{font-size:14px;font-weight:510;color:var(--tm);text-decoration:none;transition:color .15s;}
.nav-links a:hover{color:var(--t1);}
.nav-right{display:flex;align-items:center;gap:10px;}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.btn-ghost{font-size:14px;font-weight:510;color:var(--t2);background:rgba(255,255,255,.02);
  border:1px solid var(--b2);padding:7px 16px;border-radius:6px;cursor:pointer;
  transition:all .15s;text-decoration:none;display:inline-flex;align-items:center;
  font-feature-settings:"cv01","ss03";}
.btn-ghost:hover{background:rgba(255,255,255,.05);color:var(--t1);}

.btn-green{font-size:14px;font-weight:600;color:var(--green-bg);background:var(--green);
  border:none;padding:7px 18px;border-radius:9999px;cursor:pointer;
  transition:transform .15s,box-shadow .15s;text-decoration:none;
  display:inline-flex;align-items:center;gap:6px;
  font-feature-settings:"cv01","ss03";}
.btn-green:hover{transform:scale(1.04);box-shadow:0 0 28px rgba(159,232,112,.22);}
.btn-green:active{transform:scale(.96);}

.btn-green-lg{font-size:16px;font-weight:600;color:var(--green-bg);background:var(--green);
  border:none;padding:14px 30px;border-radius:9999px;cursor:pointer;
  transition:transform .15s,box-shadow .15s;text-decoration:none;
  display:inline-flex;align-items:center;gap:8px;
  box-shadow:0 0 52px rgba(159,232,112,.2);
  font-feature-settings:"cv01","ss03";}
.btn-green-lg:hover{transform:scale(1.04);box-shadow:0 0 72px rgba(159,232,112,.32);}
.btn-green-lg:active{transform:scale(.96);}

.btn-outline-lg{font-size:16px;font-weight:510;color:var(--t2);
  background:rgba(255,255,255,.02);border:1px solid var(--b2);
  padding:14px 26px;border-radius:9999px;cursor:pointer;
  transition:all .15s;text-decoration:none;display:inline-flex;align-items:center;gap:8px;
  font-feature-settings:"cv01","ss03";}
.btn-outline-lg:hover{background:rgba(255,255,255,.05);color:var(--t1);}

/* ── Hero ────────────────────────────────────────────────────────────────── */
.lp-hero{position:relative;z-index:1;text-align:center;padding:112px 24px 72px;
  max-width:920px;margin:0 auto;}

.hero-badge{display:inline-flex;align-items:center;gap:7px;
  background:rgba(159,232,112,.07);border:1px solid rgba(159,232,112,.2);
  color:var(--green);font-size:12px;font-weight:510;
  padding:5px 14px;border-radius:9999px;margin-bottom:34px;letter-spacing:.03em;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.8)}}
.hero-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2.4s ease-in-out infinite;}

.hero-h1{font-size:clamp(52px,8.5vw,92px);font-weight:900;line-height:.96;
  letter-spacing:-3.2px;color:var(--t1);margin-bottom:26px;}
.hero-h1 em{font-style:normal;color:var(--green);}

.hero-sub{font-size:18px;font-weight:400;line-height:1.65;color:var(--tm);
  max-width:480px;margin:0 auto 48px;}

.hero-actions{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:76px;}

/* ── App Preview ─────────────────────────────────────────────────────────── */
.preview-outer{position:relative;max-width:840px;margin:0 auto;}
.preview-glow{position:absolute;bottom:-50px;left:50%;transform:translateX(-50%);
  width:65%;height:100px;
  background:radial-gradient(ellipse,rgba(159,232,112,.1) 0%,transparent 70%);
  filter:blur(20px);pointer-events:none;}
.preview-frame{position:relative;background:var(--surface);border-radius:16px;
  border:1px solid var(--b2);overflow:hidden;
  box-shadow:0 40px 100px rgba(0,0,0,.65),0 0 0 1px rgba(159,232,112,.035);}
.preview-frame::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent 5%,rgba(159,232,112,.3) 40%,rgba(94,106,210,.2) 65%,transparent 95%);}

.preview-bar{display:flex;align-items:center;gap:8px;padding:14px 20px;
  background:var(--panel);border-bottom:1px solid var(--b1);}
.pd{width:10px;height:10px;border-radius:50%;}
.pd-r{background:#d03238;opacity:.65;}.pd-y{background:#ffd11a;opacity:.65;}.pd-g{background:#9fe870;opacity:.65;}
.preview-bar-title{font-size:12px;font-weight:510;color:var(--ts);margin-left:8px;letter-spacing:-.1px;}

.preview-body{display:grid;grid-template-columns:210px 1fr;}

.preview-side{background:var(--panel);border-right:1px solid var(--b1);padding:18px 14px;
  display:flex;flex-direction:column;gap:3px;}
.pnav{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:6px;
  font-size:12px;font-weight:510;color:var(--tm);cursor:default;}
.pnav.on{background:rgba(255,255,255,.04);color:var(--t1);}
.pnav-ic{width:15px;height:15px;border-radius:3px;display:flex;align-items:center;justify-content:center;opacity:.7;}

.preview-main{padding:18px;display:flex;flex-direction:column;gap:12px;}

.pw-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.pw{background:rgba(255,255,255,.025);border:1px solid var(--b1);border-radius:10px;padding:14px 16px;}
.pw-label{font-size:10px;font-weight:510;color:var(--ts);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;}
.pw-val{font-size:21px;font-weight:900;letter-spacing:-.8px;line-height:1;font-feature-settings:"cv01","ss03";}
.pw-val.g{color:var(--green);}.pw-val.r{color:var(--red);}.pw-val.w{color:var(--t1);}
.pw-sub{font-size:10px;color:var(--ts);margin-top:4px;}

.ptxns{display:flex;flex-direction:column;gap:1px;}
.ptxn{display:flex;align-items:center;gap:9px;padding:6px 4px;border-radius:5px;}
.ptxn-ic{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;}
.ptxn-name{font-size:11.5px;font-weight:510;color:var(--t1);flex:1;white-space:nowrap;}
.ptxn-meta{font-size:10px;color:var(--ts);}
.ptxn-amt{font-size:11.5px;font-weight:700;white-space:nowrap;}

.pw-bar-wrap{display:flex;flex-direction:column;gap:6px;}
.pw-bar-row{display:flex;align-items:center;gap:8px;}
.pw-bar-label{font-size:10px;color:var(--ts);width:60px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pw-bar-track{flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:9999px;overflow:hidden;}
.pw-bar-fill{height:100%;border-radius:9999px;transition:width .8s cubic-bezier(.16,1,.3,1);}
.pw-bar-val{font-size:10px;font-weight:510;color:var(--ts);width:36px;text-align:right;}

/* ── Stats ───────────────────────────────────────────────────────────────── */
.lp-stats{position:relative;z-index:1;margin-top:96px;
  border-top:1px solid var(--b1);border-bottom:1px solid var(--b1);
  padding:56px 40px;display:flex;justify-content:center;gap:96px;}
.stat-item{text-align:center;}
.stat-num{font-size:46px;font-weight:900;letter-spacing:-2px;color:var(--t1);
  line-height:1;margin-bottom:8px;font-feature-settings:"cv01","ss03";}
.stat-num span{color:var(--green);}
.stat-label{font-size:13px;color:var(--ts);}

/* ── Sections ────────────────────────────────────────────────────────────── */
.lp-sec{position:relative;z-index:1;max-width:1120px;margin:0 auto;padding:96px 40px;}

.sec-eye{font-size:11px;font-weight:510;color:var(--accent-hi);
  letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px;}
.sec-title{font-size:clamp(30px,4vw,46px);font-weight:900;letter-spacing:-1.5px;
  color:var(--t1);line-height:1.06;margin-bottom:14px;}
.sec-sub{font-size:16px;line-height:1.65;color:var(--tm);max-width:440px;margin-bottom:60px;}

/* ── Features ────────────────────────────────────────────────────────────── */
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.feat-card{background:rgba(255,255,255,.02);border:1px solid var(--b2);
  border-radius:12px;padding:28px 26px;
  transition:background .2s,border-color .2s,transform .2s;position:relative;overflow:hidden;}
.feat-card:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.12);transform:translateY(-3px);}
.feat-card.hi{border-color:rgba(159,232,112,.14);background:rgba(159,232,112,.02);}
.feat-card.hi::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(159,232,112,.38),transparent);}
.feat-ic{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;
  justify-content:center;margin-bottom:22px;font-size:21px;}
.feat-title{font-size:15px;font-weight:590;color:var(--t1);margin-bottom:9px;}
.feat-desc{font-size:13px;color:var(--ts);line-height:1.65;}

/* ── Steps ───────────────────────────────────────────────────────────────── */
.steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;position:relative;}
.steps-grid::before{content:'';position:absolute;top:21px;
  left:calc(16.67% + 21px);right:calc(16.67% + 21px);height:1px;
  background:linear-gradient(90deg,rgba(94,106,210,.2),rgba(159,232,112,.18),rgba(94,106,210,.2));}
.step{text-align:center;}
.step-num{width:42px;height:42px;border-radius:50%;
  background:rgba(94,106,210,.08);border:1px solid rgba(94,106,210,.22);
  color:var(--accent-hi);font-size:14px;font-weight:700;
  display:flex;align-items:center;justify-content:center;margin:0 auto 22px;}
.step-title{font-size:15px;font-weight:590;color:var(--t1);margin-bottom:8px;}
.step-desc{font-size:13px;color:var(--ts);line-height:1.65;}

/* ── Testimonial / quote ─────────────────────────────────────────────────── */
.quote-card{position:relative;background:rgba(255,255,255,.02);
  border:1px solid var(--b2);border-radius:14px;padding:40px 44px;
  max-width:680px;margin:0 auto;text-align:center;}
.quote-card::before{content:'\u201c';position:absolute;top:-18px;left:44px;
  font-size:88px;font-weight:900;color:rgba(159,232,112,.2);line-height:1;
  font-feature-settings:"cv01","ss03";}
.quote-text{font-size:17px;font-weight:400;line-height:1.7;color:var(--t2);margin-bottom:24px;}
.quote-author{font-size:13px;font-weight:510;color:var(--tm);}
.quote-role{font-size:12px;color:var(--ts);margin-top:2px;}

/* ── CTA ─────────────────────────────────────────────────────────────────── */
.lp-cta{position:relative;z-index:1;text-align:center;padding:96px 24px;
  max-width:700px;margin:0 auto;}
.cta-title{font-size:clamp(36px,5.5vw,60px);font-weight:900;
  letter-spacing:-2.2px;line-height:.97;color:var(--t1);margin-bottom:20px;}
.cta-title em{font-style:normal;color:var(--green);}
.cta-sub{font-size:17px;color:var(--tm);line-height:1.65;
  max-width:420px;margin:0 auto 40px;}
.cta-note{font-size:13px;color:var(--ts);margin-top:16px;}

/* ── Footer ──────────────────────────────────────────────────────────────── */
.lp-footer{position:relative;z-index:1;border-top:1px solid var(--b1);
  padding:32px 40px;display:flex;align-items:center;justify-content:space-between;}
.footer-logo{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;
  letter-spacing:-.3px;color:var(--t1);text-decoration:none;}
.footer-copy{font-size:13px;color:var(--ts);}
.footer-links{display:flex;gap:24px;}
.footer-links a{font-size:13px;color:var(--ts);text-decoration:none;transition:color .15s;}
.footer-links a:hover{color:var(--t2);}

/* ── Divider ─────────────────────────────────────────────────────────────── */
.lp-div{position:relative;z-index:1;height:1px;background:var(--b1);margin:0;}
`

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function useCountUp(target: number, start: boolean, duration = 1800) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(ease * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [start, target, duration])
  return val
}

// ─────────────────────────────────────────────────────────────────────────────
// Logo SVG
// ─────────────────────────────────────────────────────────────────────────────
function BudLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <rect width="26" height="26" rx="7" fill="#9fe870" />
      {/* sprout / leaf mark */}
      <path d="M13 20V11" stroke="#163300" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 14C13 14 10 12 9 9C9 9 12 8 14 10C14 10 14.5 11 13 14Z"
        fill="#163300" fillOpacity=".85" />
      <path d="M13 12C13 12 15.5 10.5 17 8C17 8 14.5 7 13 9C13 9 12.5 10.5 13 12Z"
        fill="#163300" fillOpacity=".55" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// App Preview (mini dashboard mockup)
// ─────────────────────────────────────────────────────────────────────────────
function AppPreview() {
  const { ref, visible } = useInView(0.1)
  const bars = [
    { label: 'Food & Drink', pct: 78, color: '#9fe870' },
    { label: 'Transport', pct: 45, color: '#7170ff' },
    { label: 'Shopping', pct: 62, color: '#ffd11a' },
    { label: 'Utilities', pct: 30, color: '#d03238' },
  ]
  const txns = [
    { icon: '🛒', name: 'Whole Foods', date: 'Today', amt: '−$84.20', color: '#d03238', bg: 'rgba(208,50,56,.12)' },
    { icon: '☕', name: 'Blue Bottle', date: 'Today', amt: '−$6.50', color: '#d03238', bg: 'rgba(208,50,56,.12)' },
    { icon: '💼', name: 'Salary', date: 'Apr 1', amt: '+$4,200', color: '#9fe870', bg: 'rgba(159,232,112,.1)' },
    { icon: '🚗', name: 'Uber', date: 'Apr 8', amt: '−$18.00', color: '#d03238', bg: 'rgba(208,50,56,.12)' },
  ]
  return (
    <div ref={ref} className={`rv ${visible ? 'in d2' : ''}`} style={{ position: 'relative', maxWidth: 840, margin: '0 auto' }}>
      <div className="preview-glow" />
      <div className="preview-frame">
        {/* title bar */}
        <div className="preview-bar">
          <div className="pd pd-r" /><div className="pd pd-y" /><div className="pd pd-g" />
          <span className="preview-bar-title">bud — Dashboard</span>
        </div>
        <div className="preview-body">
          {/* sidebar */}
          <div className="preview-side">
            <div className="pnav on">
              <svg className="pnav-ic" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill="#9fe870" fillOpacity=".8"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor" fillOpacity=".3"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" fillOpacity=".3"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" fillOpacity=".3"/></svg>
              Dashboard
            </div>
            <div className="pnav">
              <svg className="pnav-ic" viewBox="0 0 15 15" fill="none"><circle cx="5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-2 1.8-3.5 4-3.5M14 13c0-2-1.8-3.5-4-3.5M7.5 13c0-2-1.5-3.5-4-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              Groups
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ height: 1, background: 'rgba(255,255,255,.05)', margin: '8px 0' }} />
            <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(159,232,112,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#9fe870', fontWeight: 700 }}>T</div>
              <span style={{ fontSize: 11, fontWeight: 510, color: '#8a8f98' }}>Tony N.</span>
            </div>
          </div>
          {/* main area */}
          <div className="preview-main">
            {/* widgets row 1 */}
            <div className="pw-row">
              <div className="pw">
                <div className="pw-label">Net Spending</div>
                <div className="pw-val r">−$2,847</div>
                <div className="pw-sub">April 2026</div>
              </div>
              <div className="pw">
                <div className="pw-label">Income</div>
                <div className="pw-val g">+$4,200</div>
                <div className="pw-sub">this month</div>
              </div>
            </div>
            {/* transactions + breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* txn list */}
              <div className="pw">
                <div className="pw-label" style={{ marginBottom: 10 }}>Recent</div>
                <div className="ptxns">
                  {txns.map((t, i) => (
                    <div key={i} className="ptxn">
                      <div className="ptxn-ic" style={{ background: t.bg }}>{t.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ptxn-name">{t.name}</div>
                        <div className="ptxn-meta">{t.date}</div>
                      </div>
                      <div className="ptxn-amt" style={{ color: t.color }}>{t.amt}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* bar chart */}
              <div className="pw">
                <div className="pw-label" style={{ marginBottom: 12 }}>By Category</div>
                <div className="pw-bar-wrap">
                  {bars.map((b, i) => (
                    <div key={i} className="pw-bar-row">
                      <span className="pw-bar-label">{b.label}</span>
                      <div className="pw-bar-track">
                        <div className="pw-bar-fill" style={{ width: visible ? `${b.pct}%` : '0%', background: b.color, opacity: .7 }} />
                      </div>
                      <span className="pw-bar-val">{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats counter
// ─────────────────────────────────────────────────────────────────────────────
function Stat({ prefix = '', suffix = '', target, label }: { prefix?: string, suffix?: string, target: number, label: string }) {
  const { ref, visible } = useInView(0.3)
  const val = useCountUp(target, visible)
  const display = val >= 1000 ? (val / 1000).toFixed(1) + 'K' : String(val)
  return (
    <div ref={ref} className="stat-item">
      <div className="stat-num">{prefix}<span>{display}</span>{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature card
// ─────────────────────────────────────────────────────────────────────────────
function FeatCard({ icon, bg, title, desc, hi, delay }: {
  icon: string, bg: string, title: string, desc: string, hi?: boolean, delay: string
}) {
  const { ref, visible } = useInView(0.1)
  return (
    <div ref={ref} className={`feat-card rv${hi ? ' hi' : ''}${visible ? ` in ${delay}` : ''}`}>
      <div className="feat-ic" style={{ background: bg }}>{icon}</div>
      <div className="feat-title">{title}</div>
      <div className="feat-desc">{desc}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const { ref: stepsRef, visible: stepsVis } = useInView(0.15)
  const { ref: ctaRef, visible: ctaVis } = useInView(0.2)
  const { ref: quoteRef, visible: quoteVis } = useInView(0.2)

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* Blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <Link to="/" className="nav-logo">
          <BudLogo size={26} />
          bud
        </Link>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <div className="nav-right">
          <Link to="/login" className="btn-ghost">Sign in</Link>
          <Link to="/register" className="btn-green">Get started →</Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="lp-hero" ref={heroRef}>
        <div className={`rv${heroVisible ? ' in' : ''}`}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Personal finance, reimagined
          </div>
        </div>

        <div className={`rv${heroVisible ? ' in d1' : ''}`}>
          <h1 className="hero-h1">
            Your finances,<br />
            <em>finally clear.</em>
          </h1>
        </div>

        <div className={`rv${heroVisible ? ' in d2' : ''}`}>
          <p className="hero-sub">
            Bud tracks your spending, splits group expenses, and surfaces the
            insights you need — in a clean, distraction-free interface.
          </p>
        </div>

        <div className={`rv${heroVisible ? ' in d3' : ''}`}>
          <div className="hero-actions">
            <Link to="/register" className="btn-green-lg">
              Start for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <a href="#features" className="btn-outline-lg">See features</a>
          </div>
        </div>

        <AppPreview />
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="lp-div" />
      <div className="lp-stats">
        <Stat prefix="$" suffix="M+" target={2.4} label="tracked in transactions" />
        <Stat target={18000} label="expenses logged" />
        <Stat target={940} label="groups settled" />
        <Stat suffix="%" target={100} label="free to get started" />
      </div>
      <div className="lp-div" />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="lp-sec" id="features">
        <div className="sec-eye">Features</div>
        <div className="sec-title">Everything you need,<br />nothing you don't.</div>
        <p className="sec-sub">
          A focused set of tools that give you total clarity over your personal finances.
        </p>

        <div className="feat-grid">
          <FeatCard
            icon="⚡"
            bg="rgba(159,232,112,.1)"
            title="Smart Dashboard"
            desc="Drag-and-drop widgets that surface what actually matters. Customize your view with spending summaries, transaction feeds, and category breakdowns."
            hi
            delay="d1"
          />
          <FeatCard
            icon="👥"
            bg="rgba(94,106,210,.1)"
            title="Group Splitting"
            desc="Track shared expenses, see who owes what, and record settlements in seconds. Your personal dashboard stays in sync automatically."
            delay="d2"
          />
          <FeatCard
            icon="📊"
            bg="rgba(255,209,26,.08)"
            title="Spending Insights"
            desc="Category breakdowns, card-level analytics, and month-over-month trends — so nothing ever surprises you on your statement."
            delay="d3"
          />
          <FeatCard
            icon="💳"
            bg="rgba(208,50,56,.08)"
            title="Card Tracking"
            desc="Link your cards and see exactly what each one costs you. Compare spending patterns across all your accounts at a glance."
            delay="d1"
          />
          <FeatCard
            icon="🏷️"
            bg="rgba(159,232,112,.08)"
            title="Smart Categories"
            desc="Auto-categorise transactions or create your own. A clean taxonomy so every dollar is accounted for and easy to find."
            delay="d2"
          />
          <FeatCard
            icon="⚡"
            bg="rgba(113,112,255,.1)"
            title="Quick Add"
            desc="Log a transaction in under three seconds with quick-add. No clutter, no friction — just the essentials to keep your records tight."
            delay="d3"
          />
        </div>
      </section>

      <div className="lp-div" />

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="lp-sec" id="how">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="sec-eye" style={{ justifyContent: 'center', display: 'flex' }}>How it works</div>
          <div className="sec-title" style={{ maxWidth: 520, margin: '0 auto' }}>Up and running in under a minute.</div>
        </div>

        <div className="steps-grid" ref={stepsRef}>
          {[
            { n: '1', title: 'Create your account', desc: 'Sign up in seconds. No credit card, no friction. Your financial canvas is ready immediately.' },
            { n: '2', title: 'Log your spending', desc: 'Add transactions manually with quick-add, or import them. Bud auto-categorises so you never have to.' },
            { n: '3', title: 'Get full clarity', desc: 'Your dashboard updates in real time. See net spending, category breakdowns, and group balances all in one place.' },
          ].map((s, i) => (
            <div key={i} className={`step rv${stepsVis ? ` in d${i + 1}` : ''}`}>
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="lp-div" />

      {/* ── Quote ────────────────────────────────────────────────────────── */}
      <section className="lp-sec" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div ref={quoteRef} className={`quote-card rv${quoteVis ? ' in' : ''}`}>
          <p className="quote-text">
            "I stopped dreading my monthly review. Bud makes it feel like opening a terminal — clean, fast, and honest about where my money went."
          </p>
          <div className="quote-author">Alex K.</div>
          <div className="quote-role">Software engineer, San Francisco</div>
        </div>
      </section>

      <div className="lp-div" />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="lp-cta" ref={ctaRef} id="pricing">
        <div className={`rv${ctaVis ? ' in' : ''}`}>
          <div className="hero-badge" style={{ justifyContent: 'center' }}>
            <span className="hero-badge-dot" />
            Free during early access
          </div>
        </div>
        <div className={`rv${ctaVis ? ' in d1' : ''}`}>
          <h2 className="cta-title">Start knowing<br />where it <em>all goes.</em></h2>
        </div>
        <div className={`rv${ctaVis ? ' in d2' : ''}`}>
          <p className="cta-sub">
            Join the people who already track every dollar — and never get surprised by their bank statement.
          </p>
          <Link to="/register" className="btn-green-lg" style={{ margin: '0 auto', display: 'inline-flex' }}>
            Get started free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div className="cta-note">No card required · Free during early access</div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <Link to="/" className="footer-logo">
          <BudLogo size={20} />
          bud
        </Link>
        <div className="footer-copy">© 2026 Bud. All rights reserved.</div>
        <nav className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </nav>
      </footer>
    </div>
  )
}
