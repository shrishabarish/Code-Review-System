import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
 
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.92); opacity: 0.5; }
    50%  { transform: scale(1.08); opacity: 0.15; }
    100% { transform: scale(0.92); opacity: 0.5; }
  }
  @keyframes countUp { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
 
  .dash-root {
    min-height: 100vh;
    background: #05070f;
    display: flex;
    flex-direction: column;
    font-family: 'DM Mono', monospace;
    color: #e2e8f0;
    position: relative;
    overflow: hidden;
  }
 
  /* ── grid bg ── */
  .dash-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }
 
  /* ── scanline ── */
  .scanline {
    position: fixed; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.18), transparent);
    animation: scanline 6s linear infinite;
    pointer-events: none;
    z-index: 1;
  }
 
  /* ── corner brackets ── */
  .corner { position: fixed; width: 28px; height: 28px; z-index: 2; }
  .corner-tl { top: 16px; left: 16px; border-top: 1px solid #38bdf8; border-left: 1px solid #38bdf8; }
  .corner-tr { top: 16px; right: 16px; border-top: 1px solid #38bdf8; border-right: 1px solid #38bdf8; }
  .corner-bl { bottom: 16px; left: 16px; border-bottom: 1px solid #38bdf8; border-left: 1px solid #38bdf8; }
  .corner-br { bottom: 16px; right: 16px; border-bottom: 1px solid #38bdf8; border-right: 1px solid #38bdf8; }
 
  /* ── ticker ── */
  .ticker-wrap {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: rgba(5,7,15,0.9);
    border-top: 1px solid rgba(56,189,248,0.15);
    overflow: hidden; height: 28px;
    display: flex; align-items: center;
    z-index: 10;
  }
  .ticker-label {
    flex-shrink: 0; padding: 0 16px;
    font-size: 9px; letter-spacing: 0.15em; color: #38bdf8;
    border-right: 1px solid rgba(56,189,248,0.3);
  }
  .ticker-track { display: flex; white-space: nowrap; animation: ticker 28s linear infinite; }
  .ticker-item { font-size: 9px; letter-spacing: 0.12em; color: rgba(226,232,240,0.45); padding: 0 32px; }
  .ticker-item span { color: #34d399; margin-left: 6px; }
 
  /* ── main layout ── */
  .main {
    position: relative; z-index: 5;
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
    padding: 48px 32px 60px;
    gap: 40px;
  }
 
  /* ── header ── */
  .hdr { animation: fadeUp 0.6s ease both; }
  .hdr-eyebrow {
    font-size: 9px; letter-spacing: 0.25em; color: #38bdf8;
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 10px;
  }
  .hdr-eyebrow::before {
    content: ''; display: block; width: 24px; height: 1px; background: #38bdf8;
  }
  .hdr-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 6vw, 58px);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #f1f5f9 30%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hdr-sub {
    margin-top: 10px;
    font-size: 12px; color: rgba(148,163,184,0.7); letter-spacing: 0.05em;
  }
 
  /* ── stats ── */
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; animation: fadeUp 0.6s 0.15s ease both; }
  @media (max-width: 600px) { .stats { grid-template-columns: 1fr; } }
 
  .stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(56,189,248,0.1);
    border-radius: 4px;
    padding: 28px 24px;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: border-color 0.25s, background 0.25s;
  }
  .stat-card:hover { border-color: rgba(56,189,248,0.35); background: rgba(56,189,248,0.04); }
  .stat-card::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent);
    opacity: 0; transition: opacity 0.25s;
  }
  .stat-card:hover::after { opacity: 1; }
 
  .stat-index { font-size: 9px; letter-spacing: 0.2em; color: rgba(56,189,248,0.5); margin-bottom: 20px; }
  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 40px; font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    background: linear-gradient(135deg, #f1f5f9, #94a3b8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .stat-value.accent { background: linear-gradient(135deg, #38bdf8, #7dd3fc); -webkit-background-clip: text; background-clip: text; }
  .stat-value.green  { background: linear-gradient(135deg, #34d399, #6ee7b7); -webkit-background-clip: text; background-clip: text; }
  .stat-label { font-size: 10px; letter-spacing: 0.12em; color: rgba(148,163,184,0.6); margin-top: 8px; text-transform: uppercase; }
 
  /* ring on trust score */
  .trust-ring {
    position: absolute; right: 20px; top: 50%; transform: translateY(-50%);
    width: 52px; height: 52px;
  }
  .trust-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .ring-bg { fill: none; stroke: rgba(56,189,248,0.08); stroke-width: 3; }
  .ring-fill { fill: none; stroke: #38bdf8; stroke-width: 3; stroke-linecap: round; transition: stroke-dashoffset 1s ease; }
  .ring-pulse {
    position: absolute; inset: -6px;
    border-radius: 50%;
    border: 1px solid rgba(56,189,248,0.3);
    animation: pulse-ring 3s ease-in-out infinite;
  }
 
  /* ── divider ── */
  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent); }
 
  /* ── actions ── */
  .actions { display: flex; gap: 16px; animation: fadeUp 0.6s 0.3s ease both; }
  @media (max-width: 500px) { .actions { flex-direction: column; } }
 
  .btn-primary {
    flex: 1; padding: 16px 28px;
    background: #38bdf8;
    color: #05070f;
    border: none; border-radius: 3px;
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer;
    position: relative; overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .btn-primary::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
    background-size: 200% auto;
    opacity: 0; transition: opacity 0.3s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(56,189,248,0.35); }
  .btn-primary:hover::before { opacity: 1; animation: shimmer 0.6s linear; }
  .btn-primary:active { transform: translateY(0); }
 
  .btn-secondary {
    flex: 1; padding: 16px 28px;
    background: transparent;
    color: #e2e8f0;
    border: 1px solid rgba(226,232,240,0.15);
    border-radius: 3px;
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
  }
  .btn-secondary:hover {
    border-color: rgba(226,232,240,0.4);
    background: rgba(226,232,240,0.04);
    transform: translateY(-2px);
  }
  .btn-secondary:active { transform: translateY(0); }
 
  /* ── activity log ── */
  .log { animation: fadeUp 0.6s 0.45s ease both; }
  .log-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .log-title { font-size: 9px; letter-spacing: 0.2em; color: rgba(148,163,184,0.5); }
  .log-live { display: flex; align-items: center; gap: 6px; font-size: 9px; letter-spacing: 0.15em; color: #34d399; }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px #34d399; }
 
  .log-row {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.2s;
  }
  .log-row:last-child { border-bottom: none; }
  .log-time { font-size: 9px; color: rgba(148,163,184,0.35); letter-spacing: 0.05em; flex-shrink: 0; width: 48px; }
  .log-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .dot-blue  { background: #38bdf8; box-shadow: 0 0 5px #38bdf8; }
  .dot-green { background: #34d399; box-shadow: 0 0 5px #34d399; }
  .dot-amber { background: #fbbf24; box-shadow: 0 0 5px #fbbf24; }
  .log-text { font-size: 11px; color: rgba(226,232,240,0.65); flex: 1; }
  .log-badge {
    font-size: 9px; letter-spacing: 0.1em; padding: 2px 8px;
    border-radius: 2px; flex-shrink: 0;
  }
  .badge-ok  { background: rgba(52,211,153,0.12); color: #34d399; }
  .badge-rev { background: rgba(56,189,248,0.12); color: #38bdf8; }
  .badge-pnd { background: rgba(251,191,36,0.12); color: #fbbf24; }
`;
 
const LOGS = [
  { time: "09:42", color: "dot-green", text: "auth.js — security review passed", badge: "badge-ok",  label: "VERIFIED" },
  { time: "09:31", color: "dot-blue",  text: "api/routes.ts — 3 reviewers assigned", badge: "badge-rev", label: "IN REVIEW" },
  { time: "09:18", color: "dot-amber", text: "utils/parser.js — consensus pending", badge: "badge-pnd", label: "PENDING" },
  { time: "08:55", color: "dot-green", text: "components/Button — approved", badge: "badge-ok",  label: "VERIFIED" },
];
 
const TICKER = [
  { label: "TRUST INDEX", val: "82%" },
  { label: "REVIEWS TODAY", val: "+14" },
  { label: "AVG TURNAROUND", val: "4.2 MIN" },
  { label: "CONSENSUS RATE", val: "97.3%" },
  { label: "ACTIVE REVIEWERS", val: "6" },
  { label: "QUEUE DEPTH", val: "2" },
];
 
function Dashboard() {
  const navigate = useNavigate();
  const styleRef = useRef(null);
 
  useEffect(() => {
    if (!document.getElementById("dash-styles")) {
      const el = document.createElement("style");
      el.id = "dash-styles";
      el.textContent = css;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    return () => { if (styleRef.current) styleRef.current.remove(); };
  }, []);
 
  const CIRC = 2 * Math.PI * 22; // r=22
  const trustPct = 0.82;
 
  return (
    <div className="dash-root">
      <div className="scanline" />
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />
 
      <main className="main">
 
        {/* Header */}
        <header className="hdr">
          <div className="hdr-eyebrow">CODE REVIEW SYSTEM · v2.4.1</div>
          <h1 className="hdr-title">Dashboard</h1>
          <p className="hdr-sub">SYSTEM NOMINAL · ALL SERVICES OPERATIONAL</p>
        </header>
 
        {/* Stats */}
        <section className="stats">
 
          {/* Trust Score */}
          <div className="stat-card">
            <div className="stat-index">01 / TRUST</div>
            <div className="stat-value accent">82%</div>
            <div className="stat-label">Trust Score</div>
            <div className="trust-ring">
              <div className="ring-pulse" />
              <svg viewBox="0 0 52 52">
                <circle className="ring-bg" cx="26" cy="26" r="22" />
                <circle
                  className="ring-fill"
                  cx="26" cy="26" r="22"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - trustPct)}
                />
              </svg>
            </div>
          </div>
 
          {/* Review Status */}
          <div className="stat-card">
            <div className="stat-index">02 / STATUS</div>
            <div className="stat-value green" style={{ fontSize: "28px", paddingTop: "6px" }}>CONSENSUS</div>
            <div className="stat-label">Review Status</div>
          </div>
 
          {/* Reviews Completed */}
          <div className="stat-card">
            <div className="stat-index">03 / VOLUME</div>
            <div className="stat-value">14</div>
            <div className="stat-label">Reviews Completed</div>
          </div>
 
        </section>
 
        <div className="divider" />
 
        {/* Actions */}
        <div className="actions">
          <button className="btn-primary" onClick={() => navigate("/submit")}>
            Submit Code →
          </button>
          <button className="btn-secondary" onClick={() => navigate("/review")}>
            Review Code
          </button>
        </div>
 
        <div className="divider" />
 
        {/* Activity Log */}
        <section className="log">
          <div className="log-header">
            <span className="log-title">RECENT ACTIVITY</span>
            <span className="log-live"><span className="live-dot" />LIVE</span>
          </div>
          {LOGS.map((row, i) => (
            <div className="log-row" key={i}>
              <span className="log-time">{row.time}</span>
              <span className={`log-dot ${row.color}`} />
              <span className="log-text">{row.text}</span>
              <span className={`log-badge ${row.badge}`}>{row.label}</span>
            </div>
          ))}
        </section>
 
      </main>
 
      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-label">LIVE</div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="ticker-track">
            {[...TICKER, ...TICKER].map((t, i) => (
              <div className="ticker-item" key={i}>
                {t.label}<span>{t.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default Dashboard;