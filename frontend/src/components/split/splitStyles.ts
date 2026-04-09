export const splitStyles = `
  .split-root *, .split-root *::before, .split-root *::after {
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    font-feature-settings: "cv01", "ss03";
    box-sizing: border-box;
  }

  /* ── Empty State ──────────────────────────────────────────── */
  .split-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    text-align: center;
    gap: 16px;
  }
  .split-empty-state-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: rgba(159,232,112,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  .split-empty-state h3 {
    font-size: 17px;
    font-weight: 600;
    color: #f7f8f8;
    margin: 0;
  }
  .split-empty-state p {
    font-size: 13px;
    color: rgba(247,248,248,0.45);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }
  .split-empty-actions {
    display: flex;
    gap: 10px;
    margin-top: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* ── Buttons ──────────────────────────────────────────────── */
  .split-btn-primary {
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
  .split-btn-primary:hover { opacity: 0.88; }
  .split-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .split-btn-secondary {
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
  .split-btn-secondary:hover { background: rgba(247,248,248,0.1); }

  .split-btn-ghost {
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
  .split-btn-ghost:hover { color: #f7f8f8; background: rgba(247,248,248,0.06); }

  .split-btn-danger {
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
  .split-btn-danger:hover { color: #ff6464; background: rgba(255,100,100,0.08); }

  /* ── Group Card ───────────────────────────────────────────── */
  .split-group-card {
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
  .split-group-card:hover {
    background: rgba(247,248,248,0.06);
    border-color: rgba(247,248,248,0.13);
    transform: translateY(-1px);
  }
  .split-group-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .split-group-card-name {
    font-size: 15px;
    font-weight: 600;
    color: #f7f8f8;
  }
  .split-group-card-meta {
    font-size: 12px;
    color: rgba(247,248,248,0.4);
    display: flex;
    gap: 12px;
  }
  .split-invite-code-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(159,232,112,0.06);
    border: 1px solid rgba(159,232,112,0.12);
    border-radius: 8px;
  }
  .split-invite-code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
    font-weight: 600;
    color: #9fe870;
    letter-spacing: 0.08em;
    flex: 1;
  }
  .split-copy-btn {
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
  .split-copy-btn:hover { color: #9fe870; }
  .split-copy-btn.copied { color: #9fe870; }

  /* ── Tab Bar ──────────────────────────────────────────────── */
  .split-tab-bar {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: rgba(247,248,248,0.04);
    border-radius: 12px;
    border: 1px solid rgba(247,248,248,0.07);
    width: fit-content;
  }
  .split-tab {
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
  .split-tab.active {
    background: rgba(247,248,248,0.1);
    color: #f7f8f8;
    font-weight: 600;
  }

  /* ── Expense Row ──────────────────────────────────────────── */
  .split-expense-row {
    background: rgba(247,248,248,0.03);
    border: 1px solid rgba(247,248,248,0.07);
    border-radius: 14px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: background 0.12s;
  }
  .split-expense-row:hover { background: rgba(247,248,248,0.05); }
  .split-expense-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .split-expense-name {
    font-size: 14px;
    font-weight: 600;
    color: #f7f8f8;
  }
  .split-expense-amount {
    font-size: 15px;
    font-weight: 700;
    color: #f7f8f8;
  }
  .split-expense-meta {
    font-size: 12px;
    color: rgba(247,248,248,0.4);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .split-paid-badge {
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
  .split-splits-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 4px;
    border-top: 1px solid rgba(247,248,248,0.06);
  }
  .split-split-item {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(247,248,248,0.5);
    padding: 2px 0;
  }
  .split-split-item-amount {
    font-weight: 500;
    color: rgba(247,248,248,0.7);
  }

  /* ── Balance Row ──────────────────────────────────────────── */
  .split-balance-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(247,248,248,0.03);
    border: 1px solid rgba(247,248,248,0.06);
  }
  .split-balance-row.is-you {
    border-color: rgba(247,248,248,0.12);
    background: rgba(247,248,248,0.05);
  }
  .split-balance-name {
    font-size: 13px;
    font-weight: 500;
    color: #f7f8f8;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .split-you-badge {
    font-size: 10px;
    font-weight: 600;
    background: rgba(247,248,248,0.1);
    color: rgba(247,248,248,0.5);
    padding: 2px 6px;
    border-radius: 4px;
  }
  .split-balance-amount {
    font-size: 14px;
    font-weight: 700;
  }
  .split-balance-amount.positive { color: #9fe870; }
  .split-balance-amount.negative { color: #ff6b6b; }
  .split-balance-amount.zero { color: rgba(247,248,248,0.3); }

  /* ── Settlement Row ───────────────────────────────────────── */
  .split-settlement-row {
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
  .split-settlement-row.involves-you {
    background: rgba(255,107,107,0.05);
    border-color: rgba(255,107,107,0.15);
  }
  .split-settlement-from { font-weight: 600; color: #f7f8f8; }
  .split-settlement-to { font-weight: 600; color: #f7f8f8; }
  .split-settlement-amount {
    margin-left: auto;
    font-size: 14px;
    font-weight: 700;
    color: #ff6b6b;
  }
  .split-settlement-row.involves-you .split-settlement-amount { color: #ff6b6b; }

  /* ── Section Header ───────────────────────────────────────── */
  .split-section-header {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(247,248,248,0.3);
    margin-bottom: 8px;
  }

  /* ── Modal ────────────────────────────────────────────────── */
  .split-modal-overlay {
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
  .split-modal {
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
  .split-modal-title {
    font-size: 17px;
    font-weight: 700;
    color: #f7f8f8;
  }
  .split-modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  /* ── Form ─────────────────────────────────────────────────── */
  .split-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .split-label {
    font-size: 12px;
    font-weight: 500;
    color: rgba(247,248,248,0.5);
  }
  .split-input {
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
  .split-input:focus { border-color: rgba(159,232,112,0.4); }
  .split-input::placeholder { color: rgba(247,248,248,0.25); }
  .split-select {
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
  .split-select:focus { border-color: rgba(159,232,112,0.4); }
  .split-select option { background: #111214; }

  /* ── Split Amount Row (in AddExpenseModal) ────────────────── */
  .split-amount-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .split-amount-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .split-amount-name {
    flex: 1;
    font-size: 13px;
    color: rgba(247,248,248,0.7);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .split-amount-input {
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
  .split-amount-input:focus { border-color: rgba(159,232,112,0.4); }

  /* ── Sum indicator ────────────────────────────────────────── */
  .split-sum-indicator {
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
  .split-sum-indicator.ok { border-color: rgba(159,232,112,0.25); color: #9fe870; }
  .split-sum-indicator.error { border-color: rgba(255,107,107,0.25); color: #ff6b6b; }

  /* ── Page header ──────────────────────────────────────────── */
  .split-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .split-page-title {
    font-size: 24px;
    font-weight: 700;
    color: #f7f8f8;
    letter-spacing: -0.02em;
  }
  .split-page-actions {
    display: flex;
    gap: 10px;
  }

  /* ── Back button ──────────────────────────────────────────── */
  .split-back-btn {
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
  .split-back-btn:hover { color: #f7f8f8; }

  /* ── Group detail header ──────────────────────────────────── */
  .split-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .split-detail-name {
    font-size: 22px;
    font-weight: 700;
    color: #f7f8f8;
    letter-spacing: -0.02em;
  }
  .split-member-avatars {
    display: flex;
    gap: -6px;
    flex-wrap: wrap;
    gap: 4px;
  }
  .split-member-chip {
    display: inline-flex;
    align-items: center;
    background: rgba(247,248,248,0.07);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(247,248,248,0.6);
  }
  .split-member-chip.is-you { color: #9fe870; background: rgba(159,232,112,0.08); }

  /* ── Error ────────────────────────────────────────────────── */
  .split-error {
    font-size: 12px;
    color: #ff6b6b;
    padding: 8px 12px;
    background: rgba(255,107,107,0.06);
    border: 1px solid rgba(255,107,107,0.15);
    border-radius: 8px;
  }
`
