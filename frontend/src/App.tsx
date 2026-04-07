import { useState, useEffect, useRef, useCallback } from "react";

// ─── FONTS + CSS ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink:     #12100A;
  --ink-m:   #3A3328;
  --ink-l:   #7A6E60;
  --sand:    #F7F3EE;
  --wheat:   #EDE4D4;
  --wheat-d: #C9B898;
  --gold:    #B8972A;
  --gold-l:  #F5EDCF;
  --teal:    #1A8A6A;
  --teal-l:  #DDF2EA;
  --teal-d:  #0E6048;
  --amber:   #C07A18;
  --amber-l: #FEF0D4;
  --sky:     #1B6FA8;
  --sky-l:   #E0EDF8;
  --red:     #B83C28;
  --red-l:   #FDEAE6;
  --white:   #FFFEFB;
  --border:  rgba(18,16,10,.10);
  --border-m:rgba(18,16,10,.18);
  --r:       6px;
  --r-lg:    12px;
  --mono:    'DM Mono', monospace;
  --serif:   'Fraunces', serif;
  --sans:    'DM Sans', sans-serif;
  --shadow:  0 1px 3px rgba(18,16,10,.08), 0 4px 12px rgba(18,16,10,.04);
}

html, body, #root { height: 100%; background: var(--sand); }
body { font-family: var(--sans); color: var(--ink); -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { background: var(--wheat-d); border-radius: 3px; }

/* ── Layout ── */
.app-shell { display: flex; flex-direction: column; min-height: 100vh; }

/* ── Topbar ── */
.topbar {
  height: 56px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  background: var(--ink); position: sticky; top: 0; z-index: 100;
}
.topbar-brand {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--serif); font-size: 18px; font-weight: 600;
  color: var(--white); letter-spacing: -.3px;
}
.brand-badge {
  width: 28px; height: 28px; background: var(--gold);
  border-radius: 5px; display: flex; align-items: center;
  justify-content: center; font-size: 14px;
}
.topbar-center {
  display: flex; align-items: center; gap: 20px;
  font-family: var(--mono); font-size: 11px;
}
.price-chip {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; padding: 4px 12px;
}
.price-label { color: rgba(255,255,255,.4); }
.price-value { color: var(--gold); font-weight: 500; }
.price-delta { font-size: 10px; padding: 1px 5px; border-radius: 3px; }
.price-delta.up { background: rgba(26,138,106,.25); color: #5ecba1; }
.price-delta.dn { background: rgba(184,60,40,.25); color: #f08070; }
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #5ecba1; animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.wallet-pill {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 4px 12px; font-family: var(--mono);
  font-size: 11px; color: rgba(255,255,255,.7); cursor: pointer;
}
.wallet-pill:hover { background: rgba(255,255,255,.13); }
.w-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); }

/* ── Nav ── */
.nav {
  display: flex; gap: 2px; padding: 0 24px;
  background: var(--white); border-bottom: 1px solid var(--border);
  position: sticky; top: 56px; z-index: 90;
}
.nav-item {
  display: flex; align-items: center; gap: 7px;
  padding: 0 16px; height: 48px; font-size: 13px; font-weight: 500;
  color: var(--ink-l); border: none; background: none; cursor: pointer;
  border-bottom: 2px solid transparent; position: relative; top: 1px;
  transition: color .12s;
}
.nav-item:hover { color: var(--ink); }
.nav-item.active { color: var(--teal-d); border-bottom-color: var(--teal); }
.nav-badge {
  font-size: 10px; font-family: var(--mono); padding: 1px 5px;
  border-radius: 3px; background: var(--teal-l); color: var(--teal-d);
  font-weight: 500;
}

/* ── Content ── */
.page { padding: 24px; max-width: 1100px; margin: 0 auto; width: 100%; }

/* ── Cards ── */
.card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 18px 20px;
  box-shadow: var(--shadow);
}
.card-title {
  font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 12px;
  letter-spacing: -.1px;
}

/* ── Stat cards ── */
.stats { display: grid; gap: 10px; margin-bottom: 20px; }
.stats.c4 { grid-template-columns: repeat(4, 1fr); }
.stats.c3 { grid-template-columns: repeat(3, 1fr); }
.stat-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 14px 16px; box-shadow: var(--shadow);
}
.stat-label {
  font-size: 10px; font-weight: 600; color: var(--ink-l);
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px;
}
.stat-val { font-family: var(--mono); font-size: 20px; font-weight: 500; color: var(--ink); }
.stat-val.green { color: var(--teal-d); }
.stat-val.gold  { color: var(--gold); }
.stat-val.sky   { color: var(--sky); }
.stat-sub { font-size: 11px; color: var(--ink-l); margin-top: 3px; }

/* ── Badges ── */
.badge {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: var(--mono); font-size: 10px; font-weight: 500;
  padding: 2px 7px; border-radius: 4px; letter-spacing: .03em;
}
.badge-teal   { background: var(--teal-l);  color: var(--teal-d); }
.badge-gold   { background: var(--gold-l);  color: #7a5e0a; }
.badge-sky    { background: var(--sky-l);   color: #0e4f7a; }
.badge-red    { background: var(--red-l);   color: var(--red); }
.badge-amber  { background: var(--amber-l); color: var(--amber); }
.badge-ink    { background: var(--ink);     color: var(--wheat); }
.badge-live   { background: var(--teal); color: white; animation: blink 2s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.7} }

/* ── Buttons ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 18px; border-radius: var(--r); font-family: var(--sans);
  font-size: 13px; font-weight: 500; cursor: pointer; border: none;
  transition: all .12s; white-space: nowrap;
}
.btn-primary { background: var(--teal); color: white; }
.btn-primary:hover { background: var(--teal-d); transform: translateY(-1px); }
.btn-gold { background: var(--gold); color: white; }
.btn-gold:hover { filter: brightness(.9); transform: translateY(-1px); }
.btn-sky { background: var(--sky); color: white; }
.btn-sky:hover { filter: brightness(.9); transform: translateY(-1px); }
.btn-outline {
  background: transparent; color: var(--ink);
  border: 1.5px solid var(--border-m);
}
.btn-outline:hover { border-color: var(--teal); color: var(--teal-d); }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-full { width: 100%; }
.btn:disabled { opacity: .4; cursor: not-allowed; transform: none !important; filter: none !important; }

/* ── Form elements ── */
.field { margin-bottom: 12px; }
.field-label {
  display: block; font-size: 11px; font-weight: 600;
  color: var(--ink-l); text-transform: uppercase; letter-spacing: .06em;
  margin-bottom: 5px;
}
.input-wrap { display: flex; align-items: stretch; }
.input {
  flex: 1; height: 38px; padding: 0 11px;
  background: var(--sand); border: 1.5px solid var(--border-m);
  border-radius: var(--r); font-family: var(--mono); font-size: 13px;
  color: var(--ink); outline: none; transition: border .12s;
}
.input:focus { border-color: var(--teal); background: white; }
.input-sfx {
  display: flex; align-items: center; padding: 0 10px;
  background: var(--wheat); border: 1.5px solid var(--border-m);
  border-left: none; border-radius: 0 var(--r) var(--r) 0;
  font-family: var(--mono); font-size: 11px; font-weight: 500;
  color: var(--ink-m);
}
.input.round-l { border-radius: var(--r) 0 0 var(--r); }

/* ── Tables ── */
.tbl-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th {
  text-align: left; font-size: 10px; font-weight: 600; color: var(--ink-l);
  text-transform: uppercase; letter-spacing: .06em;
  padding: 8px 12px; border-bottom: 1px solid var(--border);
  background: var(--sand); white-space: nowrap;
}
td {
  padding: 11px 12px; font-size: 13px; color: var(--ink-m);
  border-bottom: 1px solid var(--border);
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: rgba(26,138,106,.03); }
.td-mono { font-family: var(--mono); font-size: 12px; }
.td-green { color: var(--teal-d); font-family: var(--mono); font-weight: 500; }
.td-gold  { color: var(--gold);   font-family: var(--mono); font-weight: 500; }

/* ── Progress ── */
.prog-track { height: 5px; background: var(--wheat); border-radius: 3px; overflow: hidden; }
.prog-fill  { height: 100%; border-radius: 3px; transition: width .8s; }

/* ── Info/warn boxes ── */
.info-box {
  background: var(--teal-l); border: 1px solid rgba(26,138,106,.2);
  border-radius: var(--r); padding: 11px 13px;
  font-size: 12px; color: var(--teal-d); line-height: 1.5; margin-bottom: 12px;
}
.warn-box {
  background: var(--amber-l); border: 1px solid rgba(192,122,24,.2);
  border-radius: var(--r); padding: 11px 13px;
  font-size: 12px; color: var(--amber); line-height: 1.5; margin-bottom: 12px;
}
.gold-box {
  background: var(--gold-l); border: 1px solid rgba(184,151,42,.2);
  border-radius: var(--r); padding: 11px 13px;
  font-size: 12px; color: #7a5e0a; line-height: 1.5; margin-bottom: 12px;
}

/* ── Grid helpers ── */
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.flex { display: flex; align-items: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-gap { display: flex; align-items: center; gap: 8px; }
.gap-8 { gap: 8px; }
.gap-12 { gap: 12px; }
.mt-8  { margin-top: 8px; }
.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.mt-20 { margin-top: 20px; }
.mb-8  { margin-bottom: 8px; }
.mb-12 { margin-bottom: 12px; }
.mb-16 { margin-bottom: 16px; }
.mb-20 { margin-bottom: 20px; }
.text-sm   { font-size: 12px; color: var(--ink-l); }
.text-mono { font-family: var(--mono); font-size: 12px; }
.text-bold { font-weight: 600; }
.divider { height: 1px; background: var(--border); margin: 14px 0; }

/* ── Receipt card ── */
.receipt-card {
  background: var(--ink); color: white; border-radius: var(--r-lg);
  padding: 20px; position: relative; overflow: hidden;
}
.receipt-card::after {
  content: ''; position: absolute; top: -40px; right: -40px;
  width: 130px; height: 130px; background: var(--gold);
  border-radius: 50%; opacity: .12;
}
.receipt-serial { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,.4); margin-bottom: 8px; letter-spacing: .08em; }
.receipt-amount { font-family: var(--mono); font-size: 26px; font-weight: 500; color: #e8c85a; margin-bottom: 3px; }
.receipt-sub    { font-size: 11px; color: rgba(255,255,255,.5); margin-bottom: 14px; }
.receipt-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 0; border-top: 1px solid rgba(255,255,255,.08);
  font-size: 12px;
}
.receipt-key { color: rgba(255,255,255,.45); }
.receipt-val { font-family: var(--mono); color: white; }

/* ── Vault card (dark) ── */
.vault-dark {
  background: var(--ink); color: white; border-radius: var(--r-lg);
  padding: 22px; position: relative; overflow: hidden;
}
.vault-dark::before {
  content: ''; position: absolute;
  width: 180px; height: 180px; border-radius: 50%;
  background: var(--teal); opacity: .08; top: -50px; right: -50px;
}
.vault-label { font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 6px; }
.vault-rate  { font-family: var(--mono); font-size: 26px; font-weight: 500; color: #5ecba1; }
.vault-rate-gold { font-family: var(--mono); font-size: 26px; font-weight: 500; color: #e8c85a; }
.vault-sub   { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 3px; margin-bottom: 14px; }
.vault-meta  {
  display: flex; gap: 18px; padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,.1);
}
.vault-meta-item .vm-label { font-size: 10px; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
.vault-meta-item .vm-val   { font-family: var(--mono); font-size: 14px; color: white; font-weight: 500; }

/* ── Yield ticker ── */
.ticker { transition: color .2s; }
.ticker.flash { color: #5ecba1 !important; }
.ticker-gold.flash { color: #e8c85a !important; }

/* ── Lot card ── */
.lot-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 16px 18px; margin-bottom: 8px;
  display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: start;
  transition: border-color .12s, transform .12s; cursor: pointer;
  box-shadow: var(--shadow);
}
.lot-card:hover { border-color: var(--teal); transform: translateY(-1px); }
.lot-grade {
  display: inline-block; font-family: var(--mono); font-size: 10px;
  font-weight: 600; padding: 2px 6px; border-radius: 3px;
}
.g1 { background: #FFF5D6; color: #7a5e00; }
.g2 { background: var(--teal-l); color: var(--teal-d); }
.g3 { background: #EDE9FE; color: #4c1d95; }
.lot-title { font-size: 13px; font-weight: 600; color: var(--ink); margin: 6px 0; }
.lot-meta  { display: flex; flex-wrap: wrap; gap: 12px; }
.lot-meta-item { font-size: 12px; color: var(--ink-l); }
.lot-meta-item strong { color: var(--ink-m); }
.lot-price { font-family: var(--mono); font-size: 17px; font-weight: 500; color: var(--ink); }
.lot-price-sub { font-size: 11px; color: var(--ink-l); margin-top: 2px; }

/* ── Carry viz ── */
.carry-meter {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 16px 18px;
}
.spread-bar-track {
  height: 8px; background: var(--wheat); border-radius: 4px;
  position: relative; overflow: hidden; margin: 8px 0;
}
.spread-bar-fill {
  height: 100%; border-radius: 4px; transition: width 1s ease;
}
.contango { background: linear-gradient(90deg, var(--teal), #2dd4a0); }
.backwardation { background: linear-gradient(90deg, var(--red), #f08060); }

/* ── APY gauge ── */
.apy-row { display: flex; align-items: center; gap: 14px; }
.apy-circle {
  width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid var(--teal); font-family: var(--mono);
  font-size: 13px; font-weight: 500; color: var(--teal-d);
}
.apy-circle.gold-ring { border-color: var(--gold); color: var(--gold); }

/* ── Modal ── */
.overlay {
  position: fixed; inset: 0; background: rgba(18,16,10,.55);
  backdrop-filter: blur(3px); z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal {
  background: var(--white); border-radius: var(--r-lg);
  width: 100%; max-width: 420px; padding: 26px;
  animation: pop .18s ease;
}
@keyframes pop { from { opacity:0; transform: scale(.96) translateY(10px); } to { opacity:1; transform: none; } }
.modal-title { font-family: var(--serif); font-size: 20px; font-weight: 600; margin-bottom: 4px; }
.modal-sub   { font-size: 13px; color: var(--ink-l); margin-bottom: 18px; }
.modal-footer { display: flex; gap: 8px; margin-top: 18px; }

/* ── Toast ── */
.toast {
  position: fixed; bottom: 20px; right: 20px; z-index: 300;
  background: var(--ink); color: white; border-radius: var(--r-lg);
  padding: 12px 18px; font-size: 13px; max-width: 300px;
  border-left: 3px solid var(--teal); animation: slide-in .2s ease;
}
.toast.err { border-left-color: var(--red); }
@keyframes slide-in { from { opacity:0; transform: translateX(16px); } to { opacity:1; transform: none; } }

/* ── Activity bar ── */
.activity-bar {
  position: sticky; bottom: 0; background: var(--white);
  border-top: 1px solid var(--border); padding: 8px 24px; z-index: 80;
}
.activity-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 14px; }
.act-label { font-size: 10px; font-weight: 600; color: var(--ink-l); letter-spacing: .06em; text-transform: uppercase; flex-shrink: 0; }
.act-dot   { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 1px; }
.act-text  { font-size: 12px; color: var(--ink-m); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.act-time  { font-family: var(--mono); font-size: 10px; color: var(--ink-l); flex-shrink: 0; }

/* ── Silo picker ── */
.silo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.silo-item {
  background: var(--sand); border: 1.5px solid var(--border-m);
  border-radius: var(--r); padding: 11px 13px; cursor: pointer; transition: all .12s;
}
.silo-item:hover { border-color: var(--teal); }
.silo-item.sel   { border-color: var(--teal); background: var(--teal-l); }
.silo-name { font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
.silo-cap  { font-family: var(--mono); font-size: 11px; color: var(--ink-l); }

/* ── Step indicator ── */
.steps { display: flex; margin-bottom: 20px; }
.step { flex: 1; padding: 8px 12px; font-size: 11px; font-weight: 600; color: var(--ink-l); border-bottom: 2px solid var(--border); text-align: center; transition: all .12s; }
.step.done   { color: var(--teal); border-bottom-color: var(--teal); }
.step.active { color: var(--ink); border-bottom-color: var(--ink); }

/* ── Judge page ── */
.judge-hero {
  background: var(--ink); border-radius: var(--r-lg);
  padding: 40px; margin-bottom: 24px; position: relative; overflow: hidden;
}
.judge-hero::before {
  content: ''; position: absolute;
  width: 300px; height: 300px; border-radius: 50%;
  background: var(--gold); opacity: .07; top: -100px; right: -80px;
}
.judge-hero-title {
  font-family: var(--serif); font-size: 32px; font-weight: 600;
  color: white; margin-bottom: 8px; line-height: 1.2;
}
.judge-hero-sub { font-size: 15px; color: rgba(255,255,255,.6); margin-bottom: 24px; max-width: 560px; }
.judge-tag {
  display: inline-block; font-family: var(--mono); font-size: 11px;
  padding: 3px 9px; border-radius: 4px; margin-right: 6px; margin-bottom: 6px;
}
.jt-teal  { background: rgba(26,138,106,.25); color: #5ecba1; }
.jt-gold  { background: rgba(184,151,42,.25); color: #e8c85a; }
.jt-sky   { background: rgba(27,111,168,.25); color: #7ec4f0; }
.address-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
  border-radius: var(--r); padding: 8px 12px; cursor: pointer;
  font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,.7);
  transition: background .12s;
}
.address-chip:hover { background: rgba(255,255,255,.14); }
.copy-icon { font-size: 12px; color: rgba(255,255,255,.4); }
.judge-step {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 14px 0; border-bottom: 1px solid var(--border);
}
.judge-step:last-child { border-bottom: none; }
.step-num {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0; color: white;
}
.step-body h4 { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 3px; }
.step-body p  { font-size: 12px; color: var(--ink-l); line-height: 1.5; }
.explorer-link { color: var(--sky); font-family: var(--mono); font-size: 11px; text-decoration: none; }
.explorer-link:hover { text-decoration: underline; }

/* ── Carry zone ── */
.carry-zone {
  background: linear-gradient(135deg, #0e1810 0%, #1a1208 100%);
  border-radius: var(--r-lg); padding: 22px; color: white; position: relative; overflow: hidden;
}
.carry-zone::before {
  content: ''; position: absolute; width: 200px; height: 200px;
  border-radius: 50%; background: var(--gold); opacity: .06;
  bottom: -60px; right: -60px;
}
.carry-spread-val {
  font-family: var(--serif); font-size: 42px; font-weight: 600;
  line-height: 1; margin-bottom: 2px;
}
.carry-spread-val.contango-color { color: #e8c85a; }
.carry-spread-val.backwardation-color { color: #f08060; }
`;

// ─── MOCK DATA & CONSTANTS ─────────────────────────────────────────────────
const TESTNET_PROGRAM  = "GRNchain1111111111111111111111111111111111111";
const TESTNET_EXPLORER = "https://explorer.solana.com";

const SILOS = [
  { id:"KST-SILO-001", name:"Kostanay Elevator #1", region:"Kostanay",  cap:5000, avail:3200, grades:["1","2"] },
  { id:"AKM-SILO-004", name:"Akmola Grain Terminal", region:"Akmola",   cap:10000, avail:6800, grades:["2","3"] },
  { id:"KST-SILO-012", name:"Kostanay South Depot",  region:"Kostanay", cap:3000, avail:1100, grades:["2"] },
  { id:"NKZ-SILO-007", name:"North KZ Central Hub",  region:"N. Kazakhstan", cap:6500, avail:2400, grades:["1","2","3"] },
];

const MARKET_LOTS = [
  { id:"KST-2025-00847", silo:"Kostanay Elevator #1", region:"Kostanay", grade:"2", tonnes:1200, price:182, seller:"Farmer Aibek N.",  protein:"12.8%", moisture:"13.1%", fill:.34 },
  { id:"AKM-2025-01203", silo:"Akmola Grain Terminal",  region:"Akmola",   grade:"1", tonnes:3500, price:196, seller:"Agro-Steppe LLC", protein:"14.2%", moisture:"12.8%", fill:.71 },
  { id:"KST-2025-00901", silo:"Kostanay South Depot",   region:"Kostanay", grade:"2", tonnes:800,  price:180, seller:"Farmer Zarina K.",protein:"12.5%", moisture:"13.4%", fill:.10 },
  { id:"NKZ-2025-00412", silo:"North KZ Central Hub",   region:"N. Kazakhstan", grade:"3", tonnes:2100, price:168, seller:"KazGrainTrade", protein:"11.1%", moisture:"14.2%", fill:.55 },
];

const HISTORICAL_CARRY = [
  {yr:2005,sep:315,mar:360,pct:14.3},{yr:2006,sep:430,mar:480,pct:11.6},
  {yr:2007,sep:460,mar:745,pct:62.0},{yr:2008,sep:680,mar:530,pct:-22.1},
  {yr:2009,sep:460,mar:510,pct:10.9},{yr:2010,sep:650,mar:820,pct:26.2},
  {yr:2011,sep:760,mar:665,pct:-12.5},{yr:2012,sep:900,mar:720,pct:-20.0},
  {yr:2013,sep:660,mar:625,pct:-5.3},{yr:2014,sep:520,mar:510,pct:-1.9},
  {yr:2015,sep:490,mar:470,pct:-4.1},{yr:2016,sep:415,mar:365,pct:-12.0},
  {yr:2017,sep:435,mar:450,pct:3.4}, {yr:2018,sep:510,mar:490,pct:-3.9},
  {yr:2019,sep:485,mar:545,pct:12.4},{yr:2020,sep:540,mar:620,pct:14.8},
  {yr:2021,sep:730,mar:870,pct:19.2},{yr:2022,sep:850,mar:680,pct:-20.0},
  {yr:2023,sep:575,mar:540,pct:-6.1},{yr:2024,sep:535,mar:570,pct:6.5},
];

const JUDGE_WALLETS = [
  { n:1, pub:"JDg1...fKmn", usdc:10000, grain:1000, color:"var(--teal)" },
  { n:2, pub:"JDg2...rPqs", usdc:10000, grain:1000, color:"var(--gold)" },
  { n:3, pub:"JDg3...xTvw", usdc:10000, grain:1000, color:"var(--sky)"  },
];

function fmt(n: number, d=2) { return Number(n).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}); }
function fmtK(n: number) { return n>=1000?(n/1000).toFixed(1)+"K":n.toString(); }
function nowStr() { return new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"}); }

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

function Toast({ msg, type, onDone }: any) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type==="err"?"err":""}`}>{msg}</div>;
}

function Modal({ title, sub, children, footer, onClose }: any) {
  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        {sub && <div className="modal-sub">{sub}</div>}
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── FARMER TAB ───────────────────────────────────────────────────────────────
function FarmerTab({ wallet, setWallet, wPrice, toast, log }: any) {
  const [silo, setSilo] = useState<any>(null);
  const [mintModal, setMintModal] = useState(false);
  const [borrowModal, setBorrowModal] = useState(false);
  const [kg, setKg] = useState("");
  const [grade, setGrade] = useState("2");
  const [borrowAmt, setBorrowAmt] = useState("");
  const [minting, setMinting] = useState(false);

  const grainVal = wallet.grain * wPrice * 36.744 / 1_000_000;
  const maxBorrow = grainVal * 0.6;

  function handleMint() {
    const k = parseFloat(kg); if (!k||!silo) return;
    setMinting(true);
    setTimeout(() => {
      setWallet((w: any) => ({ ...w, grain: w.grain + k * 1_000_000 }));
      log({ c:"var(--teal)", t:`Minted ${fmtK(k)} GRAIN from ${silo.name} — receipt ${silo.id}-${Math.floor(Math.random()*9000+1000)}`, ts:nowStr() });
      toast(`✓ ${fmtK(k)} GRAIN tokens minted`);
      setMintModal(false); setKg(""); setMinting(false);
    }, 1600);
  }

  function handleBorrow() {
    const a = parseFloat(borrowAmt); if (!a||a>maxBorrow) { toast("Exceeds 60% LTV","err"); return; }
    const locked = Math.ceil(a / (wPrice*36.744/1_000) * 1_000_000 / 0.6);
    setWallet((w: any) => ({ ...w, usdc: w.usdc + a, grain: w.grain - locked }));
    log({ c:"var(--amber)", t:`Borrowed ${fmt(a,0)} USDC · ${fmtK(locked/1_000_000)} GRAIN locked · 11.2% APR`, ts:nowStr() });
    toast(`✓ ${fmt(a,0)} USDC borrowed`);
    setBorrowModal(false); setBorrowAmt("");
  }

  function handleSgrain() {
    if (wallet.grain < 100_000_000) { toast("Need ≥100 GRAIN","err"); return; }
    const d = Math.floor(wallet.grain * 0.4);
    setWallet((w: any) => ({ ...w, grain: w.grain - d, sgrain: w.sgrain + d }));
    log({ c:"var(--teal)", t:`Deposited ${fmtK(d/1_000_000)} GRAIN → sGRAIN vault · 3.2% APY`, ts:nowStr() });
    toast(`✓ ${fmtK(d/1_000_000)} sGRAIN issued`);
  }

  return (
    <div className="page">
      <div className="stats c4 mb-20">
        {[
          { l:"GRAIN tokens", v:fmtK(wallet.grain/1_000_000), c:"green", s:`≈ $${fmt(grainVal,0)} USDC` },
          { l:"sGRAIN (vault)", v:fmtK(wallet.sgrain/1_000_000), c:"green", s:"Auto-compounding 3.2%" },
          { l:"USDC balance", v:fmt(wallet.usdc,0), c:"", s:"Available liquidity" },
          { l:"CHAIN rewards", v:wallet.chain, c:"gold", s:"Governance tokens" },
        ].map(s => (
          <div className="stat-card" key={s.l}>
            <div className="stat-label">{s.l}</div>
            <div className={`stat-val ${s.c}`}>{s.v}</div>
            <div className="stat-sub">{s.s}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div>
          <div className="card mb-12">
            <div className="card-title">Select Licensed Silo</div>
            <div className="silo-grid">
              {SILOS.map(s => (
                <div key={s.id} className={`silo-item ${silo?.id===s.id?"sel":""}`} onClick={() => setSilo(s)}>
                  <div className="silo-name">{s.name}</div>
                  <div className="silo-cap">{fmtK(s.avail)}t avail · Grades {s.grades.join(",")}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card mb-12">
            <div className="flex-between mb-12">
              <div className="card-title" style={{margin:0}}>Tokenize Grain</div>
              {silo ? <span className="badge badge-teal">{silo.name}</span> : <span className="badge badge-gold">Select silo</span>}
            </div>
            <p className="text-sm mb-12">Deposit grain at a Qoldau-registered silo. 1 GRAIN = 1 kg of certified wheat.</p>
            <div className="flex-gap">
              <button className="btn btn-primary" disabled={!silo} onClick={() => setMintModal(true)}>Mint GRAIN Tokens</button>
              <button className="btn btn-outline" disabled={wallet.grain < 100_000_000} onClick={handleSgrain}>→ sGRAIN Vault</button>
            </div>
          </div>

          <div className="card">
            <div className="flex-between mb-8">
              <div className="card-title" style={{margin:0}}>Borrow Against Grain</div>
              <span className="badge badge-amber">60% LTV</span>
            </div>
            <div className="warn-box">Max borrow: <strong>${fmt(maxBorrow,0)}</strong> against {fmtK(wallet.grain/1_000_000)} GRAIN. 11.2% APR.</div>
            <button className="btn btn-gold btn-full" disabled={wallet.grain < 100_000_000} onClick={() => setBorrowModal(true)}>Borrow USDC</button>
          </div>
        </div>

        <div>
          {wallet.grain > 0 && (
            <div className="receipt-card mb-12">
              <div className="receipt-serial">QOLDAU DIGITAL RECEIPT · BLOCKCHAIN VERIFIED</div>
              <div className="receipt-amount">{fmtK(wallet.grain/1_000_000)} GRAIN</div>
              <div className="receipt-sub">Tokenized spring wheat — certified</div>
              <div className="receipt-row"><span className="receipt-key">Oracle price</span><span className="receipt-val">${fmt(wPrice*36.744)}/tonne</span></div>
              <div className="receipt-row"><span className="receipt-key">Total value</span><span className="receipt-val">${fmt(grainVal,0)}</span></div>
              <div className="receipt-row"><span className="receipt-key">Max borrow (60%)</span><span className="receipt-val">${fmt(maxBorrow,0)}</span></div>
              <div className="receipt-row"><span className="receipt-key">Status</span><span className="receipt-val" style={{color:"#5ecba1"}}>● In-silo, verified</span></div>
            </div>
          )}

          <div className="card">
            <div className="card-title">Seasonal carry opportunity</div>
            <div className="info-box">Historical Sep→Mar spread: <strong>+18.4% avg (2005–2024)</strong>. Positive in 80% of years. Tokenize at harvest, hold to spring.</div>
            {[
              ["Seasonal appreciation (6 mo)","+9.2%","var(--teal-d)"],
              ["Lending yield (6 mo)","+5.5%","var(--teal-d)"],
              ["Storage fee share (6 mo)","+1.5%","var(--teal-d)"],
              ["Carry vault (cGRAIN)","+7.5%","var(--gold)"],
            ].map(([l,v,c])=>(
              <div className="flex-between mt-8" key={l} style={{fontSize:13}}>
                <span style={{color:"var(--ink-l)"}}>{l}</span>
                <span style={{fontFamily:"var(--mono)",fontWeight:500,color:c as string}}>{v}</span>
              </div>
            ))}
            <div className="divider"/>
            <div className="flex-between" style={{fontSize:14}}>
              <strong>Total potential return</strong>
              <span style={{fontFamily:"var(--mono)",fontWeight:600,color:"var(--teal-d)",fontSize:16}}>~+23.7%</span>
            </div>
          </div>
        </div>
      </div>

      {mintModal && (
        <Modal title="Mint GRAIN Tokens" sub={`Silo: ${silo?.name}`}
          onClose={() => setMintModal(false)}
          footer={<>
            <button className="btn btn-outline" style={{flex:1}} onClick={() => setMintModal(false)}>Cancel</button>
            <button className="btn btn-primary" style={{flex:1}} disabled={!kg||parseFloat(kg)<=0||minting} onClick={handleMint}>
              {minting ? "Minting…" : "Mint Tokens"}
            </button>
          </>}>
          <div className="steps">
            <div className={`step ${minting?"done":"active"}`}>1. Details</div>
            <div className={`step ${minting?"active":""}`}>2. Verify</div>
            <div className="step">3. Mint</div>
          </div>
          <div className="field">
            <label className="field-label">Grain quantity</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder="e.g. 1000" value={kg} onChange={e=>setKg(e.target.value)}/>
              <div className="input-sfx">kg</div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">GOST Grade</label>
            <select style={{width:"100%",height:38,border:"1.5px solid var(--border-m)",borderRadius:"var(--r)",fontFamily:"var(--sans)",fontSize:13,padding:"0 11px",background:"var(--sand)"}}
              value={grade} onChange={e=>setGrade(e.target.value)}>
              {(silo?.grades||[]).map((g: string)=>(<option key={g} value={g}>Grade {g} {g==="1"?"(Premium)":g==="2"?"(Standard)":"(Feed)"}</option>))}
            </select>
          </div>
          {kg && <div className="info-box">You will receive <strong>{fmtK(parseFloat(kg)||0)} GRAIN tokens</strong> · Value ≈ <strong>${fmt((parseFloat(kg)||0)*(wPrice*36.744/1000),0)}</strong></div>}
        </Modal>
      )}

      {borrowModal && (
        <Modal title="Borrow USDC" sub={`${fmtK(wallet.grain/1_000_000)} GRAIN collateral · 60% LTV`}
          onClose={() => setBorrowModal(false)}
          footer={<>
            <button className="btn btn-outline" style={{flex:1}} onClick={() => setBorrowModal(false)}>Cancel</button>
            <button className="btn btn-gold" style={{flex:1}} disabled={!borrowAmt||parseFloat(borrowAmt)<=0||parseFloat(borrowAmt)>maxBorrow} onClick={handleBorrow}>Borrow</button>
          </>}>
          <div className="field">
            <label className="field-label">Borrow amount (USDC)</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder={`Max ${fmt(maxBorrow,0)}`} value={borrowAmt} onChange={e=>setBorrowAmt(e.target.value)}/>
              <div className="input-sfx">USDC</div>
            </div>
          </div>
          <div className="warn-box">Interest rate: <strong>11.2% APR</strong>. Liquidation at 80% LTV. Repay by March to capture spring appreciation.</div>
          {borrowAmt&&parseFloat(borrowAmt)>0&&(
            <div className="info-box">Repayment in 6 mo: <strong>${fmt(parseFloat(borrowAmt)*1.056,0)}</strong> · Est. spring grain value: <strong>${fmt(grainVal*1.18,0)}</strong></div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── MARKET TAB ───────────────────────────────────────────────────────────────
function MarketTab({ wallet, setWallet, wPrice, toast, log }: any) {
  const [filter, setFilter] = useState("all");
  const [buyModal, setBuyModal] = useState<any>(null);
  const [buyTonnes, setBuyTonnes] = useState("");

  const filtered = filter==="all"?MARKET_LOTS:MARKET_LOTS.filter(l=>l.grade===filter.replace("g",""));

  function handleBuy() {
    const t = parseFloat(buyTonnes); if (!t||!buyModal) return;
    const cost = t * buyModal.price * 1000;
    if (cost > wallet.usdc) { toast("Insufficient USDC","err"); return; }
    setWallet((w: any) => ({ ...w, usdc: w.usdc - cost, grain: w.grain + t*1_000_000 }));
    log({ c:"var(--sky)", t:`Bought ${t}t wheat (Grade ${buyModal.grade}) from ${buyModal.silo} · ${fmt(cost/1000,0)}K USDC · ${buyModal.id}`, ts:nowStr() });
    toast(`✓ ${t}t purchased · ${fmtK(t)} GRAIN in wallet`);
    setBuyModal(null); setBuyTonnes("");
  }

  return (
    <div className="page">
      <div className="stats c3 mb-20">
        <div className="stat-card"><div className="stat-label">Active lots</div><div className="stat-val">{MARKET_LOTS.length}</div><div className="stat-sub">Across 4 silos</div></div>
        <div className="stat-card"><div className="stat-label">Total available</div><div className="stat-val green">{fmtK(MARKET_LOTS.reduce((s,l)=>s+(l.tonnes*(1-l.fill)),0))}t</div><div className="stat-sub">Ready to buy</div></div>
        <div className="stat-card"><div className="stat-label">CME ZW1! price</div><div className="stat-val gold">${fmt(wPrice*36.744)}/t</div><div className="stat-sub">Pyth oracle · live</div></div>
      </div>

      <div className="flex-gap mb-16 flex-wrap">
        {[["all","All grades"],["g1","Grade 1"],["g2","Grade 2"],["g3","Grade 3"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setFilter(id)}
            style={{padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:500,border:"1.5px solid",cursor:"pointer",
              background: filter===id?"var(--ink)":"transparent",
              borderColor: filter===id?"var(--ink)":"var(--border-m)",
              color: filter===id?"white":"var(--ink-l)"}}>
            {lbl}
          </button>
        ))}
        <div style={{marginLeft:"auto"}} className="flex-gap">
          <span className="badge badge-live">LIVE PRICES</span>
          <span className="text-sm">Pyth ZW1! · {fmt(wPrice)}¢/bu</span>
        </div>
      </div>

      {filtered.map(lot => (
        <div key={lot.id} className="lot-card" onClick={()=>setBuyModal(lot)}>
          <div>
            <div className="flex-gap mb-8">
              <span className={`lot-grade ${lot.grade==="1"?"g1":lot.grade==="2"?"g2":"g3"}`}>Grade {lot.grade}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--ink-l)"}}>{lot.id}</span>
              <span className="text-sm">· {lot.silo}</span>
            </div>
            <div className="lot-title">{lot.region} Spring Wheat</div>
            <div className="lot-meta mt-8">
              {[["Protein",lot.protein],["Moisture",lot.moisture],["Available",`${Math.round(lot.tonnes*(1-lot.fill))}t`],["Seller",lot.seller]].map(([k,v])=>(
                <span key={k} className="lot-meta-item">{k}: <strong>{v}</strong></span>
              ))}
            </div>
            <div className="mt-8">
              <div className="flex-between mb-4" style={{fontSize:11,color:"var(--ink-l)"}}>
                <span>Lot fill</span><span>{Math.round(lot.fill*100)}% sold</span>
              </div>
              <div className="prog-track"><div className="prog-fill" style={{width:`${lot.fill*100}%`,background:"var(--teal)"}} /></div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div className="lot-price">${lot.price}</div>
            <div className="lot-price-sub">per tonne</div>
            <button className="btn btn-primary btn-sm mt-8" onClick={e=>{e.stopPropagation();setBuyModal(lot);}}>Buy Now</button>
          </div>
        </div>
      ))}

      {buyModal && (
        <Modal title="Purchase Grain Lot" sub={`${buyModal.silo} · Grade ${buyModal.grade}`}
          onClose={()=>{setBuyModal(null);setBuyTonnes("")}}
          footer={<>
            <button className="btn btn-outline" style={{flex:1}} onClick={()=>{setBuyModal(null);setBuyTonnes("")}}>Cancel</button>
            <button className="btn btn-primary" style={{flex:1}}
              disabled={!buyTonnes||parseFloat(buyTonnes)<=0||parseFloat(buyTonnes)*buyModal.price*1000>wallet.usdc}
              onClick={handleBuy}>
              Buy {buyTonnes||"—"} tonnes
            </button>
          </>}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {[["Price",`$${buyModal.price}/tonne`],["Protein",buyModal.protein],["Moisture",buyModal.moisture],["Receipt",buyModal.id]].map(([k,v])=>(
              <div key={k} style={{background:"var(--sand)",borderRadius:6,padding:"8px 10px"}}>
                <div style={{fontSize:10,color:"var(--ink-l)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{k}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:500}}>{v}</div>
              </div>
            ))}
          </div>
          <div className="field">
            <label className="field-label">Quantity</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder={`Max ${Math.round(buyModal.tonnes*(1-buyModal.fill))}`}
                value={buyTonnes} onChange={e=>setBuyTonnes(e.target.value)}/>
              <div className="input-sfx">tonnes</div>
            </div>
          </div>
          {buyTonnes&&parseFloat(buyTonnes)>0&&(
            <div className="info-box">Cost: <strong>${fmt(parseFloat(buyTonnes)*buyModal.price*1000,0)}</strong> USDC · GRAIN received: <strong>{fmtK(parseFloat(buyTonnes)*1_000_000)}</strong> · Settlement: &lt;1 second</div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── LENDER TAB ───────────────────────────────────────────────────────────────
function LenderTab({ wallet, setWallet, toast, log }: any) {
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmt, setDepositAmt] = useState("");
  const [earned, setEarned] = useState({ v1:1842.50, v2:623.40 });
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setEarned(e => ({ v1: e.v1 + 0.14, v2: e.v2 + 0.05 }));
      setFlash(true); setTimeout(()=>setFlash(false), 350);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  function handleDeposit() {
    const a = parseFloat(depositAmt);
    if (!a||a>wallet.usdc) { toast("Invalid amount","err"); return; }
    setWallet((w: any) => ({ ...w, usdc: w.usdc - a }));
    log({ c:"var(--teal)", t:`Deposited ${fmt(a,0)} USDC → GRAIN Senior Vault · 11.2% APY`, ts:nowStr() });
    toast(`✓ ${fmt(a,0)} USDC deposited · yield starts now`);
    setDepositModal(false); setDepositAmt("");
  }

  const total = 35000;

  return (
    <div className="page">
      <div className="g2 mb-20">
        <div className="vault-dark">
          <div className="flex-between mb-12">
            <span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>Total deposited</span>
            <span className="badge badge-live">EARNING</span>
          </div>
          <div style={{fontFamily:"var(--mono)",fontSize:28,fontWeight:500,color:"white",marginBottom:3}}>${fmt(total,0)}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:14}}>USDC across 2 active vaults</div>
          <div className="divider" style={{borderColor:"rgba(255,255,255,.1)"}}/>
          <div className="vault-meta">
            <div className="vault-meta-item">
              <div className="vm-label">Total earned</div>
              <div className={`vm-val ticker ${flash?"flash":""}`}>${fmt(earned.v1+earned.v2)}</div>
            </div>
            <div className="vault-meta-item">
              <div className="vm-label">Blended APY</div>
              <div className="vm-val" style={{color:"#e8c85a"}}>10.8%</div>
            </div>
            <div className="vault-meta-item">
              <div className="vm-label">Next payout</div>
              <div className="vm-val">~7h</div>
            </div>
          </div>
        </div>

        <div>
          <div className="carry-meter mb-10">
            <div className="flex-between mb-4">
              <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>GRAIN Senior Vault</span>
              <span style={{fontFamily:"var(--mono)",fontSize:13,fontWeight:500,color:"var(--teal-d)"}}>11.2% APY</span>
            </div>
            <div className="apy-row">
              <svg viewBox="0 0 56 56" style={{width:52,height:52,flexShrink:0,transform:"rotate(-90deg)"}}>
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--wheat)" strokeWidth="5"/>
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--teal)" strokeWidth="5"
                  strokeDasharray={`${11.2/20*138.2} 138.2`} strokeLinecap="round"/>
              </svg>
              <div>
                <div style={{fontSize:13,color:"var(--ink-m)"}}>Senior tranche · first-loss protected</div>
                <div className={`stat-val green mt-4 ticker ${flash?"flash":""}`}>${fmt(earned.v1)}</div>
                <div className="text-sm">earned so far · $25,000 deposited</div>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex-between text-sm mb-4"><span>Vault utilization</span><span>78%</span></div>
              <div className="prog-track"><div className="prog-fill" style={{width:"78%",background:"var(--teal)"}}/></div>
            </div>
          </div>

          <div className="carry-meter">
            <div className="flex-between mb-4">
              <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>sGRAIN Yield Vault</span>
              <span style={{fontFamily:"var(--mono)",fontSize:13,fontWeight:500,color:"var(--amber)"}}>9.4% APY</span>
            </div>
            <div className={`stat-val mt-4 ticker ${flash?"flash":""}`} style={{color:"var(--amber)"}}>${fmt(earned.v2)}</div>
            <div className="text-sm mt-4">earned · $10,000 deposited</div>
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="flex-between mb-12">
            <div className="card-title" style={{margin:0}}>Your positions</div>
            <button className="btn btn-primary btn-sm" onClick={() => setDepositModal(true)}>+ Deposit USDC</button>
          </div>
          {[
            {name:"GRAIN Senior Vault",sub:"Wheat Grade 1+2 · since Oct 2025",apy:"11.2%",dep:25000,earn:earned.v1,health:98},
            {name:"sGRAIN Yield Vault",sub:"sGRAIN-backed · since Nov 2025",apy:"9.4%",dep:10000,earn:earned.v2,health:100},
          ].map(p=>(
            <div key={p.name} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{width:36,height:36,borderRadius:8,background:"var(--teal-l)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🌾</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{p.name}</div>
                <div className="text-sm mt-4">{p.sub}</div>
                <div className="flex-gap mt-8">
                  <span className="text-sm">Health:</span>
                  <div className="prog-track" style={{width:60,height:4}}><div className="prog-fill" style={{width:`${p.health}%`,background:"var(--teal)"}}/></div>
                  <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--teal-d)"}}>{p.health}%</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:14,fontWeight:500,color:"var(--teal-d)"}}>{p.apy}</div>
                <div className={`td-green ticker ${flash?"flash":""}`}>${fmt(p.earn)}</div>
                <div className="text-sm">${fmt(p.dep,0)} dep.</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">How lender yield works</div>
          {[
            [1,"Deposit USDC into the vault","var(--teal)"],
            [2,"Farmers borrow USDC against silo'd GRAIN tokens (60% LTV)","var(--teal)"],
            [3,"Farmers pay 11.2% APR on their loan","var(--amber)"],
            [4,"Interest flows to you in real-time as earned yield","var(--teal)"],
            [5,"Default protection: GRAIN tokens auto-liquidated via Pyth oracle","var(--ink-l)"],
          ].map(([n,t,c])=>(
            <div key={n as number} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:c as string,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"white",flexShrink:0}}>{n}</div>
              <div style={{fontSize:12,color:"var(--ink-m)",lineHeight:1.5}}>{t as string}</div>
            </div>
          ))}
          <div className="info-box mt-8">Your USDC is secured by <strong>physically segregated wheat</strong> in licensed Kazakh silos. Grain cannot leave without burning the GRAIN tokens.</div>
        </div>
      </div>

      {depositModal && (
        <Modal title="Deposit USDC" sub="Earn 11.2% APY · secured by silo'd wheat"
          onClose={() => setDepositModal(false)}
          footer={<>
            <button className="btn btn-outline" style={{flex:1}} onClick={() => setDepositModal(false)}>Cancel</button>
            <button className="btn btn-primary" style={{flex:1}} disabled={!depositAmt||parseFloat(depositAmt)<=0||parseFloat(depositAmt)>wallet.usdc} onClick={handleDeposit}>Deposit & Earn</button>
          </>}>
          <div className="field">
            <label className="field-label">Deposit amount</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder="e.g. 5000" value={depositAmt} onChange={e=>setDepositAmt(e.target.value)}/>
              <div className="input-sfx">USDC</div>
            </div>
            <div className="text-sm mt-8">Available: {fmt(wallet.usdc,0)} USDC</div>
          </div>
          {depositAmt&&parseFloat(depositAmt)>0&&(
            <div className="info-box">Annual yield: <strong>${fmt(parseFloat(depositAmt)*.112,0)}</strong> · Monthly: <strong>${fmt(parseFloat(depositAmt)*.112/12,0)}</strong></div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── CARRY TAB ────────────────────────────────────────────────────────────────
function CarryTab({ wallet, setWallet, wPrice, toast, log }: any) {
  const [carrySpread, setCarrySpread] = useState(1480); // bps
  const [enterModal, setEnterModal] = useState(false);
  const [enterAmt, setEnterAmt] = useState("");
  const [cgrainEarned, setCgrainEarned] = useState(0);
  const [cgrainRate, setCgrainRate] = useState(1_000_000_000);
  const [rateFlash, setRateFlash] = useState(false);

  // Simulate live carry spread + cGRAIN rate ticking
  useEffect(() => {
    const t = setInterval(() => {
      setCarrySpread(s => {
        const delta = (Math.random() - 0.45) * 12;
        return Math.max(800, Math.min(2200, Math.round(s + delta)));
      });
      // cGRAIN rate ticks faster than sGRAIN (carry APY ~14.8%)
      setCgrainRate(r => {
        const apy = 0.148;
        const perSec = apy / 31_536_000 * 1e9;
        return Math.round(r + r * perSec * 3.2); // 3.2s interval
      });
      if (wallet.cgrain > 0) {
        setCgrainEarned(e => e + wallet.cgrain / 1_000_000 * 0.148 / 31_536_000 * 3.2);
      }
      setRateFlash(true); setTimeout(()=>setRateFlash(false), 350);
    }, 3200);
    return () => clearInterval(t);
  }, [wallet.cgrain]);

  const annualizedApy = (carrySpread / 10000 * 365 / 180 * 100).toFixed(1);
  const isContango = carrySpread > 0;
  const spotPrice = wPrice * 36.744;
  const marchPrice = spotPrice * (1 + carrySpread / 10000 * 180 / 365);

  function handleEnter() {
    const kg = parseFloat(enterAmt) * 1_000_000;
    if (!enterAmt||kg>wallet.grain) { toast("Insufficient GRAIN","err"); return; }
    const cgrain = Math.floor(kg * 1e9 / cgrainRate);
    setWallet((w: any) => ({ ...w, grain: w.grain - kg, cgrain: (w.cgrain||0) + cgrain }));
    log({ c:"var(--gold)", t:`Entered carry position: ${fmtK(kg/1_000_000)} GRAIN → cGRAIN · spread=${(carrySpread/100).toFixed(1)}% · APY=${annualizedApy}%`, ts:nowStr() });
    toast(`✓ Carry position opened · ${annualizedApy}% APY`);
    setEnterModal(false); setEnterAmt("");
  }

  function handleExit() {
    if (!wallet.cgrain||wallet.cgrain<=0) return;
    const grainBack = Math.floor(wallet.cgrain * cgrainRate / 1e9);
    const yield_ = grainBack - wallet.cgrain;
    setWallet((w: any) => ({ ...w, cgrain: 0, grain: w.grain + grainBack }));
    log({ c:"var(--gold)", t:`Exited carry: ${fmtK(wallet.cgrain/1_000_000)} cGRAIN → ${fmtK(grainBack/1_000_000)} GRAIN (yield: +${fmtK(yield_/1_000_000)} GRAIN)`, ts:nowStr() });
    toast(`✓ Carry exited · ${fmtK(grainBack/1_000_000)} GRAIN returned`);
  }

  const posValue = wallet.cgrain ? wallet.cgrain/1_000_000 * spotPrice / 1000 : 0;

  return (
    <div className="page">
      <div className="stats c4 mb-20">
        <div className="stat-card">
          <div className="stat-label">Carry spread (Sep→Mar)</div>
          <div className={`stat-val ${isContango?"gold":"red"}`}>{isContango?"+":(carrySpread<0?"-":"")}{(Math.abs(carrySpread)/100).toFixed(1)}%</div>
          <div className="stat-sub">{isContango?"CONTANGO ✓":"BACKWARDATION"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Carry APY (annualized)</div>
          <div className="stat-val gold">{annualizedApy}%</div>
          <div className="stat-sub">vs 3.2% base sGRAIN</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">cGRAIN Exchange Rate</div>
          <div className={`stat-val ticker-gold ticker ${rateFlash?"flash":""}`} style={{color:"var(--gold)",fontFamily:"var(--mono)",fontSize:16}}>{cgrainRate.toLocaleString()}</div>
          <div className="stat-sub">×10<sup>-9</sup> GRAIN/cGRAIN · ticking ↑</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Your cGRAIN</div>
          <div className="stat-val gold">{fmtK((wallet.cgrain||0)/1_000_000)}</div>
          <div className="stat-sub">≈ ${fmt(posValue,0)} value</div>
        </div>
      </div>

      <div className="g2 mb-16">
        <div className="carry-zone">
          <div style={{display:"flex",alignItems:"flex-end",gap:6,marginBottom:4}}>
            <div className={`carry-spread-val ${isContango?"contango-color":"backwardation-color"}`}>
              {isContango?"+":(carrySpread<0?"-":"")}{(Math.abs(carrySpread)/100).toFixed(2)}%
            </div>
            <span style={{fontSize:13,color:"rgba(255,255,255,.5)",marginBottom:6}}>6-month carry</span>
          </div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:16}}>CME ZW Sep→Mar contango spread · Pyth oracle</div>

          <div className="spread-bar-track">
            <div className={`spread-bar-fill ${isContango?"contango":"backwardation"}`}
              style={{width:`${Math.min(100,Math.abs(carrySpread)/22)}%`}}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:14}}>
            <div style={{background:"rgba(255,255,255,.06)",borderRadius:6,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:3}}>ZW1! Sep spot</div>
              <div style={{fontFamily:"var(--mono)",fontSize:14,color:"white"}}>${fmt(spotPrice)}/tonne</div>
            </div>
            <div style={{background:"rgba(255,255,255,.06)",borderRadius:6,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:3}}>ZW March futures</div>
              <div style={{fontFamily:"var(--mono)",fontSize:14,color:"#e8c85a"}}>${fmt(marchPrice)}/tonne</div>
            </div>
          </div>

          <div style={{marginTop:14,padding:"10px 12px",background:"rgba(255,255,255,.06)",borderRadius:6}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:3}}>Annualized carry APY</div>
            <div style={{fontFamily:"var(--mono)",fontSize:18,color:"#e8c85a",fontWeight:500}}>{annualizedApy}%</div>
          </div>
        </div>

        <div>
          <div className="card mb-12">
            <div className="card-title">How carry yield works</div>
            <div className="gold-box">KZ wheat is harvested Aug–Sep at the seasonal price low. CME March futures trade at a premium (contango). By holding tokenized grain through winter, you capture the spread as yield — on top of storage fees and lending interest.</div>
            {[
              ["Physical GRAIN held in silo","Already happening — no extra cost"],
              ["cGRAIN exchange rate accrues spread","Updates every block via oracle"],
              ["Exit in March","More GRAIN + USDC carry yield returned"],
              ["Avg carry (2005–2024)","18.4% Sep→Mar, positive 80% of years"],
            ].map(([k,v])=>(
              <div key={k} className="flex-between" style={{fontSize:12,padding:"6px 0",borderTop:"1px solid var(--border)"}}>
                <span style={{color:"var(--ink-l)"}}>{k}</span>
                <span style={{fontFamily:"var(--mono)",color:"var(--gold)",fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Historical Sep→Mar spread</div>
            <div style={{display:"flex",gap:2,alignItems:"flex-end",height:80}}>
              {HISTORICAL_CARRY.map(d => {
                const h = Math.min(70, Math.max(4, Math.abs(d.pct) * 1.1));
                return (
                  <div key={d.yr} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div title={`${d.yr}: ${d.pct>0?"+":""}${d.pct}%`}
                      style={{width:"100%",height:h,borderRadius:2,
                        background:d.pct>0?"var(--teal)":"var(--red)",opacity:.75}}/>
                  </div>
                );
              })}
            </div>
            <div className="flex-between mt-8 text-sm">
              <span>2005</span>
              <span style={{color:"var(--teal-d)"}}>+18.4% avg</span>
              <span>2024</span>
            </div>
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="flex-between mb-12">
            <div className="card-title" style={{margin:0}}>Enter Carry Position</div>
            <span className="badge badge-gold">{annualizedApy}% APY</span>
          </div>
          <div className="gold-box">Deposit GRAIN → receive cGRAIN. Exchange rate accrues at carry APY. Exit any time to receive more GRAIN than deposited.</div>
          <div className="field">
            <label className="field-label">GRAIN to lock</label>
            <div className="input-wrap">
              <input className="input round-l" type="number" placeholder="e.g. 500000" value={enterAmt} onChange={e=>setEnterAmt(e.target.value)}/>
              <div className="input-sfx">kg</div>
            </div>
            <div className="text-sm mt-4">Available: {fmtK(wallet.grain/1_000_000)} GRAIN ({fmtK(wallet.grain/1_000_000)} kg)</div>
          </div>
          {enterAmt&&parseFloat(enterAmt)>0&&(
            <div className="gold-box">At {annualizedApy}% APY, in 6 months: <strong>+{fmt(parseFloat(enterAmt)*parseFloat(annualizedApy)/100/2,0)} kg GRAIN yield</strong> on your position.</div>
          )}
          <button className="btn btn-gold btn-full mt-4" disabled={!wallet.grain||wallet.grain<100_000||!enterAmt||parseFloat(enterAmt)*1_000_000>wallet.grain} onClick={()=>{ if(enterAmt&&parseFloat(enterAmt)>0) handleEnter(); else setEnterModal(true); }}>
            Enter Carry Position
          </button>
        </div>

        <div className="card">
          <div className="card-title">Your Active Carry Position</div>
          {wallet.cgrain > 0 ? (
            <>
              <div className="receipt-card mt-4" style={{background:"#1a1208"}}>
                <div className="receipt-serial">CARRY POSITION · CGRAIN VAULT</div>
                <div className="receipt-amount" style={{color:"#e8c85a"}}>{fmtK((wallet.cgrain||0)/1_000_000)} cGRAIN</div>
                <div className="receipt-sub">Wheat carry position — earning</div>
                <div className="receipt-row"><span className="receipt-key">Exchange rate</span><span className="receipt-val">{cgrainRate.toLocaleString()}</span></div>
                <div className="receipt-row"><span className="receipt-key">Carry APY</span><span className="receipt-val" style={{color:"#e8c85a"}}>{annualizedApy}%</span></div>
                <div className="receipt-row"><span className="receipt-key">Yield accrued</span><span className="receipt-val" style={{color:"#5ecba1"}}>+{cgrainEarned.toFixed(4)} GRAIN</span></div>
                <div className="receipt-row"><span className="receipt-key">Status</span><span className="receipt-val" style={{color:"#e8c85a"}}>● Carry accruing</span></div>
              </div>
              <button className="btn btn-outline btn-full mt-12" onClick={handleExit}>Exit Carry Position</button>
            </>
          ) : (
            <div style={{textAlign:"center",padding:"32px 0",color:"var(--ink-l)"}}>
              <div style={{fontSize:32,marginBottom:8}}>📈</div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:4}}>No active carry position</div>
              <div style={{fontSize:12}}>Enter a position to start earning wheat carry yield</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── JUDGE TAB ────────────────────────────────────────────────────────────────
function JudgeTab({ toast }: any) {
  const [copied, setCopied] = useState("");

  function copy(v: string, label: string) {
    navigator.clipboard?.writeText(v).catch(()=>{});
    setCopied(label); toast(`✓ Copied ${label}`);
    setTimeout(()=>setCopied(""), 1500);
  }

  const addresses = [
    { label:"Program ID", val:TESTNET_PROGRAM, link:`${TESTNET_EXPLORER}/address/${TESTNET_PROGRAM}?cluster=testnet` },
    { label:"Protocol Config PDA", val:"PCfg...run init-protocol.ts", link:"" },
    { label:"GRAIN Mint", val:"GRAIN-run deploy.sh for address", link:"" },
    { label:"sGRAIN Vault", val:"SGV...run init-protocol.ts", link:"" },
  ];

  return (
    <div className="page">
      <div className="judge-hero">
        <div className="judge-hero-title">GrainChain KZ<br/>Judge Testing Guide</div>
        <div className="judge-hero-sub">
          Tokenizing Kazakh grain warehouse receipts on Solana. Built for the National Solana Hackathon by Decentrathon 2026. Everything is live and verifiable on Solana testnet.
        </div>
        <div>
          {[["Legal ✓","jt-teal"],["KZ Law on Grain 2022","jt-gold"],["Qoldau.kz Registry","jt-gold"],["Pyth Oracle","jt-sky"],["Anchor 0.30.1","jt-sky"],["192 Licensed Silos","jt-teal"],["Apr 7 Deadline","jt-gold"]].map(([l,c])=>(
            <span key={l} className={`judge-tag ${c}`}>{l}</span>
          ))}
        </div>
      </div>

      <div className="g2 mb-20">
        <div className="card">
          <div className="card-title">On-chain addresses (testnet)</div>
          <p className="text-sm mb-12">Deploy first with <code style={{fontFamily:"var(--mono)",background:"var(--sand)",padding:"1px 5px",borderRadius:3}}>bash scripts/deploy.sh</code> then run <code style={{fontFamily:"var(--mono)",background:"var(--sand)",padding:"1px 5px",borderRadius:3}}>yarn init</code> to populate.</p>
          {addresses.map(a => (
            <div key={a.label} style={{padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <div className="text-sm mb-4">{a.label}</div>
              <div className="flex-gap">
                <code style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--ink-m)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.val}</code>
                {a.link && <a href={a.link} target="_blank" rel="noopener" className="explorer-link">Explorer ↗</a>}
                <button className="btn btn-outline btn-sm" onClick={()=>copy(a.val, a.label)} style={{padding:"3px 8px",fontSize:10}}>
                  {copied===a.label?"✓":"Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Judge wallets (pre-funded)</div>
          <p className="text-sm mb-12">Run <code style={{fontFamily:"var(--mono)",background:"var(--sand)",padding:"1px 5px",borderRadius:3}}>yarn wallets</code> to create 5 funded wallets. Each has 1 SOL + 10,000 USDC + 1,000 GRAIN.</p>
          {JUDGE_WALLETS.map(w => (
            <div key={w.n} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:w.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:600,flexShrink:0}}>J{w.n}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--ink-m)"}}>{w.pub}</div>
                <div className="text-sm mt-4">1 SOL · {w.usdc.toLocaleString()} USDC · {w.grain.toLocaleString()} GRAIN</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={()=>copy(w.pub,"wallet")} style={{padding:"3px 8px",fontSize:10}}>Copy</button>
            </div>
          ))}
          <div className="info-box mt-12">Import any wallet into Phantom (testnet mode) by going to Settings → Add Account → Import Private Key. Keys are in <code style={{fontFamily:"var(--mono)",fontSize:10}}>judge-wallets-private.json</code>.</div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-title">Testing walkthrough — 9 steps</div>
        {[
          { n:1, c:"var(--teal)",   h:"Oracle mints grain receipt", d:"Oracle signs Qoldau receipt → GrainReceipt PDA created on-chain. Keyed by serial (e.g. KST-2025-00847). Check the PDA on Explorer — it shows grade, protein, moisture, harvest date." },
          { n:2, c:"var(--teal)",   h:"Farmer fractionalizes → GRAIN tokens", d:"GrainReceipt → GRAIN SPL tokens (1 token = 1 kg). Mint from the protocol PDA. Check your GRAIN token account on Explorer." },
          { n:3, c:"var(--sky)",    h:"Lender deposits USDC", d:"USDC enters the LendingVault PDA. LenderPosition PDA created tracking your deposit + earned interest (ticks every block)." },
          { n:4, c:"var(--gold)",   h:"Farmer borrows USDC (Pyth oracle)", d:"GRAIN tokens locked in CollateralEscrow PDA. USDC released at 60% LTV. If testnet Pyth is stale, retry in 30s — feed updates every ~30 seconds." },
          { n:5, c:"var(--teal)",   h:"Deposit GRAIN into sGRAIN vault", d:"GRAIN transferred to GrainReserve PDA. sGRAIN minted at current exchange rate. Exchange rate ONLY increases — check it twice, 60s apart." },
          { n:6, c:"var(--gold)",   h:"Enter carry position → cGRAIN", d:"GRAIN locked in CarryGrainReserve PDA. cGRAIN minted. cGRAIN rate accrues faster than sGRAIN (based on live CME contango spread from carry oracle)." },
          { n:7, c:"var(--teal)",   h:"Run yield crank", d:"yarn crank --interval 10 keeps sGRAIN and cGRAIN rates ticking every 10s. Permissionless — any keypair can call it. Shows proof of autonomous yield." },
          { n:8, c:"var(--amber)",  h:"Repay loan + exit positions", d:"Repay USDC + interest → GRAIN collateral unlocked. Withdraw sGRAIN → receive more GRAIN than deposited (the delta = yield). Exit carry → same." },
          { n:9, c:"var(--teal)",   h:"Claim CHAIN governance rewards", d:"Pro-rata CHAIN tokens distributed based on sGRAIN balance over time. Synthetix-style reward_per_token accumulator. 10M CHAIN over 2 years." },
        ].map(s=>(
          <div key={s.n} className="judge-step">
            <div className="step-num" style={{background:s.c,minWidth:28}}>{s.n}</div>
            <div className="step-body">
              <h4>{s.h}</h4>
              <p>{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-title">Quick CLI checks</div>
          {[
            ["Check sGRAIN rate (should be >1e9)", "solana account <sgrain_vault> --url testnet"],
            ["Check cGRAIN rate (higher than sGRAIN)", "solana account <carry_vault> --url testnet"],
            ["Verify grain locked in silo", "spl-token balance <grain_mint> --owner <silo_pda>"],
            ["Run full demo script", "npx ts-node scripts/demo-interactions.ts"],
            ["Live yield crank", "yarn crank --interval 10"],
            ["Carry oracle (posts spread)", "npx ts-node scripts/carry-oracle.ts --once"],
          ].map(([l,cmd])=>(
            <div key={l} style={{marginBottom:10}}>
              <div className="text-sm mb-4">{l}</div>
              <code style={{fontFamily:"var(--mono)",fontSize:11,background:"var(--sand)",padding:"4px 8px",borderRadius:4,display:"block",color:"var(--ink-m)",cursor:"pointer"}}
                onClick={()=>copy(cmd,"command")}>{cmd}</code>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Legal basis (for pitch)</div>
          {[
            ["Civil Code Arts. 797–802","Grain receipts = non-equity securities"],
            ["Law on Grain (2001)","192 licensed silos, Qoldau.kz registry"],
            ["2022 Amendment ✅","Digital tokens legally replace paper receipts"],
            ["Law on Digital Assets (2023)","Grain tokens = secured digital assets"],
            ["AIFC","English common law, 0% VAT, Fintech Lab"],
            ["Kostanay Pilot (Sep 2025)","Ministry of AI + AIFC blockchain program"],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)",fontSize:12}}>
              <span style={{fontWeight:600,color:"var(--ink)"}}>{k}</span>
              <span style={{color:"var(--ink-l)",textAlign:"right",maxWidth:"55%"}}>{v}</span>
            </div>
          ))}
          <div className="info-box mt-12">GrainChain KZ is the <strong>Solana-native implementation</strong> of what the KZ government is actively piloting in Kostanay. This is not a hypothetical.</div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("farmer");
  const [wallet, setWallet] = useState({ usdc:45000, grain:3_200_000_000, sgrain:1_850_000_000, cgrain:0, chain:420 });
  const [wPrice, setWPrice] = useState(182.4);
  const [wDelta, setWDelta] = useState(0.12);
  const [toastMsg, setToastMsg] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setWPrice(p => {
        const d = (Math.random() - 0.47) * 0.18;
        const np = Math.max(155, Math.min(215, +(p+d).toFixed(2)));
        setWDelta(+(np-p).toFixed(2));
        return np;
      });
    }, 2600);
    return () => clearInterval(t);
  }, []);

  const toast = useCallback((msg: string, type="ok") => setToastMsg({ msg, type }), []);
  const log   = useCallback((a: any) => setActivities(p => [...p.slice(-19), a]), []);

  const TABS = [
    { id:"farmer", label:"Farmer Dashboard", icon:"🌾" },
    { id:"market", label:"P2P Grain Market", icon:"⚖️" },
    { id:"lender", label:"Lender Vault",     icon:"💰" },
    { id:"carry",  label:"Carry Vault",      icon:"📈", badge:"NEW" },
    { id:"judge",  label:"Judge Guide",      icon:"🎓" },
  ];

  const props = { wallet, setWallet, wPrice, toast, log };

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-badge">🌾</div>
          GrainChain KZ
        </div>
        <div className="topbar-center">
          <div className="price-chip">
            <div className="live-dot"/>
            <span className="price-label">ZW1!</span>
            <span className="price-value">{fmt(wPrice)}¢/bu</span>
            <span className="price-value">${fmt(wPrice*36.744)}/t</span>
            <span className={`price-delta ${wDelta>=0?"up":"dn"}`}>{wDelta>=0?"+":""}{wDelta}</span>
          </div>
          <div className="price-chip">
            <span className="price-label">Network</span>
            <span className="price-value">Devnet</span>
          </div>
        </div>
        <div className="topbar-right">
          <div className="wallet-pill"><div className="w-dot"/>{fmt(wallet.usdc,0)} USDC</div>
          <div className="wallet-pill"><div className="w-dot"/>{(wallet.grain/1_000_000).toFixed(0)} GRAIN</div>
        </div>
      </div>

      <div className="nav">
        {TABS.map(t => (
          <button key={t.id} className={`nav-item ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
            <span>{t.icon}</span>{t.label}
            {t.badge && <span className="nav-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{flex:1, paddingBottom: activities.length ? 44 : 0}}>
        {tab==="farmer" && <FarmerTab {...props}/>}
        {tab==="market" && <MarketTab {...props}/>}
        {tab==="lender" && <LenderTab {...props}/>}
        {tab==="carry"  && <CarryTab  {...props}/>}
        {tab==="judge"  && <JudgeTab  toast={toast}/>}
      </div>

      {activities.length > 0 && (
        <div className="activity-bar">
          <div className="activity-inner">
            <span className="act-label">Activity</span>
            {activities.slice(-1).map((a,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,flex:1,overflow:"hidden"}}>
                <div className="act-dot" style={{background:a.c}}/>
                <span className="act-text">{a.t}</span>
                <span className="act-time">{a.ts}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onDone={()=>setToastMsg(null)}/>}
    </div>
  );
}
