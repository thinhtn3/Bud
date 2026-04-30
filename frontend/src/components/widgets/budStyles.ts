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

  @keyframes bud-blob-1 {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(60px, -40px) scale(1.07); }
    66%  { transform: translate(-30px, 25px) scale(0.95); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes bud-blob-2 {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(-50px, 40px) scale(1.05); }
    66%  { transform: translate(35px, -50px) scale(0.93); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes bud-blob-3 {
    0%   { transform: translate(0px, 0px) scale(1); }
    50%  { transform: translate(30px, 30px) scale(1.08); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  .bud-root {
    min-height: 100vh;
    background: #08090a;
    color: #f7f8f8;
    padding: 40px;
    position: relative;
    box-sizing: border-box;
    width: 100%;
    overflow-x: clip;
  }

  /* ── Background blobs (fixed so they stay put on scroll) ─ */
  .bud-bg-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    will-change: transform;
    z-index: 0;
  }
  .bud-bg-blob-1 {
    width: 700px;
    height: 700px;
    top: -12%;
    right: -6%;
    background: radial-gradient(circle, rgba(159,232,112,0.07) 0%, transparent 65%);
    filter: blur(72px);
    animation: bud-blob-1 50s ease-in-out infinite;
  }
  .bud-bg-blob-2 {
    width: 600px;
    height: 600px;
    bottom: -10%;
    left: -5%;
    background: radial-gradient(circle, rgba(94,106,210,0.07) 0%, transparent 65%);
    filter: blur(80px);
    animation: bud-blob-2 65s ease-in-out infinite;
  }
  .bud-bg-blob-3 {
    width: 400px;
    height: 400px;
    top: 40%;
    left: 40%;
    background: radial-gradient(circle, rgba(159,232,112,0.04) 0%, transparent 65%);
    filter: blur(90px);
    animation: bud-blob-3 42s ease-in-out infinite;
  }

  /* Ensure all content sits above blobs */
  .bud-header,
  .bud-widget-grid,
  .bud-empty-state,
  .bud-picker-overlay,
  .bud-picker-panel {
    position: relative;
    z-index: 1;
  }

  /* ── Header ───────────────────────────────────────────── */
  .bud-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 14px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    max-width: 1280px;
  }

  /* ── Month navigator ──────────────────────────────────── */
  .bud-month-nav {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 28px;
    max-width: 1280px;
  }
  .bud-month-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    color: #8a8f98;
    cursor: pointer;
    transition: color 0.13s, background 0.13s, border-color 0.13s;
    flex-shrink: 0;
  }
  .bud-month-arrow:hover:not(:disabled) {
    color: #d0d6e0;
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.14);
  }
  .bud-month-arrow:disabled {
    opacity: 0.28;
    cursor: default;
  }
  .bud-month-label {
    font-size: 13px;
    font-weight: 600;
    color: #d0d6e0;
    letter-spacing: -0.2px;
    min-width: 108px;
    text-align: center;
  }
  .bud-month-today {
    margin-left: 6px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 510;
    color: #ffd11a;
    background: rgba(255,209,26,0.08);
    border: 1px solid rgba(255,209,26,0.2);
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.13s, border-color 0.13s;
    font-family: 'Inter', sans-serif;
  }
  .bud-month-today:hover {
    background: rgba(255,209,26,0.14);
    border-color: rgba(255,209,26,0.32);
  }
  .bud-greeting {
    font-size: 13px;
    font-weight: 400;
    color: #62666d;
    letter-spacing: -0.13px;
  }
  .bud-name {
    font-size: 16px;
    font-weight: 590;
    color: #f7f8f8;
    letter-spacing: -0.32px;
    line-height: 1.3;
  }
  .bud-email {
    font-size: 12px;
    font-weight: 400;
    color: #4a4f57;
    letter-spacing: -0.13px;
    margin-top: 2px;
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

  /* ── Widget Grid — Apple-style 4-column snap ──────────── */
  .bud-widget-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    max-width: 1280px;
    width: 100%;
  }

  /* Size tiers — widgets snap to fixed sizes */
  .bud-widget-cell           { grid-column: span 2; min-width: 0; }
  .bud-widget-cell.size-small  { grid-column: span 1; }
  .bud-widget-cell.size-medium { grid-column: span 2; }
  .bud-widget-cell.size-large  { grid-column: span 4; }

  /* Smooth layout transitions */
  .bud-widget-cell {
    transition: transform 0.2s cubic-bezier(0.32,0.72,0,1), opacity 0.2s;
  }

  @media (max-width: 1400px) {
    .bud-root { padding: 32px; }
    .bud-widget-grid { max-width: 100%; }
    .bud-header { max-width: 100%; }
    .bud-stat-amount { font-size: 22px; }
  }
  @media (max-width: 1024px) {
    .bud-root { padding: 24px 20px; }
    .bud-widget-grid { grid-template-columns: repeat(2, 1fr); }
    .bud-widget-cell.size-large { grid-column: span 2; }
  }
  @media (max-width: 640px) {
    .bud-root { padding: 20px 16px; }
    .bud-widget-grid { grid-template-columns: 1fr; gap: 12px; }
    .bud-widget-cell.size-small,
    .bud-widget-cell.size-medium,
    .bud-widget-cell.size-large { grid-column: span 1; }
  }

  /* ── Edit mode ────────────────────────────────────────── */
  .bud-edit-mode .bud-widget-cell {
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
  }

  /* 6-dot drag handle */
  .bud-drag-handle {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 24px;
    border-radius: 5px;
    cursor: grab;
    color: #62666d;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s, background 0.15s;
    z-index: 4;
  }
  .bud-edit-mode .bud-drag-handle { opacity: 1; }
  .bud-drag-handle:hover {
    color: #d0d6e0;
    background: rgba(255,255,255,0.06);
  }
  .bud-drag-handle:active { cursor: grabbing; }

  /* Edit-mode remove — Apple-style circle overlapping the corner */
  .bud-edit-mode .bud-widget-remove {
    opacity: 1 !important;
    top: -8px; left: -8px; right: auto;
    width: 24px; height: 24px;
    border-radius: 50%;
    background: #3d4047;
    border: 2px solid #08090a;
    color: #f7f8f8;
    font-size: 10px;
    z-index: 5;
    box-shadow: 0 2px 8px rgba(0,0,0,0.45);
  }
  .bud-edit-mode .bud-widget-remove:hover {
    background: #d03238;
    color: #f7f8f8;
  }

  /* ── Apple-style drag states ──────────────────────────── */

  /* Placeholder — the grid slot the dragged widget left behind */
  .bud-drag-placeholder {
    animation: none !important;
  }
  .bud-drag-placeholder > .bud-widget-wrapper {
    opacity: 0;
    pointer-events: none;
  }

  /* Floating widget — follows the pointer */
  .bud-drag-floating {
    border-radius: 14px;
    overflow: hidden;
    background: #0f1011;
    transform: scale(1.03);
    box-shadow:
      0 22px 70px rgba(0,0,0,0.55),
      0 8px 24px rgba(0,0,0,0.35),
      0 0 0 1px rgba(255,255,255,0.08);
    will-change: transform;
  }

  /* Drop spring animation */
  .bud-drag-floating.bud-dropping {
    transition:
      transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275),
      box-shadow 0.3s ease;
    box-shadow: none !important;
  }

  /* FLIP — non-dragged widgets sliding into new positions */
  .bud-widget-cell.bud-flip-animating {
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1) !important;
  }

  /* Stop jiggle on the placeholder */
  .bud-edit-mode .bud-drag-placeholder {
    animation: none !important;
  }

  /* ── Widget Card ──────────────────────────────────────── */
  .bud-widget {
    position: relative;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 24px;
    overflow: clip;
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

  /* 2×2 grid */
  .bud-stat-row--grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Vertical stack — compact horizontal card layout */
  .bud-stat-row--vertical {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .bud-stat-row--vertical .bud-stat-card {
    flex-direction: row;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
  }
  .bud-stat-row--vertical .bud-stat-top {
    flex-direction: row-reverse;
    margin-bottom: 0;
    flex-shrink: 0;
  }
  .bud-stat-row--vertical .bud-stat-label {
    display: none;
  }
  .bud-stat-row--vertical .bud-stat-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }
  .bud-stat-row--vertical .bud-stat-amount {
    font-size: 18px;
    letter-spacing: -0.4px;
    margin-bottom: 0;
    flex: 1;
    text-align: right;
  }
  .bud-stat-row--vertical .bud-stat-sub {
    font-size: 11px;
    color: #62666d;
    flex-shrink: 0;
    min-width: 72px;
  }
  /* Reorder children: icon | sub-label | amount */
  .bud-stat-row--vertical .bud-stat-top { order: 0; }
  .bud-stat-row--vertical .bud-stat-sub { order: 1; }
  .bud-stat-row--vertical .bud-stat-amount { order: 2; }

  .bud-stat-card {
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    border: 1px solid transparent;
    transition: filter 0.15s;
  }
  .bud-stat-card:hover { filter: brightness(1.08); }

  .bud-stat-balance { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.08); }
  .bud-stat-expense  { background: rgba(208,50,56,0.05);  border-color: rgba(208,50,56,0.13);  }
  .bud-stat-income   { background: rgba(159,232,112,0.05); border-color: rgba(159,232,112,0.13); }
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
  .bud-stat-icon-balance { background: rgba(255,255,255,0.07); color: #8a8f98; }
  .bud-stat-icon-expense { background: rgba(208,50,56,0.14);   color: #d03238; }
  .bud-stat-icon-income  { background: rgba(159,232,112,0.14); color: #9fe870; }
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
  .bud-stat-amount-income  { color: #9fe870; }
  .bud-stat-amount-count   { color: #ffd11a; }

  .bud-stat-sub {
    font-size: 12px;
    font-weight: 400;
    color: #62666d;
    letter-spacing: -0.13px;
  }
  .bud-stat-reimbursed  { color: #2dd4bf; font-weight: 500; }
  .bud-stat-net-expense { color: #f7f8f8; font-weight: 510; }

  .bud-inco-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .bud-inco-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .bud-inco-label {
    font-size: 11px;
    font-weight: 510;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    min-width: 84px;
    flex-shrink: 0;
  }
  .bud-inco-label-income    { color: #9fe870; }
  .bud-inco-label-reimburse { color: #2dd4bf; }
  .bud-inco-amount {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.4px;
    font-family: 'Berkeley Mono','SF Mono','Fira Code',monospace;
    flex: 1;
  }
  .bud-inco-amount-income    { color: #9fe870; }
  .bud-inco-amount-reimburse { color: #2dd4bf; }
  .bud-inco-row .bud-stat-sub { flex-shrink: 0; }

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

  /* ── Skeleton primitives ──────────────────────────────── */
  .bud-skel {
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
    animation: bud-pulse 1.5s ease-in-out infinite;
  }
  .bud-skel-circle {
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
    animation: bud-pulse 1.5s ease-in-out infinite;
    flex-shrink: 0;
  }
  .bud-skel-text {
    height: 11px;
    border-radius: 6px;
    background: rgba(255,255,255,0.05);
    animation: bud-pulse 1.5s ease-in-out infinite;
  }
  .bud-skel-heading {
    height: 18px;
    border-radius: 6px;
    background: rgba(255,255,255,0.06);
    animation: bud-pulse 1.5s ease-in-out infinite;
  }

  /* ── Widget Skeleton wrapper ──────────────────────────── */
  .bud-widget-skel {
    padding: 20px;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .bud-widget-skel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  /* ── Quick Add Widget ─────────────────────────────────── */
  .bud-qa-section {
    margin-bottom: 14px;
  }
  .bud-qa-section-label {
    font-size: 10px;
    font-weight: 510;
    color: #62666d;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 7px;
  }
  .bud-qa-chips {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .bud-qa-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 7px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s, border-color 0.12s;
    font-family: 'Inter', sans-serif;
    font-feature-settings: "cv01","ss03";
    gap: 8px;
  }
  .bud-qa-chip-expense {
    border-color: rgba(208,50,56,0.14);
    background: rgba(208,50,56,0.04);
  }
  .bud-qa-chip-expense:hover, .bud-qa-chip-expense.bud-qa-chip-active {
    background: rgba(208,50,56,0.09);
    border-color: rgba(208,50,56,0.28);
  }
  .bud-qa-chip-income {
    border-color: rgba(159,232,112,0.14);
    background: rgba(159,232,112,0.04);
  }
  .bud-qa-chip-income:hover, .bud-qa-chip-income.bud-qa-chip-active {
    background: rgba(159,232,112,0.09);
    border-color: rgba(159,232,112,0.28);
  }
  .bud-qa-chip-name {
    font-size: 13px;
    font-weight: 510;
    color: #d0d6e0;
    letter-spacing: -0.13px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .bud-qa-chip-amt {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.13px;
    font-variant-numeric: tabular-nums;
    font-family: 'Berkeley Mono', 'SF Mono', 'Fira Code', monospace;
    flex-shrink: 0;
  }
  .bud-qa-chip-amt-expense { color: #d03238; }
  .bud-qa-chip-amt-income  { color: #9fe870; }

  .bud-qa-chip-icon {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.05);
    color: #62666d;
  }
  .bud-qa-chip-expense .bud-qa-chip-icon {
    background: rgba(208,50,56,0.08);
    color: #b8282d;
  }
  .bud-qa-chip-income .bud-qa-chip-icon {
    background: rgba(159,232,112,0.08);
    color: #7ecb50;
  }
  .bud-qa-chip-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }
  .bud-qa-chip-category {
    font-size: 11px;
    color: #62666d;
    letter-spacing: -0.1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 440;
  }

  /* ── Category Breakdown small variant ────────────────── */
  .bud-cat-rows {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .bud-cat-row {
    display: grid;
    grid-template-columns: 88px 1fr 42px;
    align-items: center;
    gap: 8px;
  }
  .bud-cat-row-label {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }
  .bud-cat-row-emoji {
    font-size: 12px;
    flex-shrink: 0;
    line-height: 1;
  }
  .bud-cat-row-name {
    font-size: 11px;
    font-weight: 510;
    color: #8a8f98;
    letter-spacing: -0.1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bud-cat-row-bar-track {
    height: 5px;
    border-radius: 99px;
    background: rgba(255,255,255,0.05);
    overflow: hidden;
  }
  .bud-cat-row-bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .bud-cat-row-amount {
    font-size: 11px;
    font-weight: 700;
    color: #d0d6e0;
    letter-spacing: -0.1px;
    font-variant-numeric: tabular-nums;
    font-family: 'Berkeley Mono', 'SF Mono', monospace;
    text-align: right;
  }

  /* ── Quick Add small variant ──────────────────────────── */
  .bud-qa-widget--small { padding: 16px 18px; }
  .bud-qa-widget--small .bud-widget-label { margin-bottom: 10px; }

  .bud-qa-chips--inline {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
  }
  .bud-qa-chips--inline .bud-qa-chip {
    padding: 5px 10px;
    gap: 6px;
    flex: none;
  }
  .bud-qa-chips--inline .bud-qa-chip-name {
    font-size: 12px;
    max-width: 90px;
  }
  .bud-qa-chips--inline .bud-qa-chip-amt {
    font-size: 11px;
  }
  .bud-qa-chips--inline .bud-qa-chip-category { display: none; }
  .bud-qa-chips--inline .bud-qa-chip-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .bud-qa-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
    padding-top: 14px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .bud-qa-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .bud-qa-form-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .bud-qa-form-name {
    font-size: 14px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .bud-qa-form-badge {
    font-size: 10px;
    font-weight: 510;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border-radius: 9999px;
    padding: 2px 7px;
    flex-shrink: 0;
  }
  .bud-qa-form-badge-expense { background: rgba(208,50,56,0.12); color: #d03238; }
  .bud-qa-form-badge-income  { background: rgba(159,232,112,0.12); color: #9fe870; }
  .bud-qa-dismiss {
    background: none;
    border: none;
    color: #62666d;
    font-size: 11px;
    cursor: pointer;
    padding: 2px 4px;
    transition: color 0.12s;
    font-family: 'Inter', sans-serif;
    flex-shrink: 0;
  }
  .bud-qa-dismiss:hover { color: #8a8f98; }

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

  /* ── Budget progress bar ──────────────────────────────── */
  .bud-budget-bar-wrap {
    height: 3px;
    border-radius: 99px;
    background: rgba(255,255,255,0.06);
    margin: 8px 0 6px;
    overflow: hidden;
  }
  .bud-budget-bar-fill {
    height: 100%;
    border-radius: 99px;
    background: #ffd11a;
    transition: width 0.4s ease, background 0.2s;
  }
  .bud-budget-bar-fill.bud-budget-bar-over {
    background: #d03238;
  }

  @media (max-width: 1024px) {
    .bud-stat-row { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .bud-stat-row { grid-template-columns: 1fr 1fr; gap: 10px; }
    .bud-stat-amount { font-size: 22px; }
  }

  /* ── Type Toggle ──────────────────────────────────────── */
  /* ── Sliding type toggle ──────────────────────────────── */
  .bud-toggle {
    position: relative;
    display: flex;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9999px;
    padding: 3px;
    margin-bottom: 18px;
  }

  /* Sliding pill — sits behind the button labels */
  .bud-toggle-thumb {
    position: absolute;
    top: 3px; bottom: 3px; left: 3px;
    width: calc(50% - 3px);
    border-radius: 9999px;
    pointer-events: none;
    transition:
      transform        0.26s cubic-bezier(0.34, 1.20, 0.64, 1),
      background-color 0.22s ease;
  }
  /* 2-option toggle positions */
  .bud-toggle[data-active="expense"] .bud-toggle-thumb {
    transform: translateX(0%);
    background: #d03238;
    box-shadow: 0 2px 10px rgba(208,50,56,0.35);
  }
  .bud-toggle[data-active="income"] .bud-toggle-thumb {
    transform: translateX(100%);
    background: #9fe870;
    box-shadow: 0 2px 10px rgba(159,232,112,0.28);
  }
  .bud-toggle[data-active="reimbursement"] .bud-toggle-thumb {
    transform: translateX(100%);
    background: #2dd4bf;
    box-shadow: 0 2px 10px rgba(45,212,191,0.28);
  }

  /* 3-option toggle — thumb is 1/3 wide, slots at 0 / 100% / 200% */
  .bud-toggle--three .bud-toggle-thumb {
    width: calc(33.333% - 2px);
  }
  .bud-toggle--three[data-active="expense"] .bud-toggle-thumb {
    transform: translateX(0%);
    background: #d03238;
    box-shadow: 0 2px 10px rgba(208,50,56,0.35);
  }
  .bud-toggle--three[data-active="reimbursement"] .bud-toggle-thumb {
    transform: translateX(100%);
    background: #2dd4bf;
    box-shadow: 0 2px 10px rgba(45,212,191,0.28);
  }
  .bud-toggle--three[data-active="income"] .bud-toggle-thumb {
    transform: translateX(200%);
    background: #9fe870;
    box-shadow: 0 2px 10px rgba(159,232,112,0.28);
  }

  .bud-toggle-btn {
    position: relative; /* float above thumb */
    z-index: 1;
    flex: 1;
    padding: 7px 0;
    border: none;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 510;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    background: transparent;
    color: #8a8f98;
    text-transform: capitalize;
    transition: color 0.22s ease;
    user-select: none;
  }

  /* Active label colours */
  .bud-toggle[data-active="expense"]       .bud-toggle-btn[data-value="expense"]       { color: #f7f8f8; }
  .bud-toggle[data-active="income"]        .bud-toggle-btn[data-value="income"]        { color: #163300; }
  .bud-toggle[data-active="reimbursement"] .bud-toggle-btn[data-value="reimbursement"] { color: #003330; }

  /* Inactive label: lighten on hover */
  .bud-toggle[data-active="expense"]       .bud-toggle-btn[data-value="income"]:hover         { color: #d0d6e0; }
  .bud-toggle[data-active="expense"]       .bud-toggle-btn[data-value="reimbursement"]:hover  { color: #d0d6e0; }
  .bud-toggle[data-active="income"]        .bud-toggle-btn[data-value="expense"]:hover        { color: #d0d6e0; }
  .bud-toggle[data-active="income"]        .bud-toggle-btn[data-value="reimbursement"]:hover  { color: #d0d6e0; }
  .bud-toggle[data-active="reimbursement"] .bud-toggle-btn[data-value="expense"]:hover        { color: #d0d6e0; }
  .bud-toggle[data-active="reimbursement"] .bud-toggle-btn[data-value="income"]:hover         { color: #d0d6e0; }

  /* ── Form ─────────────────────────────────────────────── */
  .bud-form { display: flex; flex-direction: column; gap: 10px; }
  .bud-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .bud-input, .bud-select {
    width: 100%;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    line-height: 1.42857;
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
    min-height: 0;
    max-height: 380px;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.08) transparent;
  }
  .bud-tx-list::-webkit-scrollbar { width: 4px; }
  .bud-tx-list::-webkit-scrollbar-track { background: transparent; }
  .bud-tx-list::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
  }

  .bud-tx-date-heading {
    font-size: 10px;
    font-weight: 510;
    color: #62666d;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 10px 8px 4px;
    list-style: none;
  }
  .bud-tx-date-heading:first-child { padding-top: 2px; }

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
  .bud-tx-row-clickable { cursor: pointer; }
  .bud-tx-edit-hint {
    font-size: 11px;
    color: #62666d;
    opacity: 0;
    transition: opacity 0.12s;
    flex-shrink: 0;
  }
  .bud-tx-row-clickable:hover .bud-tx-edit-hint { opacity: 1; }

  /* Category icon container — replaces the dot */
  .bud-tx-icon-wrap {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bud-tx-icon-wrap.income        { background: rgba(159,232,112,0.1); color: #9fe870; }
  .bud-tx-icon-wrap.expense       { background: rgba(208,50,56,0.1);  color: #d03238; }
  .bud-tx-icon-wrap.reimbursement { background: rgba(45,212,191,0.1);  color: #2dd4bf; }

  /* Note / description line */
  .bud-tx-note {
    font-size: 11px;
    font-weight: 400;
    color: #62666d;
    letter-spacing: -0.11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 220px;
    font-style: italic;
  }

  .bud-tx-left { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
  .bud-tx-icon-wrap { margin-top: 1px; } /* optical alignment with first text line */
  .bud-tx-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .bud-tx-dot.income        { background: #9fe870; }
  .bud-tx-dot.expense       { background: #d03238; }
  .bud-tx-dot.reimbursement { background: #2dd4bf; }

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
  .bud-tx-amount.income        { color: #9fe870; }
  .bud-tx-amount.expense       { color: #d03238; }
  .bud-tx-amount.reimbursement { color: #2dd4bf; }

  /* ── Transaction drag handle ──────────────────────────── */
  .bud-tx-drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    cursor: grab;
    color: #62666d;
    opacity: 0;
    flex-shrink: 0;
    transition: opacity 0.12s, color 0.12s, background 0.12s;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
  }
  .bud-tx-row:hover .bud-tx-drag-handle { opacity: 1; }
  .bud-tx-drag-handle:hover { color: #d0d6e0; background: rgba(255,255,255,0.06); }
  .bud-tx-drag-handle:active { cursor: grabbing; }

  /* Placeholder row — invisible but holds height for FLIP */
  .bud-tx-row--placeholder { opacity: 0 !important; pointer-events: none; }
  .bud-tx-row--placeholder + .bud-tx-row { border-top: none; }

  /* Floating clone following the cursor */
  .bud-tx-floating {
    background: #1a1c1e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3);
    will-change: transform;
  }
  .bud-tx-floating.bud-tx-dropping {
    transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* FLIP animation for sibling rows shifting positions */
  .bud-tx-flip-animating {
    transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1) !important;
  }

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

  /* ── Edit Transaction Modal ───────────────────────────── */
  .bud-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: bud-overlay-in 0.15s ease;
  }
  @keyframes bud-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .bud-modal {
    background: #0f1011;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 28px;
    width: 100%;
    max-width: 460px;
    position: relative;
    animation: bud-modal-in 0.18s cubic-bezier(0.32,0.72,0,1);
    box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4);
  }
  .bud-modal::before {
    content: '';
    position: absolute;
    top: 0; left: 20px; right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
    border-radius: 14px 14px 0 0;
    pointer-events: none;
  }
  @keyframes bud-modal-in {
    from { opacity: 0; transform: scale(0.96) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .bud-modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .bud-modal-title {
    font-size: 16px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.24px;
  }
  .bud-modal-close {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    color: #8a8f98;
    font-size: 12px;
    width: 28px; height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, background 0.15s;
    font-family: 'Inter', sans-serif;
    flex-shrink: 0;
  }
  .bud-modal-close:hover { color: #f7f8f8; background: rgba(255,255,255,0.07); }
  .bud-modal-actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
  }
  .bud-modal-save {
    flex: 1;
    background: #9fe870;
    color: #163300;
    border: none;
    border-radius: 9999px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  }
  .bud-modal-save:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 20px rgba(159,232,112,0.22);
  }
  .bud-modal-save:disabled { opacity: 0.45; cursor: not-allowed; }
  .bud-modal-delete {
    background: rgba(208,50,56,0.1);
    color: #d03238;
    border: 1px solid rgba(208,50,56,0.22);
    border-radius: 6px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 510;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
  }
  .bud-modal-delete:hover:not(:disabled) { background: rgba(208,50,56,0.18); }
  .bud-modal-delete:disabled { opacity: 0.45; cursor: not-allowed; }

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
    transition: opacity 0.15s, color 0.15s, background 0.15s, top 0.15s, left 0.15s, right 0.15s;
    font-family: 'Inter', sans-serif;
    z-index: 5;
  }
  .bud-widget-wrapper:hover .bud-widget-remove { opacity: 1; }

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

  /* ── Size selection row inside picker ─────────────────── */
  .bud-picker-sizes {
    display: flex;
    gap: 6px;
    padding: 8px 20px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .bud-picker-size-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s;
    font-family: 'Inter', sans-serif;
    font-feature-settings: "cv01","ss03";
    flex: 1;
  }
  .bud-picker-size-btn:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.14);
  }
  .bud-picker-size-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .bud-picker-size-preview {
    display: flex;
    gap: 3px;
    height: 20px;
    align-items: flex-end;
  }
  .bud-picker-size-preview span {
    display: block;
    border-radius: 2px;
    background: rgba(94,106,210,0.5);
    height: 100%;
  }
  .bud-picker-size-btn:hover .bud-picker-size-preview span {
    background: rgba(94,106,210,0.7);
  }
  .bud-picker-size-label {
    font-size: 10px;
    font-weight: 510;
    color: #8a8f98;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── Edit mode header button ─────────────────────────── */
  .bud-edit-btn {
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
  .bud-edit-btn:hover {
    color: #f7f8f8;
    background: rgba(255,255,255,0.05);
  }
  .bud-edit-btn-done {
    background: rgba(94,106,210,0.15);
    color: #7170ff;
    border-color: rgba(94,106,210,0.3);
  }
  .bud-edit-btn-done:hover {
    background: rgba(94,106,210,0.22);
    color: #828fff;
  }

  @media (max-width: 480px) {
    .bud-picker-panel { width: 100%; }
  }

  /* ── Preferences Modal ─────────────────────────────── */
  .bud-prefs-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: none;
    color: #4a4f57;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.15s;
    padding: 0;
  }
  .bud-prefs-trigger:hover {
    color: #8a8f98;
  }

  .bud-prefs-modal {
    background: #0f1011;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 24px;
    width: 100%;
    max-width: 560px;
    position: relative;
    animation: bud-modal-in 0.18s cubic-bezier(0.32,0.72,0,1);
    box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4);
  }
  .bud-prefs-modal::before {
    content: '';
    position: absolute;
    top: 0; left: 20px; right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
    border-radius: 16px 16px 0 0;
    pointer-events: none;
  }

  .bud-prefs-section {
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 16px;
    margin-top: 16px;
  }

  .bud-prefs-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 36px;
  }

  .bud-prefs-label {
    font-size: 13px;
    font-weight: 400;
    color: #c8cccc;
    letter-spacing: -0.13px;
    flex-shrink: 0;
    margin: 0;
  }

  .bud-prefs-hint {
    font-size: 11px;
    color: #4a4f57;
    margin: 2px 0 0;
  }

  .bud-prefs-segment {
    display: flex;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    padding: 3px;
    gap: 3px;
    margin-top: 8px;
  }

  .bud-prefs-seg-btn {
    flex: 1;
    background: none;
    border: none;
    border-radius: 5px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 400;
    font-family: 'Inter', sans-serif;
    color: #62666d;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .bud-prefs-seg-btn.active {
    background: #9fe870;
    color: #163300;
    font-weight: 600;
  }

  .bud-prefs-input-wrap {
    position: relative;
    flex-shrink: 0;
  }
  .bud-prefs-input-prefix {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 13px;
    color: #4a4f57;
    pointer-events: none;
  }
  .bud-prefs-input {
    width: 120px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 7px 10px 7px 22px;
    font-size: 14px;
    font-weight: 400;
    font-family: 'Inter', sans-serif;
    color: #f7f8f8;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .bud-prefs-input::placeholder { color: #4a4f57; }
  .bud-prefs-input:focus {
    border-color: rgba(159,232,112,0.3);
    box-shadow: 0 0 0 3px rgba(159,232,112,0.06);
  }
  .bud-prefs-input::-webkit-inner-spin-button,
  .bud-prefs-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .bud-prefs-input[type=number] { -moz-appearance: textfield; }

  .bud-prefs-switch {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: rgba(255,255,255,0.1);
    border: none;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.2s;
    padding: 0;
  }
  .bud-prefs-switch.on { background: #9fe870; }
  .bud-prefs-switch::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    top: 3px;
    left: 3px;
    transition: left 0.2s cubic-bezier(0.34,1.20,0.64,1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .bud-prefs-switch.on::after { left: 19px; }

  .bud-prefs-badge {
    font-size: 12px;
    font-weight: 510;
    color: #8a8f98;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 4px 10px;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  .bud-prefs-cancel {
    background: none;
    border: none;
    color: #62666d;
    font-size: 14px;
    font-weight: 400;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 10px 8px;
    transition: color 0.15s;
  }
  .bud-prefs-cancel:hover { color: #8a8f98; }

  /* ── Card Alias Management ────────────────────────────── */
  .bud-card-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }
  .bud-card-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    transition: background 0.15s, border-color 0.15s;
  }
  .bud-card-item:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.12);
  }
  .bud-card-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .bud-card-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    flex-shrink: 0;
  }
  .bud-card-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .bud-card-name {
    font-size: 14px;
    font-weight: 510;
    color: #f7f8f8;
    letter-spacing: -0.14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bud-card-sub {
    font-size: 11px;
    color: #62666d;
    letter-spacing: -0.1px;
    text-transform: uppercase;
  }
  .bud-card-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .bud-card-action-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #8a8f98;
    cursor: pointer;
    transition: all 0.15s;
  }
  .bud-card-action-btn:hover {
    background: rgba(255,255,255,0.08);
    color: #f7f8f8;
    border-color: rgba(255,255,255,0.15);
  }
  .bud-card-action-btn.delete:hover {
    background: rgba(208,50,56,0.15);
    color: #d03238;
    border-color: rgba(208,50,56,0.25);
  }
  .bud-card-action-btn--default {
    background: rgba(255,209,26,0.1);
    color: #ffd11a;
    border-color: rgba(255,209,26,0.25);
  }
  .bud-card-action-btn--default:hover {
    background: rgba(255,209,26,0.16);
    color: #ffd11a;
    border-color: rgba(255,209,26,0.38);
  }

  .bud-card-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: rgba(255,255,255,0.015);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    margin-top: 12px;
  }
  .bud-card-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .bud-color-picker {
    display: flex;
    gap: 8px;
    margin-top: 4px;
    flex-wrap: wrap;
  }
  .bud-color-swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: transform 0.15s, border-color 0.15s;
  }
  .bud-color-swatch:hover { transform: scale(1.15); }
  .bud-color-swatch.active { border-color: #fff; transform: scale(1.1); }

  /* ── Sidebar Navbar ───────────────────────────────────── */
  .bud-navbar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 180px;
    background: #0f1011;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    padding: 20px 12px 20px;
    z-index: 50;
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
  }

  /* Brand */
  .bud-nav-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 4px 8px 0;
    margin-bottom: 28px;
  }
  .bud-nav-brand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bud-nav-brand-name {
    font-size: 14px;
    font-weight: 590;
    letter-spacing: -0.2px;
    color: #d0d6e0;
    font-feature-settings: "cv01", "ss03";
  }

  /* Nav section */
  .bud-nav-items {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
  }

  /* Nav item — shared */
  .bud-nav-item {
    width: 100%;
    height: 34px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 9px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 100ms ease;
    text-align: left;
  }
  .bud-nav-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #62666d;
    transition: color 100ms ease;
  }
  .bud-nav-item-label {
    font-size: 13px;
    font-weight: 510;
    letter-spacing: -0.13px;
    color: #62666d;
    font-feature-settings: "cv01", "ss03";
    transition: color 100ms ease;
  }

  .bud-nav-item:hover .bud-nav-item-icon,
  .bud-nav-item:hover .bud-nav-item-label {
    color: #d0d6e0;
  }
  .bud-nav-item:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  /* Active state */
  .bud-nav-item--active {
    background: rgba(113, 112, 255, 0.09);
  }
  .bud-nav-item--active .bud-nav-item-icon,
  .bud-nav-item--active .bud-nav-item-label {
    color: #f7f8f8;
  }
  .bud-nav-item--active:hover {
    background: rgba(113, 112, 255, 0.13);
  }
  .bud-nav-item--active:hover .bud-nav-item-icon,
  .bud-nav-item--active:hover .bud-nav-item-label {
    color: #f7f8f8;
  }

  /* Profile block */
  .bud-nav-profile-wrap {
    margin-top: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 12px;
  }
  .bud-nav-profile {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 8px;
    border-radius: 7px;
    cursor: default;
    transition: background 100ms ease;
  }
  .bud-nav-profile:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  .bud-nav-avatar {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: rgba(113, 112, 255, 0.14);
    color: #7170ff;
    font-size: 11px;
    font-weight: 600;
    font-feature-settings: "cv01", "ss03";
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    letter-spacing: 0.3px;
  }
  .bud-nav-profile-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    flex: 1;
  }
  .bud-nav-profile-name {
    font-size: 12px;
    font-weight: 510;
    color: #d0d6e0;
    font-feature-settings: "cv01", "ss03";
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bud-nav-profile-email {
    font-size: 11px;
    font-weight: 400;
    color: #4a4f57;
    font-feature-settings: "cv01", "ss03";
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bud-nav-signout-btn {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: #4a4f57;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 100ms ease, color 100ms ease, background 100ms ease;
  }
  .bud-nav-profile:hover .bud-nav-signout-btn {
    opacity: 1;
  }
  .bud-nav-signout-btn:hover {
    color: #8a8f98;
    background: rgba(255, 255, 255, 0.05);
  }

  /* ── Floating action button ───────────────────────────── */
  .bud-fab {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #9fe870;
    color: #163300;
    border: none;
    font-size: 24px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 24px rgba(159,232,112,0.30), 0 2px 8px rgba(0,0,0,0.35);
    transition: transform 0.15s, box-shadow 0.15s;
    z-index: 400;
  }
  .bud-fab:hover {
    transform: scale(1.07);
    box-shadow: 0 6px 32px rgba(159,232,112,0.40), 0 2px 8px rgba(0,0,0,0.35);
  }
  .bud-fab:active { transform: scale(0.96); }

  /* ── Add transaction modal — success state ────────────── */
  .bud-add-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 12px 0 4px;
    text-align: center;
  }
  .bud-add-success-check { color: #9fe870; }
  .bud-add-success-label {
    font-size: 14px;
    font-weight: 500;
    color: #c8cdd6;
    margin-bottom: 8px;
  }
  .bud-add-success .bud-modal-actions { width: 100%; }

  /* ── Modal secondary (Done) button ───────────────────── */
  .bud-modal-secondary {
    flex: 1;
    background: rgba(255,255,255,0.04);
    color: #8a8f98;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9999px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 510;
    font-feature-settings: "cv01","ss03";
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .bud-modal-secondary:hover {
    background: rgba(255,255,255,0.07);
    color: #c8cdd6;
  }
`
