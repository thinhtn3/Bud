/**
 * Bud Design System — CSS
 * Linear's dark precision + Wise's financial confidence.
 */
export const budStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

  /* ── Reset & Root ─────────────────────────────────────── */
  .bud-root *, .bud-root *::before, .bud-root *::after {
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    font-feature-settings: "cv01", "ss03";
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .bud-root {
    min-height: 100vh;
    background: #08090a;
    color: #f7f8f8;
    padding: 40px;
  }

  /* ── Header ───────────────────────────────────────────── */
  .bud-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    max-width: 1280px;
  }
  .bud-greeting {
    font-size: 13px;
    font-weight: 510;
    color: #8a8f98;
    letter-spacing: -0.13px;
    margin-bottom: 4px;
  }
  .bud-name {
    font-size: 32px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.704px;
    line-height: 1.13;
  }
  .bud-email {
    font-size: 13px;
    font-weight: 400;
    color: #62666d;
    letter-spacing: -0.13px;
    margin-top: 3px;
  }
  .bud-signout {
    background: rgba(255,255,255,0.02);
    color: #8a8f98;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 510;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }
  .bud-signout:hover {
    color: #f7f8f8;
    background: rgba(255,255,255,0.04);
  }

  /* ── Widget Grid ──────────────────────────────────────── */
  .bud-widget-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 16px;
    max-width: 1280px;
    width: 100%;
  }

  .bud-widget-cell { grid-column: span 6; min-width: 0; }
  .bud-widget-cell.cols-1  { grid-column: span 1; }
  .bud-widget-cell.cols-2  { grid-column: span 2; }
  .bud-widget-cell.cols-3  { grid-column: span 3; }
  .bud-widget-cell.cols-4  { grid-column: span 4; }
  .bud-widget-cell.cols-5  { grid-column: span 5; }
  .bud-widget-cell.cols-6  { grid-column: span 6; }
  .bud-widget-cell.cols-7  { grid-column: span 7; }
  .bud-widget-cell.cols-8  { grid-column: span 8; }
  .bud-widget-cell.cols-9  { grid-column: span 9; }
  .bud-widget-cell.cols-10 { grid-column: span 10; }
  .bud-widget-cell.cols-11 { grid-column: span 11; }
  .bud-widget-cell.cols-12 { grid-column: span 12; }

  @media (max-width: 1024px) {
    .bud-root { padding: 24px 20px; }
    .bud-widget-grid { grid-template-columns: repeat(6, 1fr); }
    .bud-widget-grid .bud-widget-cell { grid-column: span 6; }
  }
  @media (max-width: 640px) {
    .bud-root { padding: 20px 16px; }
    .bud-widget-grid { grid-template-columns: 1fr; gap: 12px; }
    .bud-widget-grid .bud-widget-cell { grid-column: span 1; }
  }

  /* ── Widget Card ──────────────────────────────────────── */
  .bud-widget {
    position: relative;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 24px;
    overflow: hidden;
    transition: background 0.15s, border-color 0.15s;
    height: 100%;
  }
  .bud-widget::before {
    content: '';
    position: absolute;
    top: 0; left: 16px; right: 16px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    pointer-events: none;
  }
  .bud-widget-label {
    font-size: 11px;
    font-weight: 510;
    color: #62666d;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .bud-widget-title {
    font-size: 18px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.288px;
    line-height: 1.33;
    margin-bottom: 4px;
  }

  /* ── Stat Cards Row ───────────────────────────────────── */
  .bud-stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .bud-stat-card {
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    border: 1px solid transparent;
    transition: filter 0.15s;
  }
  .bud-stat-card:hover { filter: brightness(1.08); }

  .bud-stat-balance { background: rgba(159,232,112,0.05); border-color: rgba(159,232,112,0.13); }
  .bud-stat-expense  { background: rgba(208,50,56,0.05);  border-color: rgba(208,50,56,0.13);  }
  .bud-stat-income   { background: rgba(113,112,255,0.05); border-color: rgba(113,112,255,0.13); }
  .bud-stat-count    { background: rgba(255,209,26,0.05);  border-color: rgba(255,209,26,0.13);  }

  .bud-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .bud-stat-label {
    font-size: 13px;
    font-weight: 400;
    color: #8a8f98;
    letter-spacing: -0.13px;
  }

  .bud-stat-icon {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bud-stat-icon-balance { background: rgba(159,232,112,0.14); color: #9fe870; }
  .bud-stat-icon-expense { background: rgba(208,50,56,0.14);   color: #d03238; }
  .bud-stat-icon-income  { background: rgba(113,112,255,0.14); color: #7170ff; }
  .bud-stat-icon-count   { background: rgba(255,209,26,0.14);  color: #ffd11a; }

  .bud-stat-amount {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.7px;
    line-height: 1.0;
    font-variant-numeric: tabular-nums;
    font-family: 'Berkeley Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace;
    margin-bottom: 6px;
  }
  .bud-stat-amount-balance { color: #9fe870; }
  .bud-stat-amount-expense { color: #d03238; }
  .bud-stat-amount-income  { color: #7170ff; }
  .bud-stat-amount-count   { color: #ffd11a; }

  .bud-stat-sub {
    font-size: 12px;
    font-weight: 400;
    color: #62666d;
    letter-spacing: -0.13px;
  }

  .bud-stat-skeleton {
    background: rgba(255,255,255,0.02);
    border-color: rgba(255,255,255,0.06) !important;
    height: 108px;
    animation: bud-pulse 1.5s ease-in-out infinite;
  }
  @keyframes bud-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
  }

  /* ── Period chip selector (inside stat card) ──────────── */
  .bud-period-chips {
    display: flex;
    gap: 3px;
    margin: 4px 0 12px;
    flex-wrap: wrap;
  }
  .bud-period-chip {
    font-size: 10px;
    font-weight: 510;
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent;
    color: #62666d;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-feature-settings: "cv01","ss03";
    transition: color 0.12s, background 0.12s, border-color 0.12s;
    line-height: 1.6;
  }
  .bud-period-chip:hover { color: #d0d6e0; border-color: rgba(255,255,255,0.14); }
  .bud-period-chip.active {
    background: rgba(255,209,26,0.12);
    border-color: rgba(255,209,26,0.28);
    color: #ffd11a;
  }

  @media (max-width: 1024px) {
    .bud-stat-row { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .bud-stat-row { grid-template-columns: 1fr 1fr; gap: 10px; }
    .bud-stat-amount { font-size: 22px; }
  }

  /* ── Type Toggle ──────────────────────────────────────── */
  .bud-toggle {
    display: flex;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9999px;
    padding: 3px;
    margin-bottom: 18px;
  }
  .bud-toggle-btn {
    flex: 1;
    padding: 7px 0;
    border: none;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 510;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: background 0.18s, color 0.18s, transform 0.12s;
    background: transparent;
    color: #8a8f98;
    text-transform: capitalize;
  }
  .bud-toggle-btn:hover { color: #d0d6e0; }
  .bud-toggle-btn.active-expense { background: #d03238; color: #f7f8f8; }
  .bud-toggle-btn.active-income  { background: #9fe870; color: #163300; }

  /* ── Form ─────────────────────────────────────────────── */
  .bud-form { display: flex; flex-direction: column; gap: 10px; }
  .bud-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .bud-input, .bud-select {
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
  }
  .bud-input::placeholder { color: #8a8f98; }
  .bud-input:focus, .bud-select:focus {
    border-color: rgba(255,255,255,0.16);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .bud-select { appearance: none; cursor: pointer; }
  .bud-select option { background: #191a1b; color: #f7f8f8; }

  /* Date input — remove default calendar icon style clashing */
  .bud-input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.5);
    cursor: pointer;
  }

  .bud-submit {
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
  .bud-submit:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 20px rgba(159,232,112,0.22);
  }
  .bud-submit:active:not(:disabled) { transform: scale(0.97); }
  .bud-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  .bud-error {
    font-size: 12px;
    color: #d03238;
    font-weight: 400;
    padding: 2px 0;
  }

  /* ── Transaction List ─────────────────────────────────── */
  .bud-tx-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    list-style: none;
    max-height: 380px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.08) transparent;
  }
  .bud-tx-list::-webkit-scrollbar { width: 4px; }
  .bud-tx-list::-webkit-scrollbar-track { background: transparent; }
  .bud-tx-list::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
  }

  .bud-tx-empty {
    font-size: 14px;
    color: #62666d;
    font-weight: 400;
    padding: 24px 0;
    text-align: center;
  }
  .bud-tx-loading {
    font-size: 13px;
    color: #8a8f98;
    padding: 24px 0;
    text-align: center;
  }

  .bud-tx-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 8px;
    border-radius: 6px;
    transition: background 0.12s;
    cursor: default;
  }
  .bud-tx-row + .bud-tx-row {
    border-top: 1px solid rgba(255,255,255,0.03);
  }
  .bud-tx-row:hover { background: rgba(255,255,255,0.025); }

  .bud-tx-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .bud-tx-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .bud-tx-dot.income  { background: #9fe870; }
  .bud-tx-dot.expense { background: #d03238; }

  .bud-tx-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .bud-tx-name {
    font-size: 14px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bud-tx-date {
    font-size: 12px;
    font-weight: 400;
    color: #62666d;
    letter-spacing: -0.13px;
  }
  .bud-tx-amount {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.165px;
    font-variant-numeric: tabular-nums;
    font-family: 'Berkeley Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace;
    flex-shrink: 0;
    margin-left: 12px;
  }
  .bud-tx-amount.income  { color: #9fe870; }
  .bud-tx-amount.expense { color: #d03238; }

  /* ── List header ──────────────────────────────────────── */
  .bud-widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .bud-count-badge {
    font-size: 11px;
    font-weight: 510;
    color: #8a8f98;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9999px;
    padding: 2px 8px;
    letter-spacing: 0;
  }

  /* ── Widget remove button ─────────────────────────────── */
  .bud-widget-remove {
    position: absolute;
    top: 14px; right: 14px;
    width: 22px; height: 22px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    cursor: pointer;
    color: #62666d;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s, background 0.15s;
    font-family: 'Inter', sans-serif;
  }
  .bud-widget-wrapper:hover .bud-widget-remove { opacity: 1; }
  .bud-widget-remove:hover { color: #d03238; background: rgba(208,50,56,0.08); }

  /* ── Dashboard empty state ────────────────────────────── */
  .bud-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 360px;
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 16px;
    max-width: 1280px;
    padding: 48px 24px;
    text-align: center;
  }
  .bud-empty-title {
    font-size: 18px;
    font-weight: 510;
    color: #d0d6e0;
    letter-spacing: -0.288px;
    margin-bottom: 8px;
  }
  .bud-empty-sub {
    font-size: 14px;
    font-weight: 400;
    color: #62666d;
    margin-bottom: 28px;
    max-width: 320px;
    line-height: 1.6;
  }

  /* ── Add widget button (header) ───────────────────────── */
  .bud-add-widget-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.03);
    color: #d0d6e0;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 510;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: color 0.15s, background 0.15s, border-color 0.15s;
  }
  .bud-add-widget-btn:hover {
    color: #f7f8f8;
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
  }
  .bud-add-widget-btn-primary {
    background: #9fe870;
    color: #163300;
    border: none;
    border-radius: 9999px;
    padding: 10px 22px;
    font-size: 14px;
    font-weight: 600;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .bud-add-widget-btn-primary:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 20px rgba(159,232,112,0.22);
  }

  /* ── Widget Picker panel ──────────────────────────────── */
  .bud-picker-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .bud-picker-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }

  .bud-picker-panel {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 360px;
    background: #0f1011;
    border-left: 1px solid rgba(255,255,255,0.08);
    z-index: 101;
    transform: translateX(100%);
    transition: transform 0.25s cubic-bezier(0.32,0.72,0,1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .bud-picker-panel.open { transform: translateX(0); }

  .bud-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px 0;
    flex-shrink: 0;
  }
  .bud-picker-title {
    font-size: 16px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.24px;
  }
  .bud-picker-close {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    color: #8a8f98;
    font-size: 12px;
    width: 26px; height: 26px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, background 0.15s;
    font-family: 'Inter', sans-serif;
  }
  .bud-picker-close:hover { color: #f7f8f8; background: rgba(255,255,255,0.07); }

  .bud-picker-hint {
    font-size: 13px;
    font-weight: 400;
    color: #62666d;
    padding: 10px 20px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex-shrink: 0;
  }

  .bud-picker-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
    flex: 1;
    padding: 8px 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.08) transparent;
  }

  .bud-picker-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer;
    text-align: left;
    transition: background 0.12s;
    width: 100%;
  }
  .bud-picker-item:last-child { border-bottom: none; }
  .bud-picker-item:hover:not(:disabled) { background: rgba(255,255,255,0.025); }
  .bud-picker-item:disabled { cursor: default; opacity: 0.6; }

  .bud-picker-item-body { min-width: 0; flex: 1; }
  .bud-picker-item-label {
    font-size: 14px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.14px;
    margin-bottom: 3px;
    font-family: 'Inter', sans-serif;
    font-feature-settings: "cv01","ss03";
  }
  .bud-picker-item-desc {
    font-size: 12px;
    font-weight: 400;
    color: #8a8f98;
    letter-spacing: -0.13px;
    font-family: 'Inter', sans-serif;
    font-feature-settings: "cv01","ss03";
  }
  .bud-picker-item-action {
    font-size: 12px;
    font-weight: 510;
    color: #9fe870;
    margin-left: 16px;
    flex-shrink: 0;
    font-family: 'Inter', sans-serif;
    font-feature-settings: "cv01","ss03";
  }
  .bud-picker-item.added .bud-picker-item-action { color: #62666d; }

  @media (max-width: 480px) {
    .bud-picker-panel { width: 100%; }
  }
`
