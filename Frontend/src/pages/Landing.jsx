import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
 
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
 
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.94); opacity: 0.4; }
    50%  { transform: scale(1.06); opacity: 0.1; }
    100% { transform: scale(0.94); opacity: 0.4; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes floatOrb {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(30px, -40px) scale(1.05); }
    66%       { transform: translate(-20px, 20px) scale(0.97); }
  }
 
  .land-root {
    min-height: 100vh;
    background: #05070f;
    display: flex;
    flex-direction: column;
    font-family: 'DM Mono', monospace;
    color: #e2e8f0;
    position: relative;
    overflow: hidden;
  }
 
  /* grid */
  .land-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none; z-index: 0;
  }
 
  /* ambient orbs */
  .orb {
    position: fixed; border-radius: 50%;
    filter: blur(90px); pointer-events: none; z-index: 0;
    animation: floatOrb 14s ease-in-out infinite;
  }
  .orb-1 {
    width: 520px; height: 520px;
    background: radial-gradient(circle, rgba(56,189,248,0.09), transparent 70%);
    top: -180px; left: -140px;
  }
  .orb-2 {
    width: 420px; height: 420px;
    background: radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%);
    bottom: -120px; right: -100px;
    animation-delay: -7s;
  }
 
  .scanline {
    position: fixed; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent);
    animation: scanline 7s linear infinite;
    pointer-events: none; z-index: 1;
  }
 
  .corner { position: fixed; width: 28px; height: 28px; z-index: 2; }
  .corner-tl { top: 16px; left: 16px; border-top: 1px solid #38bdf8; border-left: 1px solid #38bdf8; }
  .corner-tr { top: 16px; right: 16px; border-top: 1px solid #38bdf8; border-right: 1px solid #38bdf8; }
  .corner-bl { bottom: 16px; left: 16px; border-bottom: 1px solid #38bdf8; border-left: 1px solid #38bdf8; }
  .corner-br { bottom: 16px; right: 16px; border-bottom: 1px solid #38bdf8; border-right: 1px solid #38bdf8; }
 
  /* ticker */
  .ticker-wrap {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: rgba(5,7,15,0.9);
    border-top: 1px solid rgba(56,189,248,0.15);
    overflow: hidden; height: 28px;
    display: flex; align-items: center; z-index: 10;
  }
  .ticker-label {
    flex-shrink: 0; padding: 0 16px;
    font-size: 9px; letter-spacing: 0.15em; color: #38bdf8;
    border-right: 1px solid rgba(56,189,248,0.3);
  }
  .ticker-track { display: flex; white-space: nowrap; animation: ticker 28s linear infinite; }
  .ticker-item { font-size: 9px; letter-spacing: 0.12em; color: rgba(226,232,240,0.4); padding: 0 32px; }
  .ticker-item span { color: #34d399; margin-left: 6px; }
 
  /* center layout */
  .land-center {
    position: relative; z-index: 5;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px 24px 60px;
    gap: 0;
  }
 
  /* status bar */
  .status-bar {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 36px;
    animation: fadeUp 0.5s ease both;
    font-size: 9px; letter-spacing: 0.2em; color: rgba(56,189,248,0.7);
  }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px #34d399; }
  .status-sep { color: rgba(148,163,184,0.25); }
 
  /* card */
  .land-card {
    width: 100%;
    max-width: 480px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(56,189,248,0.12);
    border-radius: 4px;
    padding: 48px 44px 44px;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.6s 0.1s ease both;
  }
 
  /* top glow line */
  .land-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent);
  }
 
  /* index tag */
  .card-tag {
    font-size: 9px; letter-spacing: 0.22em;
    color: rgba(56,189,248,0.5);
    margin-bottom: 28px;
  }
 
  .land-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 5vw, 42px);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    background: linear-gradient(135deg, #f1f5f9 30%, #94a3b8 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 18px;
  }
 
  .land-sub {
    font-size: 11px;
    line-height: 1.8;
    color: rgba(148,163,184,0.65);
    letter-spacing: 0.03em;
    margin-bottom: 36px;
  }
 
  /* feature pills */
  .features {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 36px;
  }
  .feat-pill {
    font-size: 9px; letter-spacing: 0.12em;
    padding: 5px 12px; border-radius: 2px;
    border: 1px solid rgba(56,189,248,0.15);
    background: rgba(56,189,248,0.05);
    color: rgba(56,189,248,0.7);
  }
 
  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent); margin-bottom: 32px; }
 
  /* buttons */
  .land-btns { display: flex; gap: 14px; }
  @media (max-width: 400px) { .land-btns { flex-direction: column; } }
 
  .btn-primary {
    flex: 1; padding: 15px 24px;
    background: #38bdf8; color: #05070f;
    border: none; border-radius: 3px;
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; position: relative; overflow: hidden;
    transition: transform 0.15s, box-shadow 0.2s;
  }
  .btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    background-size: 200% auto; opacity: 0; transition: opacity 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(56,189,248,0.3); }
  .btn-primary:hover::after { opacity: 1; animation: shimmer 0.5s linear; }
  .btn-primary:active { transform: translateY(0); }
 
  .btn-secondary {
    flex: 1; padding: 15px 24px;
    background: transparent; color: #e2e8f0;
    border: 1px solid rgba(226,232,240,0.15); border-radius: 3px;
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
  }
  .btn-secondary:hover { border-color: rgba(226,232,240,0.35); background: rgba(226,232,240,0.04); transform: translateY(-2px); }
  .btn-secondary:active { transform: translateY(0); }
 
  /* bottom note */
  .land-note {
    margin-top: 24px;
    font-size: 9px; letter-spacing: 0.14em;
    color: rgba(148,163,184,0.3);
    text-align: center;
    animation: fadeUp 0.6s 0.35s ease both;
  }
  .cursor { animation: blink 1s step-end infinite; }
`;
 
const TICKER = [
  { label: "SYSTEM STATUS", val: "NOMINAL" },
  { label: "UPTIME", val: "99.98%" },
  { label: "REVIEWS PROCESSED", val: "1,847" },
  { label: "AVG TRUST SCORE", val: "84.2%" },
  { label: "ACTIVE NODES", val: "12" },
  { label: "CONFLICT RATE", val: "2.7%" },
];
 
const FEATURES = ["TOKEN-BASED IDENTITY", "TRUST SCORING", "CONFLICT DETECTION", "ANONYMOUS REVIEW"];
 
function Landing() {
  const navigate = useNavigate();
  const styleRef = useRef(null);
 
  useEffect(() => {
    if (!document.getElementById("land-styles")) {
      const el = document.createElement("style");
      el.id = "land-styles";
      el.textContent = css;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    return () => { if (styleRef.current) styleRef.current.remove(); };
  }, []);
 
  return (
    <div className="land-root">
      <div className="scanline" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />
 
      <div className="land-center">
 
        {/* Status */}
        <div className="status-bar">
          <span className="live-dot" />
          SYSTEM ONLINE
          <span className="status-sep">·</span>
          ALL SERVICES OPERATIONAL
          <span className="status-sep">·</span>
          v2.4.1
        </div>
 
        {/* Card */}
        <div className="land-card">
          <div className="card-tag">ANON-CR · SECURE REVIEW PLATFORM</div>
 
          <h1 className="land-title">Secure Collaborative Evaluation Platform</h1>
 
          <p className="land-sub">
            Secure, unbiased peer review using token-based identity,
            trust scoring, and intelligent conflict detection.
          </p>
 
          <div className="features">
            {FEATURES.map(f => <span className="feat-pill" key={f}>{f}</span>)}
          </div>
 
          <div className="divider" />
 
          <div className="land-btns">
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Login →
            </button>
            <button className="btn-secondary" onClick={() => navigate("/register")}>
              Register
            </button>
          </div>
        </div>
 
        <p className="land-note">
          ENCRYPTED END-TO-END · NO IDENTITY DISCLOSED<span className="cursor">_</span>
        </p>
 
      </div>
 
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
 
export default Landing;