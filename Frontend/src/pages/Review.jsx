import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DECISIONS = [
  { value: "approve",       label: "Approve",       color: "#22c55e", icon: "✓" },
  { value: "minor_changes", label: "Minor Changes",  color: "#f59e0b", icon: "~" },
  { value: "major_changes", label: "Major Changes",  color: "#f97316", icon: "!" },
  { value: "reject",        label: "Reject",         color: "#ef4444", icon: "✕" },
];

const CONFIDENCE_LABELS = ["", "Uncertain", "Low", "Moderate", "High", "Very Confident"];

const TICKER = [
  { label: "SYSTEM STATUS",   val: "NOMINAL" },
  { label: "REVIEWS ONLINE",  val: "LIVE" },
  { label: "CONFLICT RATE",   val: "2.7%" },
  { label: "AVG TRUST SCORE", val: "84.2%" },
  { label: "ACTIVE NODES",    val: "12" },
  { label: "ANONYMOUS MODE",  val: "ENABLED" },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rv-root {
    min-height: 100vh;
    background: #05070f;
    font-family: 'DM Mono', monospace;
    color: #e2e8f0;
    position: relative;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Grid background */
  .rv-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none; z-index: 0;
  }

  /* Ambient orbs */
  .rv-orb {
    position: fixed; border-radius: 50%;
    filter: blur(90px); pointer-events: none; z-index: 0;
    animation: floatOrb 14s ease-in-out infinite;
  }
  .rv-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(99,102,241,0.09), transparent 70%);
    top: -150px; left: -120px;
  }
  .rv-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(56,189,248,0.06), transparent 70%);
    bottom: -120px; right: -80px;
    animation-delay: -7s;
  }

  @keyframes floatOrb {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(30px, -40px) scale(1.05); }
    66%       { transform: translate(-20px, 20px) scale(0.97); }
  }

  /* Scanline */
  .rv-scanline {
    position: fixed; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.12), transparent);
    animation: scanline 8s linear infinite;
    pointer-events: none; z-index: 1;
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  /* Corner brackets */
  .rv-corner { position: fixed; width: 26px; height: 26px; z-index: 2; }
  .rv-corner-tl { top: 14px; left: 14px; border-top: 1px solid #38bdf8; border-left: 1px solid #38bdf8; }
  .rv-corner-tr { top: 14px; right: 14px; border-top: 1px solid #38bdf8; border-right: 1px solid #38bdf8; }
  .rv-corner-bl { bottom: 36px; left: 14px; border-bottom: 1px solid #38bdf8; border-left: 1px solid #38bdf8; }
  .rv-corner-br { bottom: 36px; right: 14px; border-bottom: 1px solid #38bdf8; border-right: 1px solid #38bdf8; }

  /* Ticker */
  .rv-ticker {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: rgba(5,7,15,0.95);
    border-top: 1px solid rgba(56,189,248,0.15);
    overflow: hidden; height: 28px;
    display: flex; align-items: center; z-index: 10;
  }
  .rv-ticker-label {
    flex-shrink: 0; padding: 0 16px;
    font-size: 9px; letter-spacing: 0.15em; color: #38bdf8;
    border-right: 1px solid rgba(56,189,248,0.3);
  }
  .rv-ticker-track { display: flex; white-space: nowrap; animation: ticker 28s linear infinite; }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .rv-tick-item { font-size: 9px; letter-spacing: 0.12em; color: rgba(226,232,240,0.35); padding: 0 32px; }
  .rv-tick-item span { color: #34d399; margin-left: 6px; }

  /* Top nav bar */
  .rv-topbar {
    position: relative; z-index: 5;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0 24px;
    height: 56px;
    border-bottom: 1px solid rgba(56,189,248,0.1);
    background: rgba(5,7,15,0.8);
    backdrop-filter: blur(10px);
    flex-shrink: 0;
  }
  .rv-topbar::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent);
  }

  .rv-nav-left {
    font-size: 9px; letter-spacing: 0.2em;
    color: rgba(56,189,248,0.6);
    text-transform: uppercase;
  }

  .rv-nav-center {
    text-align: center;
  }
  .rv-nav-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.25em; text-transform: uppercase;
    color: #e2e8f0;
  }

  .rv-nav-right {
    display: flex;
    justify-content: flex-end;
  }

  .rv-steps {
    display: flex; gap: 6px; align-items: center;
    font-size: 9px; letter-spacing: 0.12em;
    color: rgba(148,163,184,0.3);
  }
  .rv-step-active { color: #38bdf8; }
  .rv-step-done   { color: #34d399; }
  .rv-step-sep    { color: rgba(56,189,248,0.2); font-size: 8px; }

  /* Page scroll area */
  .rv-page {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative; z-index: 3;
    padding-bottom: 56px; /* ticker clearance */
  }
  .rv-page::-webkit-scrollbar { width: 4px; }
  .rv-page::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.15); border-radius: 4px; }

  /* Body wrapper */
  .rv-body {
    max-width: 720px;
    margin: 0 auto;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 28px;
    animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Section heading */
  .rv-section-head { display: flex; flex-direction: column; gap: 6px; }
  .rv-back {
    background: none; border: none;
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 0.12em; color: rgba(56,189,248,0.5);
    cursor: pointer; text-align: left; padding: 0;
    text-transform: uppercase; transition: color 0.15s;
    margin-bottom: 4px;
  }
  .rv-back:hover { color: #38bdf8; }

  .rv-heading {
    font-family: 'Syne', sans-serif;
    font-size: clamp(22px, 4vw, 30px);
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .rv-heading em {
    font-style: italic;
    background: linear-gradient(135deg, #38bdf8, #818cf8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .rv-meta {
    font-size: 10px; letter-spacing: 0.12em;
    color: rgba(148,163,184,0.5);
    text-transform: uppercase;
    margin-top: 4px;
  }

  .rv-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent);
  }

  /* ── LIST ── */
  .rv-list { display: flex; flex-direction: column; gap: 8px; }

  .rv-list-item {
    display: flex; align-items: center; gap: 16px;
    padding: 14px 18px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(56,189,248,0.08);
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative; overflow: hidden;
  }
  .rv-list-item::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
    background: #38bdf8; opacity: 0;
    transition: opacity 0.15s;
  }
  .rv-list-item:hover {
    background: rgba(56,189,248,0.05);
    border-color: rgba(56,189,248,0.2);
  }
  .rv-list-item:hover::before { opacity: 1; }

  .rv-list-id {
    font-size: 9px; letter-spacing: 0.1em;
    color: rgba(56,189,248,0.5);
    width: 32px; flex-shrink: 0;
    text-transform: uppercase;
  }
  .rv-list-info { flex: 1; min-width: 0; }
  .rv-list-title {
    font-size: 13px; color: #e2e8f0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    letter-spacing: 0.02em;
  }
  .rv-list-lang {
    font-size: 9px; color: rgba(148,163,184,0.4);
    margin-top: 3px; letter-spacing: 0.1em; text-transform: uppercase;
  }
  .rv-list-badge {
    font-size: 9px; letter-spacing: 0.1em;
    padding: 3px 8px; border-radius: 2px;
    background: rgba(56,189,248,0.07);
    border: 1px solid rgba(56,189,248,0.15);
    color: rgba(56,189,248,0.6);
    text-transform: uppercase; flex-shrink: 0;
  }
  .rv-list-arrow {
    font-size: 12px; color: rgba(56,189,248,0.3);
    flex-shrink: 0; transition: color 0.15s, transform 0.15s;
  }
  .rv-list-item:hover .rv-list-arrow {
    color: #38bdf8; transform: translateX(3px);
  }

  .rv-empty {
    padding: 48px 32px; text-align: center;
    font-size: 11px; letter-spacing: 0.12em;
    color: rgba(148,163,184,0.25);
    border: 1px dashed rgba(56,189,248,0.1);
    border-radius: 3px;
    text-transform: uppercase;
  }
  .rv-empty span {
    display: block; margin-top: 8px;
    font-size: 9px; opacity: 0.6;
  }

  /* ── CODE BLOCK ── */
  .rv-code-wrap {
    background: #020609;
    border: 1px solid rgba(56,189,248,0.1);
    border-radius: 3px; overflow: hidden;
    position: relative;
  }
  .rv-code-wrap::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent);
  }
  .rv-code-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(56,189,248,0.08);
    background: rgba(56,189,248,0.02);
  }
  .rv-code-label { font-size: 9px; letter-spacing: 0.15em; color: rgba(148,163,184,0.4); text-transform: uppercase; }
  .rv-code-lang {
    font-size: 9px; color: #38bdf8;
    background: rgba(56,189,248,0.08);
    border: 1px solid rgba(56,189,248,0.2);
    padding: 2px 10px; border-radius: 2px;
    letter-spacing: 0.1em; text-transform: uppercase;
  }
  .rv-code-pre {
    padding: 18px;
    font-family: 'DM Mono', monospace; font-size: 12px;
    line-height: 1.75; color: #7fcccc;
    overflow-x: auto; white-space: pre-wrap; word-break: break-all;
    max-height: 300px; overflow-y: auto;
  }
  .rv-code-pre::-webkit-scrollbar { width: 4px; height: 4px; }
  .rv-code-pre::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.15); border-radius: 4px; }

  .rv-section-label {
    font-size: 9px; letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(56,189,248,0.5);
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .rv-section-label::after {
    content: '';
    flex: 1; height: 1px;
    background: rgba(56,189,248,0.1);
  }

  /* ── DECISIONS ── */
  .rv-decisions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  .rv-decision-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(56,189,248,0.08);
    border-radius: 3px; cursor: pointer;
    transition: all 0.15s ease;
    color: rgba(148,163,184,0.5);
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.06em; text-align: left;
    position: relative; overflow: hidden;
  }
  .rv-decision-btn:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(148,163,184,0.2);
    color: #e2e8f0;
  }
  .rv-decision-btn.active {
    border-color: var(--dc);
    background: color-mix(in srgb, var(--dc) 8%, transparent);
    color: var(--dc);
  }
  .rv-decision-btn.active::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
    background: var(--dc);
  }
  .rv-decision-icon {
    width: 24px; height: 24px; border-radius: 50%;
    border: 1px solid currentColor;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; flex-shrink: 0;
  }

  /* ── CONFIDENCE ── */
  .rv-confidence-row {
    display: flex; align-items: flex-end;
    justify-content: space-between; margin-bottom: 12px;
  }
  .rv-confidence-display { text-align: right; }
  .rv-confidence-val {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 700;
    background: linear-gradient(135deg, #38bdf8, #818cf8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }
  .rv-confidence-word {
    font-size: 9px; color: rgba(148,163,184,0.4);
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-top: 2px;
  }

  .rv-slider {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 2px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px; outline: none; cursor: pointer;
  }
  .rv-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px; height: 18px; border-radius: 50%;
    background: #38bdf8;
    border: 2px solid #05070f;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.2), 0 0 12px rgba(56,189,248,0.4);
    cursor: pointer;
    transition: box-shadow 0.15s;
  }
  .rv-slider:hover::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px rgba(56,189,248,0.3), 0 0 20px rgba(56,189,248,0.5);
  }
  .rv-slider-ticks {
    display: flex; justify-content: space-between;
    padding: 0 2px; margin-top: 8px;
  }
  .rv-tick { font-size: 8px; color: rgba(148,163,184,0.2); letter-spacing: 0.06em; text-transform: uppercase; }

  /* ── TEXTAREA ── */
  .rv-textarea {
    width: 100%; min-height: 120px; padding: 14px 16px;
    background: #020609;
    border: 1px solid rgba(56,189,248,0.1);
    border-radius: 3px; color: #e2e8f0;
    font-family: 'DM Mono', monospace; font-size: 12px;
    line-height: 1.7; resize: vertical; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    letter-spacing: 0.02em;
  }
  .rv-textarea::placeholder { color: rgba(148,163,184,0.2); }
  .rv-textarea:focus {
    border-color: rgba(56,189,248,0.3);
    box-shadow: 0 0 0 3px rgba(56,189,248,0.06);
  }
  .rv-textarea.err { border-color: rgba(239,68,68,0.4); }
  .rv-char-row { display: flex; justify-content: flex-end; margin-top: 6px; }
  .rv-char-count { font-size: 9px; color: rgba(148,163,184,0.2); letter-spacing: 0.06em; }

  .rv-error-msg { font-size: 10px; color: #f87171; margin-top: 8px; letter-spacing: 0.06em; }

  /* ── CONFLICT BANNER ── */
  .rv-conflict {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 18px;
    background: rgba(239,68,68,0.05);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 3px;
    font-size: 11px; color: rgba(248,113,113,0.9);
    letter-spacing: 0.06em;
  }
  .rv-conflict-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #ef4444; flex-shrink: 0;
    box-shadow: 0 0 6px #ef4444;
    animation: conflictPulse 1.5s ease infinite;
  }
  @keyframes conflictPulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px #ef4444; }
    50%       { opacity: 0.4; box-shadow: 0 0 2px #ef4444; }
  }

  /* ── SUBMIT BUTTON ── */
  .rv-submit {
    width: 100%; padding: 16px;
    background: #38bdf8; color: #05070f;
    border: none; border-radius: 3px;
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    cursor: pointer; position: relative; overflow: hidden;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .rv-submit::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    background-size: 200% auto; opacity: 0;
  }
  .rv-submit:hover {
    background: #7dd3fc;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(56,189,248,0.3);
  }
  .rv-submit:active { transform: translateY(0); }
  .rv-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

  /* ── SUCCESS ── */
  .rv-success {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 24px; padding: 64px 32px; text-align: center;
    animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
  .rv-success-ring {
    position: relative; width: 80px; height: 80px;
    display: flex; align-items: center; justify-content: center;
  }
  .rv-success-ring::before {
    content: '';
    position: absolute; inset: 0; border-radius: 50%;
    border: 1px solid rgba(52,211,153,0.2);
    animation: ringPulse 2s ease infinite;
  }
  @keyframes ringPulse {
    0%   { transform: scale(0.9); opacity: 0.5; }
    50%  { transform: scale(1.1); opacity: 0.1; }
    100% { transform: scale(0.9); opacity: 0.5; }
  }
  .rv-success-icon {
    width: 70px; height: 70px; border-radius: 50%;
    background: rgba(52,211,153,0.08);
    border: 1px solid rgba(52,211,153,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; position: relative; z-index: 1;
  }
  .rv-success-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 700;
    color: #f1f5f9; letter-spacing: -0.02em;
  }
  .rv-success-title em {
    font-style: italic;
    background: linear-gradient(135deg, #34d399, #38bdf8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .rv-success-meta {
    font-size: 10px; color: rgba(148,163,184,0.4);
    letter-spacing: 0.15em; text-transform: uppercase;
  }
  .rv-success-chips { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .rv-chip {
    font-size: 10px; padding: 5px 14px; border-radius: 2px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(56,189,248,0.15);
    color: rgba(148,163,184,0.5);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .rv-reset {
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(56,189,248,0.5); background: none; border: none;
    cursor: pointer; text-decoration: underline; text-underline-offset: 3px;
    transition: color 0.15s;
  }
  .rv-reset:hover { color: #38bdf8; }

  /* ── LOADING / ERROR ── */
  .rv-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 64px; color: rgba(148,163,184,0.3);
    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; gap: 12px;
  }
  .rv-err-box {
    padding: 20px; color: #f87171;
    font-size: 12px; letter-spacing: 0.06em;
    background: rgba(239,68,68,0.05);
    border: 1px solid rgba(239,68,68,0.15); border-radius: 3px;
  }

  .rv-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(56,189,248,0.15);
    border-top-color: #38bdf8;
    border-radius: 50%; animation: spin 0.6s linear infinite;
    display: inline-block; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Live dot */
  .rv-live-dot {
    display: inline-block; width: 6px; height: 6px;
    border-radius: 50%; background: #34d399;
    box-shadow: 0 0 6px #34d399;
    margin-right: 6px;
    animation: liveBlink 2s ease-in-out infinite;
  }
  @keyframes liveBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  @media (max-width: 600px) {
    .rv-decisions { grid-template-columns: 1fr; }
    .rv-body { padding: 20px 16px; }
    .rv-topbar { padding: 0 14px; }
  }
`;

export default function Review() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const [step, setStep]   = useState("list");

  const [submissions,  setSubmissions]  = useState([]);
  const [listLoading,  setListLoading]  = useState(true);
  const [listError,    setListError]    = useState("");

  const [selected,         setSelected]         = useState(null);
  const [conflictDetected, setConflictDetected] = useState(false);

  const [review,    setReview]    = useState({ comment: "", decision: "", confidence: 3 });
  const [errors,    setErrors]    = useState({});
  const [charCount, setCharCount] = useState(0);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setListLoading(true); setListError("");
      try {
        let userId = null;
        try { userId = JSON.parse(atob(token.split(".")[1])).id; } catch {}
        const res = await fetch("http://localhost:5000/api/submissions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSubmissions(
          (Array.isArray(data) ? data : []).filter(
            (s) => userId == null || String(s.USER_ID) !== String(userId)
          )
        );
      } catch {
        setListError("Could not load submissions. Is the backend running?");
      } finally {
        setListLoading(false);
      }
    };
    load();
  }, [token]);

  const handleSelect = async (sub) => {
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/${sub.SUBMISSION_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : sub;

setSelected(data);

      setSelected({
  ...data,
  CODE: data.CODE || data.code
});
    } catch { setSelected(sub); }

    try {
      const aRes = await fetch(
        `http://localhost:5000/api/submissions/${sub.SUBMISSION_ID}/analysis`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (aRes.ok) {
        const a = await aRes.json();
        setConflictDetected(a.CONSENSUS_STATUS === "CONFLICT");
      }
    } catch {}

    setStep("review");
    setReview({ comment: "", decision: "", confidence: 3 });
    setErrors({});
    setCharCount(0);
  };

  const handleDecision   = (val) => { setReview((r) => ({ ...r, decision: val })); setErrors((e) => ({ ...e, decision: null })); };
  const handleComment    = (e)   => { setReview((r) => ({ ...r, comment: e.target.value })); setCharCount(e.target.value.length); if (e.target.value) setErrors((er) => ({ ...er, comment: null })); };
  const handleConfidence = (e)   => { setReview((r) => ({ ...r, confidence: Number(e.target.value) })); };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!review.decision) newErrors.decision = "Please select a decision.";
    if (!review.comment.trim()) newErrors.comment = "Please write feedback.";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          submission_id: selected.SUBMISSION_ID,
          rating: review.confidence,
          comments: `[${review.decision.toUpperCase()}] ${review.comment}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Review failed");
      setStep("done");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeDecision = DECISIONS.find((d) => d.value === review.decision);
  const fillPct        = ((review.confidence - 1) / 4) * 100;

  const StepBar = () => (
    <div className="rv-steps">
      <span className={step === "list"   ? "rv-step-active" : step !== "list" ? "rv-step-done" : ""}>01·SELECT</span>
      <span className="rv-step-sep">›</span>
      <span className={step === "review" ? "rv-step-active" : step === "done" ? "rv-step-done" : ""}>02·REVIEW</span>
      <span className="rv-step-sep">›</span>
      <span className={step === "done"   ? "rv-step-active" : ""}>03·DONE</span>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="rv-root">
        {/* Atmospheric layers */}
        <div className="rv-scanline" />
        <div className="rv-orb rv-orb-1" />
        <div className="rv-orb rv-orb-2" />
        <div className="rv-corner rv-corner-tl" />
        <div className="rv-corner rv-corner-tr" />
        <div className="rv-corner rv-corner-bl" />
        <div className="rv-corner rv-corner-br" />

        {/* Top nav */}
        <header className="rv-topbar">
          <div className="rv-nav-left">
            <span className="rv-live-dot" />
            ANON-CR · v2.4.1
          </div>
          <div className="rv-nav-center">
            <span className="rv-nav-title">Code Review</span>
          </div>
          <div className="rv-nav-right">
            <StepBar />
          </div>
        </header>

        {/* Scrollable content */}
        <main className="rv-page">

          {/* ── STEP 1: LIST ── */}
          {step === "list" && (
            <div className="rv-body">
              <div className="rv-section-head">
                <button className="rv-back" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
                <h1 className="rv-heading">Choose a <em>Submission</em></h1>
                <p className="rv-meta">Select any submission below · feedback is anonymous</p>
              </div>

              <div className="rv-divider" />

              {listLoading ? (
                <div className="rv-loading">
                  <span className="rv-spinner" />
                  Loading submissions…
                </div>
              ) : listError ? (
                <div className="rv-err-box">⚠ {listError}</div>
              ) : submissions.length === 0 ? (
                <div className="rv-empty">
                  No submissions available to review right now.
                  <span>Check back later or submit your own code first.</span>
                </div>
              ) : (
                <div className="rv-list">
                  {submissions.map((sub) => (
                    <div key={sub.SUBMISSION_ID} className="rv-list-item" onClick={() => handleSelect(sub)}>
                      <span className="rv-list-id">#{sub.SUBMISSION_ID}</span>
                      <div className="rv-list-info">
                        <div className="rv-list-title">{sub.TITLE || `Submission #${sub.SUBMISSION_ID}`}</div>
                        <div className="rv-list-lang">
                          {sub.LANGUAGE || "Unknown"} · {sub.CONSENSUS_STATUS || sub.STATUS || "PENDING"}
                        </div>
                      </div>
                      <span className="rv-list-badge">{sub.LANGUAGE || "—"}</span>
                      <span className="rv-list-arrow">→</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: REVIEW ── */}
          {step === "review" && selected && (
            <div className="rv-body">
              <div className="rv-section-head">
                <button className="rv-back" onClick={() => setStep("list")}>← Back to List</button>
                <h1 className="rv-heading">Review <em>Submission</em></h1>
                <p className="rv-meta">
                  {selected.TITLE || `Submission #${selected.SUBMISSION_ID}`} · anonymous feedback
                </p>
              </div>

              <div className="rv-divider" />

              {/* Code */}
              <div>
                <p className="rv-section-label">Submitted Code</p>
                <div className="rv-code-wrap">
                  <div className="rv-code-header">
                    <span className="rv-code-label">{selected.TITLE || `#${selected.SUBMISSION_ID}`}</span>
                    <span className="rv-code-lang">{selected.LANGUAGE || "unknown"}</span>
                  </div>
                  <pre className="rv-code-pre">
                    {selected.CODE ?? selected.code ?? "(No code content available)"}
                  </pre>
                </div>
              </div>

              <div className="rv-divider" />

              {/* Decision */}
              <div>
                <p className="rv-section-label">Your Decision</p>
                <div className="rv-decisions">
                  {DECISIONS.map((d) => (
                    <button
                      key={d.value}
                      className={`rv-decision-btn${review.decision === d.value ? " active" : ""}`}
                      style={{ "--dc": d.color }}
                      onClick={() => handleDecision(d.value)}
                    >
                      <span className="rv-decision-icon">{d.icon}</span>
                      {d.label}
                    </button>
                  ))}
                </div>
                {errors.decision && <p className="rv-error-msg">↑ {errors.decision}</p>}
              </div>

              {/* Confidence */}
              <div>
                <div className="rv-confidence-row">
                  <p className="rv-section-label" style={{ marginBottom: 0, flex: 1 }}>Confidence Level</p>
                  <div className="rv-confidence-display">
                    <div className="rv-confidence-val">{review.confidence}</div>
                    <div className="rv-confidence-word">{CONFIDENCE_LABELS[review.confidence]}</div>
                  </div>
                </div>
                <input
                  type="range" className="rv-slider" min="1" max="5"
                  value={review.confidence} onChange={handleConfidence}
                  style={{
                    background: `linear-gradient(to right, #38bdf8 ${fillPct}%, rgba(255,255,255,0.06) ${fillPct}%)`
                  }}
                />
                <div className="rv-slider-ticks">
                  {CONFIDENCE_LABELS.slice(1).map((l) => (
                    <span className="rv-tick" key={l}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <p className="rv-section-label">Review Comments</p>
                <textarea
                  className={`rv-textarea${errors.comment ? " err" : ""}`}
                  placeholder="Write constructive, specific feedback…"
                  value={review.comment}
                  onChange={handleComment}
                />
                <div className="rv-char-row"><span className="rv-char-count">{charCount} chars</span></div>
                {errors.comment && <p className="rv-error-msg">↑ {errors.comment}</p>}
              </div>

              {conflictDetected && (
                <div className="rv-conflict">
                  <span className="rv-conflict-dot" />
                  Conflict detected — this submission will be escalated for further review
                </div>
              )}

              <button className="rv-submit" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="rv-spinner" />Submitting…</>
                  : "Submit Review →"}
              </button>
            </div>
          )}

          {/* ── STEP 3: DONE ── */}
          {step === "done" && (
            <div className="rv-success">
              <div className="rv-success-ring">
                <div className="rv-success-icon">✓</div>
              </div>
              <div>
                <div className="rv-success-title">
                  Review <em>submitted.</em>
                </div>
                <div className="rv-success-meta" style={{ marginTop: 8 }}>
                  Your feedback has been recorded anonymously
                </div>
              </div>
              <div className="rv-success-chips">
                <span
                  className="rv-chip"
                  style={{ color: activeDecision?.color, borderColor: (activeDecision?.color || "#fff") + "44" }}
                >
                  {activeDecision?.icon} {activeDecision?.label}
                </span>
                <span className="rv-chip">Confidence · {review.confidence}/5</span>
                <span className="rv-chip">{charCount} chars</span>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <button className="rv-reset" onClick={() => navigate("/dashboard")}>
                  ← Dashboard
                </button>
                <button className="rv-reset" onClick={() => { setStep("list"); setSelected(null); }}>
                  Review Another →
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Bottom ticker */}
        <div className="rv-ticker">
          <div className="rv-ticker-label">LIVE</div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div className="rv-ticker-track">
              {[...TICKER, ...TICKER].map((t, i) => (
                <div className="rv-tick-item" key={i}>
                  {t.label}<span>{t.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}