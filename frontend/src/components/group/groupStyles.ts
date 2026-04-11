export const groupStyles = `
  .group-root *, .group-root *::before, .group-root *::after {
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    font-feature-settings: "cv01", "ss03";
    box-sizing: border-box;
  }

  /* ── Empty State ──────────────────────────────────────────── */
  .group-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    text-align: center;
    gap: 16px;
  }
  .group-empty-state-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: rgba(159,232,112,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  .group-empty-state h3 {
    font-size: 17px;
    font-weight: 600;
    color: #f7f8f8;
    margin: 0;
  }
  .group-empty-state p {
    font-size: 13px;
    color: rgba(247,248,248,0.45);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }
  .group-empty-actions {
    display: flex;
    gap: 10px;
    margin-top: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* ── Buttons ──────────────────────────────────────────────── */
  .group-btn-primary {
    background: #9fe870;
    color: #0a0b0c;
    border: none;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .group-btn-primary:hover { opacity: 0.88; }
  .group-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .group-btn-secondary {
    background: rgba(247,248,248,0.06);
    color: #f7f8f8;
    border: 1px solid rgba(247,248,248,0.1);
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .group-btn-secondary:hover { background: rgba(247,248,248,0.1); }

  .group-btn-ghost {
    background: transparent;
    color: rgba(247,248,248,0.5);
    border: none;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: color 0.15s, background 0.15s;
  }
  .group-btn-ghost:hover { color: #f7f8f8; background: rgba(247,248,248,0.06); }

  .group-btn-danger {
    background: transparent;
    color: rgba(255,100,100,0.7);
    border: none;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: color 0.15s, background 0.15s;
  }
  .group-btn-danger:hover { color: #ff6464; background: rgba(255,100,100,0.08); }

  /* ── Group Card ───────────────────────────────────────────── */
  .group-group-card {
    background: rgba(247,248,248,0.03);
    border: 1px solid rgba(247,248,248,0.07);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.15s;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .group-group-card:hover {
    background: rgba(247,248,248,0.06);
    border-color: rgba(247,248,248,0.13);
    transform: translateY(-1px);
  }
  .group-group-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .group-group-card-name {
    font-size: 15px;
    font-weight: 600;
    color: #f7f8f8;
  }
  .group-group-card-meta {
    font-size: 12px;
    color: rgba(247,248,248,0.4);
    display: flex;
    gap: 12px;
  }
  .group-invite-code-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(159,232,112,0.06);
    border: 1px solid rgba(159,232,112,0.12);
    border-radius: 8px;
  }
  .group-invite-code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
    font-weight: 600;
    color: #9fe870;
    letter-spacing: 0.08em;
    flex: 1;
  }
  .group-copy-btn {
    background: transparent;
    border: none;
    color: rgba(159,232,112,0.6);
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    transition: color 0.15s;
    white-space: nowrap;
  }
  .group-copy-btn:hover { color: #9fe870; }
  .group-copy-btn.copied { color: #9fe870; }

  /* ── Tab Bar ──────────────────────────────────────────────── */
  .group-tab-bar {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: rgba(247,248,248,0.04);
    border-radius: 12px;
    border: 1px solid rgba(247,248,248,0.07);
    width: fit-content;
  }
  .group-tab {
    padding: 8px 18px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: transparent;
    color: rgba(247,248,248,0.5);
    transition: background 0.15s, color 0.15s;
  }
  .group-tab.active {
    background: rgba(247,248,248,0.1);
    color: #f7f8f8;
    font-weight: 600;
  }

  /* ── Expense Row ──────────────────────────────────────────── */
  .group-expense-row {
    background: rgba(247,248,248,0.03);
    border: 1px solid rgba(247,248,248,0.07);
    border-radius: 14px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: background 0.12s;
  }
  .group-expense-row:hover { background: rgba(247,248,248,0.05); }
  .group-expense-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .group-expense-name {
    font-size: 14px;
    font-weight: 600;
    color: #f7f8f8;
  }
  .group-expense-amount {
    font-size: 15px;
    font-weight: 700;
    color: #f7f8f8;
  }
  .group-expense-meta {
    font-size: 12px;
    color: rgba(247,248,248,0.4);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .group-paid-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(159,232,112,0.08);
    border: 1px solid rgba(159,232,112,0.15);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    color: #9fe870;
  }
  .group-splits-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 4px;
    border-top: 1px solid rgba(247,248,248,0.06);
  }
  .group-split-item {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(247,248,248,0.5);
    padding: 2px 0;
  }
  .group-split-item-amount {
    font-weight: 500;
    color: rgba(247,248,248,0.7);
  }

  /* ── Balances Columns (side-by-side layout) ─────────────── */
  .balances-columns {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  .balances-col {
    flex: 1;
    min-width: 0;
  }
  @media (max-width: 640px) {
    .balances-columns {
      flex-direction: column;
    }
  }

  /* ── Balance Row ──────────────────────────────────────────── */
  .group-balance-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(247,248,248,0.03);
    border: 1px solid rgba(247,248,248,0.06);
  }
  .group-balance-row.is-you {
    border-color: rgba(247,248,248,0.12);
    background: rgba(247,248,248,0.05);
  }
  .group-balance-name {
    font-size: 13px;
    font-weight: 500;
    color: #f7f8f8;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .group-you-badge {
    font-size: 10px;
    font-weight: 600;
    background: rgba(247,248,248,0.1);
    color: rgba(247,248,248,0.5);
    padding: 2px 6px;
    border-radius: 4px;
  }
  .group-balance-amount {
    font-size: 14px;
    font-weight: 700;
  }
  .group-balance-amount.positive { color: #9fe870; }
  .group-balance-amount.negative { color: #ff6b6b; }
  .group-balance-amount.zero { color: rgba(247,248,248,0.3); }

  /* ── Settlement Row ───────────────────────────────────────── */
  .group-settlement-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(247,248,248,0.03);
    border: 1px solid rgba(247,248,248,0.06);
    font-size: 13px;
    color: rgba(247,248,248,0.6);
  }
  .group-settlement-row.involves-you {
    background: rgba(255,107,107,0.05);
    border-color: rgba(255,107,107,0.15);
  }
  .group-settlement-from { font-weight: 600; color: #f7f8f8; }
  .group-settlement-to { font-weight: 600; color: #f7f8f8; }
  .group-settlement-amount {
    margin-left: auto;
    font-size: 14px;
    font-weight: 700;
    color: #ff6b6b;
  }
  .group-settlement-row.involves-you .group-settlement-amount { color: #ff6b6b; }

  /* ── Section Header ───────────────────────────────────────── */
  .group-section-header {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(247,248,248,0.3);
    margin-bottom: 8px;
  }

  /* ── Modal ────────────────────────────────────────────────── */
  .group-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .group-modal {
    background: #111214;
    border: 1px solid rgba(247,248,248,0.1);
    border-radius: 20px;
    padding: 28px;
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .group-modal-title {
    font-size: 17px;
    font-weight: 700;
    color: #f7f8f8;
  }
  .group-modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  /* ── Form ─────────────────────────────────────────────────── */
  .group-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .group-label {
    font-size: 12px;
    font-weight: 500;
    color: rgba(247,248,248,0.5);
  }
  .group-input {
    background: rgba(247,248,248,0.05);
    border: 1px solid rgba(247,248,248,0.1);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    color: #f7f8f8;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
  }
  .group-input:focus { border-color: rgba(159,232,112,0.4); }
  .group-input::placeholder { color: rgba(247,248,248,0.25); }
  .group-select {
    background: rgba(247,248,248,0.05);
    border: 1px solid rgba(247,248,248,0.1);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    color: #f7f8f8;
    outline: none;
    width: 100%;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .group-select:focus { border-color: rgba(159,232,112,0.4); }
  .group-select option { background: #111214; }

  /* ── Split Amount Row (in AddExpenseModal) ────────────────── */
  .group-amount-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .group-amount-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 8px;
    border-radius: 8px;
    margin: 0 -8px;
    transition: background 0.12s;
  }
  .group-amount-row:hover {
    background: rgba(247,248,248,0.04);
  }
  .group-amount-name {
    flex: 1;
    font-size: 13px;
    color: rgba(247,248,248,0.7);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .group-amount-input {
    background: rgba(247,248,248,0.05);
    border: 1px solid rgba(247,248,248,0.1);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 13px;
    color: #f7f8f8;
    outline: none;
    width: 90px;
    text-align: right;
    transition: border-color 0.15s;
  }
  .group-amount-input:focus { border-color: rgba(159,232,112,0.4); outline: none; }
  .group-amount-input:read-only { cursor: default; }
  .group-amount-input:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Split mode toggle ────────────────────────────────────── */
  .split-mode-toggle {
    display: flex;
    background: rgba(247,248,248,0.05);
    border: 1px solid rgba(247,248,248,0.08);
    border-radius: 8px;
    padding: 2px;
    gap: 2px;
  }
  .split-mode-btn {
    padding: 4px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(247,248,248,0.4);
    background: transparent;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .split-mode-btn.active {
    background: rgba(247,248,248,0.1);
    color: #f7f8f8;
    font-weight: 600;
  }
  .split-mode-btn:hover:not(.active) { color: rgba(247,248,248,0.65); }

  /* ── Split checkbox ───────────────────────────────────────── */
  .split-checkbox {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border: 1.5px solid rgba(247,248,248,0.18);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0a0b0c;
    transition: background 0.12s, border-color 0.12s;
    padding: 0;
  }
  .split-checkbox.checked {
    background: #9fe870;
    border-color: #9fe870;
  }
  .split-checkbox:hover:not(.checked) { border-color: rgba(247,248,248,0.35); }

  /* ── Sum indicator ────────────────────────────────────────── */
  .group-sum-indicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: rgba(247,248,248,0.04);
    border: 1px solid rgba(247,248,248,0.08);
  }
  .group-sum-indicator.ok { border-color: rgba(159,232,112,0.25); color: #9fe870; }
  .group-sum-indicator.error { border-color: rgba(255,107,107,0.25); color: #ff6b6b; }

  /* ── Page header ──────────────────────────────────────────── */
  .group-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .group-page-title {
    font-size: 24px;
    font-weight: 700;
    color: #f7f8f8;
    letter-spacing: -0.02em;
  }
  .group-page-actions {
    display: flex;
    gap: 10px;
  }

  /* ── Back button ──────────────────────────────────────────── */
  .group-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: rgba(247,248,248,0.5);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    margin-bottom: 20px;
    transition: color 0.15s;
  }
  .group-back-btn:hover { color: #f7f8f8; }

  /* ── Group detail header ──────────────────────────────────── */
  .group-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .group-detail-name {
    font-size: 22px;
    font-weight: 700;
    color: #f7f8f8;
    letter-spacing: -0.02em;
  }
  .group-member-avatars {
    display: flex;
    gap: -6px;
    flex-wrap: wrap;
    gap: 4px;
  }
  .group-member-chip {
    display: inline-flex;
    align-items: center;
    background: rgba(247,248,248,0.07);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(247,248,248,0.6);
  }
  .group-member-chip.is-you { color: #9fe870; background: rgba(159,232,112,0.08); }

  /* ── Error ────────────────────────────────────────────────── */
  .group-error {
    font-size: 12px;
    color: #ff6b6b;
    padding: 8px 12px;
    background: rgba(255,107,107,0.06);
    border: 1px solid rgba(255,107,107,0.15);
    border-radius: 8px;
  }

  /* ── Group List Cards (gl-*) ──────────────────────────────── */
  @keyframes gl-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes gl-skeleton-pulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }

  .gl-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(247,248,248,0.03);
    border: 1px solid rgba(247,248,248,0.07);
    border-radius: 16px;
    padding: 16px 18px;
    cursor: pointer;
    overflow: hidden;
    animation: gl-in 0.32s ease-out both;
    transition: background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.18s;
  }
  .gl-card:hover {
    background: rgba(247,248,248,0.055);
    border-color: rgba(247,248,248,0.12);
    box-shadow: 0 0 22px hsla(var(--gl-hue), 60%, 55%, 0.12), 0 6px 20px -6px rgba(0,0,0,0.35);
    transform: translateY(-2px);
  }

  .gl-bar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--gl-accent);
    border-radius: 16px 0 0 16px;
  }

  .gl-avatar {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: hsla(var(--gl-hue), 55%, 28%, 0.45);
    border: 1px solid hsla(var(--gl-hue), 55%, 45%, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: hsl(var(--gl-hue), 62%, 68%);
    letter-spacing: -0.01em;
  }

  .gl-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .gl-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .gl-name {
    font-size: 15px;
    font-weight: 600;
    color: #f7f8f8;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .gl-chevron {
    flex-shrink: 0;
    color: rgba(247,248,248,0.2);
    transition: color 0.15s, transform 0.15s;
  }
  .gl-card:hover .gl-chevron {
    color: hsl(var(--gl-hue), 62%, 62%);
    transform: translateX(2px);
  }

  .gl-meta-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .gl-date {
    font-size: 11.5px;
    color: rgba(247,248,248,0.32);
  }
  .gl-member-count {
    font-size: 11.5px;
    color: rgba(247,248,248,0.32);
  }
  .gl-member-count::before {
    content: '·';
    margin-right: 8px;
    opacity: 0.5;
  }

  .gl-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 3px;
  }

  .gl-dots {
    display: flex;
    align-items: center;
    padding-right: 5px;
  }
  .gl-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: hsla(var(--gl-hue), 50%, 32%, 0.6);
    border: 2px solid rgba(8,9,10,0.9);
    margin-right: -5px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    font-weight: 700;
    color: hsl(var(--gl-hue), 62%, 75%);
    letter-spacing: 0;
  }
  .gl-dot-overflow {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(247,248,248,0.07);
    border: 2px solid rgba(8,9,10,0.9);
    font-size: 8.5px;
    font-weight: 600;
    color: rgba(247,248,248,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: -5px;
    flex-shrink: 0;
  }

  .gl-sep {
    width: 1px;
    height: 12px;
    background: rgba(247,248,248,0.1);
    flex-shrink: 0;
    margin-left: 5px;
  }

  .gl-invite {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .gl-code {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 11px;
    font-weight: 600;
    color: rgba(247,248,248,0.35);
    letter-spacing: 0.06em;
  }
  .gl-copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(247,248,248,0.05);
    border: 1px solid rgba(247,248,248,0.08);
    border-radius: 6px;
    padding: 3px 7px;
    font-size: 10.5px;
    font-weight: 500;
    color: rgba(247,248,248,0.35);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .gl-copy-btn:hover {
    color: rgba(247,248,248,0.75);
    border-color: rgba(247,248,248,0.16);
    background: rgba(247,248,248,0.08);
  }
  .gl-copy-btn.copied {
    color: #9fe870;
    border-color: rgba(159,232,112,0.22);
    background: rgba(159,232,112,0.07);
  }

  .gl-skeleton {
    height: 80px;
    border-radius: 16px;
    background: rgba(247,248,248,0.04);
    animation: gl-skeleton-pulse 1.5s ease-in-out infinite;
  }

  /* ── Settlement Summary (gss-*) ───────────────────────────── */
  .gss-card {
    background: rgba(247,248,248,0.025);
    border: 1px solid rgba(247,248,248,0.08);
    border-radius: 16px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .gss-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .gss-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(247,248,248,0.3);
  }
  .gss-count {
    font-size: 11px;
    font-weight: 600;
    background: rgba(247,248,248,0.08);
    color: rgba(247,248,248,0.4);
    border-radius: 20px;
    padding: 1px 7px;
  }
  .gss-you-owe-badge {
    margin-left: auto;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,107,107,0.8);
    background: rgba(255,107,107,0.08);
    border: 1px solid rgba(255,107,107,0.15);
    border-radius: 20px;
    padding: 2px 9px;
  }

  .gss-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .gss-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(247,248,248,0.02);
    border: 1px solid rgba(247,248,248,0.05);
    transition: background 0.15s;
  }
  .gss-row.you-owe {
    background: rgba(255,107,107,0.04);
    border-color: rgba(255,107,107,0.14);
  }
  .gss-row.owed-to-you {
    background: rgba(159,232,112,0.03);
    border-color: rgba(159,232,112,0.1);
  }

  .gss-party {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }
  .gss-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(247,248,248,0.07);
    border: 1px solid rgba(247,248,248,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    color: rgba(247,248,248,0.5);
    flex-shrink: 0;
    letter-spacing: -0.02em;
  }
  .gss-avatar.you {
    background: rgba(159,232,112,0.1);
    border-color: rgba(159,232,112,0.2);
    color: #9fe870;
    font-size: 8px;
  }
  .gss-row.you-owe .gss-avatar:first-child {
    background: rgba(255,107,107,0.1);
    border-color: rgba(255,107,107,0.2);
    color: #ff6b6b;
  }
  .gss-name {
    font-size: 13px;
    font-weight: 500;
    color: rgba(247,248,248,0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90px;
  }
  .gss-row.you-owe .gss-party:first-child .gss-name { color: #ff6b6b; }
  .gss-row.owed-to-you .gss-party:last-of-type .gss-name { color: #9fe870; }

  .gss-arrow {
    color: rgba(247,248,248,0.2);
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .gss-row.you-owe .gss-arrow { color: rgba(255,107,107,0.4); }

  .gss-amount {
    margin-left: auto;
    font-size: 13px;
    font-weight: 700;
    color: rgba(247,248,248,0.6);
    font-family: 'SF Mono', 'Fira Code', monospace;
    flex-shrink: 0;
  }
  .gss-row.you-owe .gss-amount { color: #ff6b6b; }
  .gss-row.owed-to-you .gss-amount { color: #9fe870; }

  .gss-settle-btn {
    flex-shrink: 0;
    background: #9fe870;
    color: #0a0b0c;
    border: none;
    border-radius: 8px;
    padding: 5px 12px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
    margin-left: 6px;
  }
  .gss-settle-btn:hover { opacity: 0.85; }
  .gss-settle-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .gss-settled-badge {
    margin-left: auto;
    font-size: 11px;
    font-weight: 600;
    color: rgba(159,232,112,0.8);
    background: rgba(159,232,112,0.08);
    border: 1px solid rgba(159,232,112,0.15);
    border-radius: 20px;
    padding: 2px 9px;
  }
  .gss-settled-state {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 12px;
    background: rgba(159,232,112,0.03);
    border: 1px solid rgba(159,232,112,0.08);
    font-size: 12.5px;
    color: rgba(247,248,248,0.45);
  }

  .gss-footer {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(247,248,248,0.025);
    border: 1px solid rgba(247,248,248,0.07);
  }
  .gss-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }
  .gss-stat.gss-stat-center {
    align-items: center;
  }
  .gss-stat:last-child {
    align-items: flex-end;
  }
  .gss-stat-label {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(247,248,248,0.25);
    white-space: nowrap;
  }
  .gss-stat-value {
    font-size: 14px;
    font-weight: 700;
    color: rgba(247,248,248,0.6);
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .gss-stat-value.gss-stat-owe {
    color: #ff6b6b;
  }
  .gss-stat-value.gss-stat-owed {
    color: #9fe870;
  }
  .gss-stat-divider {
    width: 1px;
    height: 28px;
    background: rgba(247,248,248,0.07);
    margin: 0 10px;
    flex-shrink: 0;
  }

  /* ── Group Expense Card (ge-*) ────────────────────────────── */
  .ge-date-group {
    position: relative;
    padding-left: 24px;
    margin-left: 6px;
    overflow: hidden;
  }

  .ge-date-heading {
    position: relative;
    font-size: 10px;
    font-weight: 600;
    color: rgba(247,248,248,0.35);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding: 4px 0 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ge-date-heading::before {
    content: '';
    position: absolute;
    left: -18px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(247,248,248,0.18);
    box-sizing: border-box;
  }
  .ge-date-heading::after {
    content: '';
    position: absolute;
    left: -15px;
    top: calc(50% + 4px);
    width: 2px;
    height: 9999px;
    background: rgba(247,248,248,0.08);
    border-radius: 1px;
  }

  .ge-card {
    background: transparent;
    border: none;
    border-radius: 8px;
    overflow: hidden;
    transition: background 0.12s;
  }
  .ge-card:hover {
    background: rgba(255,255,255,0.025);
  }

  .ge-main {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 14px 16px;
  }

  .ge-icon {
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(247,248,248,0.07);
    border: 1px solid rgba(247,248,248,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    color: rgba(247,248,248,0.4);
    margin-top: 1px;
    flex-shrink: 0;
  }

  .ge-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ge-title {
    font-size: 14px;
    font-weight: 600;
    color: #f7f8f8;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ge-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    margin-top: 1px;
  }

  .ge-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(247,248,248,0.05);
    border: 1px solid rgba(247,248,248,0.08);
    border-radius: 6px;
    padding: 2px 7px 2px 5px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(247,248,248,0.45);
  }

  .ge-chip-cat {
    color: rgba(247,248,248,0.5);
    background: rgba(247,248,248,0.06);
    border-color: rgba(247,248,248,0.1);
  }

  .ge-payer-avatar {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: rgba(247,248,248,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7.5px;
    font-weight: 700;
    color: rgba(247,248,248,0.6);
    flex-shrink: 0;
  }

  .ge-note {
    font-size: 11.5px;
    color: rgba(247,248,248,0.33);
    font-style: italic;
  }

  .ge-right {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 7px;
  }

  .ge-amount {
    font-size: 16px;
    font-weight: 700;
    color: #f7f8f8;
    font-family: 'SF Mono', 'Fira Code', monospace;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .ge-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ge-splits-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(247,248,248,0.05);
    border: 1px solid rgba(247,248,248,0.09);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(247,248,248,0.4);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .ge-splits-btn:hover, .ge-splits-btn.active {
    color: rgba(247,248,248,0.8);
    border-color: rgba(247,248,248,0.16);
    background: rgba(247,248,248,0.09);
  }

  .ge-delete-btn {
    width: 27px;
    height: 27px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: rgba(247,248,248,0.22);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
    font-size: 11px;
  }
  .ge-delete-btn:hover {
    color: #ff6b6b;
    border-color: rgba(255,107,107,0.2);
    background: rgba(255,107,107,0.06);
  }
  .ge-delete-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .ge-splits-panel {
    border-top: 1px solid rgba(247,248,248,0.05);
    padding: 10px 16px 12px 67px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    background: rgba(0,0,0,0.12);
  }

  .ge-split-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ge-split-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(247,248,248,0.07);
    border: 1px solid rgba(247,248,248,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    color: rgba(247,248,248,0.5);
    flex-shrink: 0;
  }

  .ge-split-name {
    flex: 1;
    font-size: 12.5px;
    color: rgba(247,248,248,0.6);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ge-split-amount {
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(247,248,248,0.65);
    font-family: 'SF Mono', 'Fira Code', monospace;
    flex-shrink: 0;
  }

  /* ── Tab slide animation ──────────────────────────────────────── */
  @keyframes tab-slide-in-forward {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes tab-slide-in-back {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .tab-content-slide {
    will-change: transform, opacity;
  }
  .tab-slide-forward {
    animation: tab-slide-in-forward 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  .tab-slide-back {
    animation: tab-slide-in-back 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  /* ── Settings tab ─────────────────────────────────────────────── */
  .gs-row {
    display: flex;
    gap: 16px;
    align-items: stretch;
  }
  .gs-section {
    background: rgba(247,248,248,0.025);
    border: 1px solid rgba(247,248,248,0.08);
    border-radius: 14px;
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .gs-section-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(247,248,248,0.4);
  }
  .gs-success {
    font-size: 13px;
    color: #9fe870;
  }
  .gs-danger-zone {
    border-color: rgba(255,107,107,0.2);
    background: rgba(255,107,107,0.04);
  }
  .gs-danger-title {
    color: rgba(255,107,107,0.6);
  }
  .gs-danger-desc {
    font-size: 13px;
    color: rgba(247,248,248,0.45);
    margin: 0;
    line-height: 1.55;
  }
  .gs-confirm-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .gs-confirm-text {
    font-size: 13px;
    color: rgba(247,248,248,0.6);
    flex: 1;
    min-width: 160px;
  }
  .gs-confirm-btn {
    background: rgba(255,107,107,0.15);
    border: 1px solid rgba(255,107,107,0.35);
    color: #ff6b6b;
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .gs-confirm-btn:hover {
    background: rgba(255,107,107,0.25);
    border-color: rgba(255,107,107,0.55);
  }
  .gs-confirm-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .gs-readonly-name {
    font-size: 16px;
    font-weight: 600;
    color: rgba(247,248,248,0.85);
  }
  .gs-readonly-note {
    font-size: 13px;
    color: rgba(247,248,248,0.35);
    margin: 0;
  }
  .gs-invite-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .gs-invite-code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 15px;
    letter-spacing: 0.08em;
    color: #9fe870;
    background: rgba(159,232,112,0.08);
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid rgba(159,232,112,0.15);
    user-select: all;
    flex: 1;
  }
  .gs-members-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .gs-member-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 8px;
    transition: background 0.12s;
  }
  .gs-member-row:hover {
    background: rgba(247,248,248,0.03);
  }
  .gs-member-name {
    font-size: 13.5px;
    color: rgba(247,248,248,0.8);
  }
  .gs-owner-badge {
    font-size: 11px;
    font-weight: 600;
    color: #9fe870;
    background: rgba(159,232,112,0.1);
    padding: 3px 8px;
    border-radius: 6px;
    letter-spacing: 0.03em;
  }
  .gs-remove-btn {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,107,107,0.7);
    background: none;
    border: 1px solid rgba(255,107,107,0.2);
    border-radius: 6px;
    padding: 3px 10px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .gs-remove-btn:hover {
    color: #ff6b6b;
    border-color: rgba(255,107,107,0.45);
    background: rgba(255,107,107,0.08);
  }
  .gs-remove-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
`
