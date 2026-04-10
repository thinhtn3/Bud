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
  .group-amount-input:focus { border-color: rgba(159,232,112,0.4); }

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
`
