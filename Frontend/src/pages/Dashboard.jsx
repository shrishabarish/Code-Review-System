import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
  @keyframes pulse-ring { 0% { transform: scale(0.92); opacity: 0.5; } 50% { transform: scale(1.08); opacity: 0.15; } 100% { transform: scale(0.92); opacity: 0.5; } }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .dash-root { min-height: 100vh; background: #05070f; display: flex; flex-direction: column; font-family: 'DM Mono', monospace; color: #e2e8f0; position: relative; overflow: hidden; }
  .dash-root::before { content: ''; position: fixed; inset: 0; background-image: linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; z-index: 0; }
  .scanline { position: fixed; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.18), transparent); animation: scanline 6s linear infinite; pointer-events: none; z-index: 1; }
  .corner { position: fixed; width: 28px; height: 28px; z-index: 2; }
  .corner-tl { top: 16px; left: 16px; border-top: 1px solid #38bdf8; border-left: 1px solid #38bdf8; }
  .corner-tr { top: 16px; right: 16px; border-top: 1px solid #38bdf8; border-right: 1px solid #38bdf8; }
  .corner-bl { bottom: 16px; left: 16px; border-bottom: 1px solid #38bdf8; border-left: 1px solid #38bdf8; }
  .corner-br { bottom: 16px; right: 16px; border-bottom: 1px solid #38bdf8; border-right: 1px solid #38bdf8; }
  .ticker-wrap { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(5,7,15,0.9); border-top: 1px solid rgba(56,189,248,0.15); overflow: hidden; height: 28px; display: flex; align-items: center; z-index: 10; }
  .ticker-label { flex-shrink: 0; padding: 0 16px; font-size: 9px; letter-spacing: 0.15em; color: #38bdf8; border-right: 1px solid rgba(56,189,248,0.3); }
  .ticker-track { display: flex; white-space: nowrap; animation: ticker 28s linear infinite; }
  .ticker-item { font-size: 9px; letter-spacing: 0.12em; color: rgba(226,232,240,0.45); padding: 0 32px; }
  .ticker-item span { color: #34d399; margin-left: 6px; }
  .main { position: relative; z-index: 5; flex: 1; display: flex; flex-direction: column; max-width: 1000px; width: 100%; margin: 0 auto; padding: 48px 32px 60px; gap: 40px; }
  .hdr { animation: fadeUp 0.6s ease both; }
  .hdr-eyebrow { font-size: 9px; letter-spacing: 0.25em; color: #38bdf8; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
  .hdr-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: #38bdf8; }
  .hdr-title { font-family: 'Syne', sans-serif; font-size: clamp(36px, 6vw, 58px); font-weight: 800; line-height: 1; letter-spacing: -0.03em; background: linear-gradient(135deg, #f1f5f9 30%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hdr-sub { margin-top: 10px; font-size: 12px; color: rgba(148,163,184,0.7); letter-spacing: 0.05em; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; animation: fadeUp 0.6s 0.15s ease both; }
  @media (max-width: 600px) { .stats { grid-template-columns: 1fr; } }
  .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(56,189,248,0.1); border-radius: 4px; padding: 28px 24px; position: relative; overflow: hidden; cursor: default; transition: border-color 0.25s, background 0.25s; }
  .stat-card:hover { border-color: rgba(56,189,248,0.35); background: rgba(56,189,248,0.04); }
  .stat-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent); opacity: 0; transition: opacity 0.25s; }
  .stat-card:hover::after { opacity: 1; }
  .stat-index { font-size: 9px; letter-spacing: 0.2em; color: rgba(56,189,248,0.5); margin-bottom: 20px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; background: linear-gradient(135deg, #f1f5f9, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .stat-value.accent { background: linear-gradient(135deg, #38bdf8, #7dd3fc); -webkit-background-clip: text; background-clip: text; }
  .stat-value.green  { background: linear-gradient(135deg, #34d399, #6ee7b7); -webkit-background-clip: text; background-clip: text; }
  .stat-label { font-size: 10px; letter-spacing: 0.12em; color: rgba(148,163,184,0.6); margin-top: 8px; text-transform: uppercase; }
  .stat-loading { font-size: 12px; color: rgba(148,163,184,0.4); margin-top: 8px; }
  .trust-ring { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); width: 52px; height: 52px; }
  .trust-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .ring-bg { fill: none; stroke: rgba(56,189,248,0.08); stroke-width: 3; }
  .ring-fill { fill: none; stroke: #38bdf8; stroke-width: 3; stroke-linecap: round; transition: stroke-dashoffset 1s ease; }
  .ring-pulse { position: absolute; inset: -6px; border-radius: 50%; border: 1px solid rgba(56,189,248,0.3); animation: pulse-ring 3s ease-in-out infinite; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent); }
  .actions { display: flex; gap: 16px; animation: fadeUp 0.6s 0.3s ease both; }
  @media (max-width: 500px) { .actions { flex-direction: column; } }
  .btn-primary { flex: 1; padding: 16px 28px; background: #38bdf8; color: #05070f; border: none; border-radius: 3px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(56,189,248,0.35); }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary { flex: 1; padding: 16px 28px; background: transparent; color: #e2e8f0; border: 1px solid rgba(226,232,240,0.15); border-radius: 3px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: border-color 0.2s, background 0.2s, transform 0.15s; }
  .btn-secondary:hover { border-color: rgba(226,232,240,0.4); background: rgba(226,232,240,0.04); transform: translateY(-2px); }
  .btn-secondary:active { transform: translateY(0); }
  .log { animation: fadeUp 0.6s 0.45s ease both; }
  .log-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .log-title { font-size: 9px; letter-spacing: 0.2em; color: rgba(148,163,184,0.5); }
  .log-live { display: flex; align-items: center; gap: 6px; font-size: 9px; letter-spacing: 0.15em; color: #34d399; }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px #34d399; }
  .log-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .log-row:last-child { border-bottom: none; }
  .log-time { font-size: 9px; color: rgba(148,163,184,0.35); letter-spacing: 0.05em; flex-shrink: 0; width: 52px; }
  .log-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .dot-blue  { background: #38bdf8; box-shadow: 0 0 5px #38bdf8; }
  .dot-green { background: #34d399; box-shadow: 0 0 5px #34d399; }
  .dot-amber { background: #fbbf24; box-shadow: 0 0 5px #fbbf24; }
  .log-text { font-size: 11px; color: rgba(226,232,240,0.65); flex: 1; }
  .log-badge { font-size: 9px; letter-spacing: 0.1em; padding: 2px 8px; border-radius: 2px; flex-shrink: 0; }
  .badge-ok  { background: rgba(52,211,153,0.12); color: #34d399; }
  .badge-rev { background: rgba(56,189,248,0.12); color: #38bdf8; }
  .badge-pnd { background: rgba(251,191,36,0.12); color: #fbbf24; }
  .mini-spinner { width: 12px; height: 12px; border: 2px solid rgba(56,189,248,0.2); border-top-color: #38bdf8; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
`;

function statusBadgeClass(status) {
  if (!status) return "badge-pnd";
  const s = status.toUpperCase();
  if (s === "CONSENSUS" || s === "RESOLVED") return "badge-ok";
  if (s === "PENDING") return "badge-pnd";
  return "badge-rev";
}

function statusDotClass(status) {
  if (!status) return "dot-amber";
  const s = status.toUpperCase();
  if (s === "CONSENSUS" || s === "RESOLVED") return "dot-green";
  if (s === "PENDING") return "dot-amber";
  return "dot-blue";
}

function Dashboard() {
  const navigate = useNavigate();
  const styleRef = useRef(null);
  const token    = localStorage.getItem("token");

  const [myStats, setMyStats]         = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [tickerData, setTickerData]   = useState([
    { label: "TRUST INDEX",    val: "…" },
    { label: "REVIEWS DONE",   val: "…" },
    { label: "LATEST STATUS",  val: "…" },
    { label: "QUEUE",          val: "LIVE" },
  ]);

  // Inject styles once
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

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // Fetch personal stats
  useEffect(() => {
    if (!token) return;
    const fetchMyStats = async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/submissions/my-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMyStats(data);
        setTickerData([
          { label: "TRUST INDEX",   val: `${data.trustScore ?? "—"}` },
          { label: "REVIEWS DONE",  val: `${data.totalReviews ?? 0}` },
          { label: "LATEST STATUS", val: data.latestStatus || "N/A" },
          { label: "QUEUE",         val: "LIVE" },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchMyStats();
  }, [token]);

  // Fetch all submissions for the "Recent Submissions" log
  useEffect(() => {
    if (!token) return;
    const fetchSubmissions = async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/submissions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setSubsLoading(false);
      }
    };
    fetchSubmissions();
  }, [token]);

  const CIRC    = 2 * Math.PI * 22;
  const trustPct = myStats ? Math.min(myStats.trustScore / 100, 1) : 0;

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
          <div className="stat-card">
            <div className="stat-index">01 / TRUST</div>
            {statsLoading
              ? <div className="stat-loading"><div className="mini-spinner" /></div>
              : <div className="stat-value accent">{myStats?.trustScore ?? "—"}</div>
            }
            <div className="stat-label">Trust Score</div>
            <div className="trust-ring">
              <div className="ring-pulse" />
              <svg viewBox="0 0 52 52">
                <circle className="ring-bg" cx="26" cy="26" r="22" />
                <circle className="ring-fill" cx="26" cy="26" r="22"
                  strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - trustPct)} />
              </svg>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-index">02 / STATUS</div>
            {statsLoading
              ? <div className="stat-loading"><div className="mini-spinner" /></div>
              : <div className="stat-value green" style={{ fontSize: "22px", paddingTop: "6px" }}>
                  {myStats?.latestStatus || "N/A"}
                </div>
            }
            <div className="stat-label">Latest Review Status</div>
          </div>

          <div className="stat-card">
            <div className="stat-index">03 / VOLUME</div>
            {statsLoading
              ? <div className="stat-loading"><div className="mini-spinner" /></div>
              : <div className="stat-value">{myStats?.totalReviews ?? 0}</div>
            }
            <div className="stat-label">Reviews Completed</div>
          </div>
        </section>

        <div className="divider" />

        {/* ── Action Buttons ── */}
        <div className="actions">
          <button className="btn-primary" onClick={() => navigate("/submit")}>
            Submit Code →
          </button>
          <button className="btn-secondary" onClick={() => navigate("/review")}>
            Review Code →
          </button>
        </div>

        {/* Recent Submissions */}
        <section className="log">
          <div className="log-header">
            <span className="log-title">RECENT SUBMISSIONS</span>
            <span className="log-live"><span className="live-dot" />LIVE</span>
          </div>

          {subsLoading ? (
            <div className="log-row"><span className="log-text"><div className="mini-spinner" /></span></div>
          ) : submissions.length === 0 ? (
            <div className="log-row"><span className="log-text">No submissions yet</span></div>
          ) : (
            submissions.slice(0, 8).map((sub) => (
              <div className="log-row" key={sub.SUBMISSION_ID}>
                <span className="log-time">#{sub.SUBMISSION_ID}</span>
                <span className={`log-dot ${statusDotClass(sub.CONSENSUS_STATUS || sub.STATUS)}`} />
                <span className="log-text">{sub.TITLE}</span>
                <span className={`log-badge ${statusBadgeClass(sub.CONSENSUS_STATUS || sub.STATUS)}`}>
                  {sub.CONSENSUS_STATUS || sub.STATUS || "PENDING"}
                </span>
              </div>
            ))
          )}
        </section>

      </main>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-label">LIVE</div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="ticker-track">
            {[...tickerData, ...tickerData].map((t, i) => (
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