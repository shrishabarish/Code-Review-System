import { useState } from "react";

const DECISIONS = [
  { value: "approve", label: "Approve", color: "#22c55e", icon: "✓" },
  { value: "minor_changes", label: "Minor Changes", color: "#f59e0b", icon: "~" },
  { value: "major_changes", label: "Major Changes", color: "#f97316", icon: "!" },
  { value: "reject", label: "Reject", color: "#ef4444", icon: "✕" },
];

const CONFIDENCE_LABELS = ["", "Uncertain", "Low", "Moderate", "High", "Very Confident"];

const CODE_SNIPPET = `function sum(a, b) {
  return a + b;
}`;

export default function Review() {
  const [review, setReview] = useState({ comment: "", decision: "", confidence: 3 });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState(0);
  const [conflictDetected] = useState(true);

  const handleDecision = (val) => {
    setReview((r) => ({ ...r, decision: val }));
    setErrors((e) => ({ ...e, decision: null }));
  };

  const handleComment = (e) => {
    setReview((r) => ({ ...r, comment: e.target.value }));
    setCharCount(e.target.value.length);
    if (e.target.value) setErrors((er) => ({ ...er, comment: null }));
  };

  const handleConfidence = (e) => {
    setReview((r) => ({ ...r, confidence: Number(e.target.value) }));
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!review.decision) newErrors.decision = "Please select a decision.";
    if (!review.comment.trim()) newErrors.comment = "Please write feedback.";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setSubmitted(true);
  };

  const handleReset = () => {
    setReview({ comment: "", decision: "", confidence: 3 });
    setErrors({});
    setSubmitted(false);
    setCharCount(0);
  };

  const activeDecision = DECISIONS.find((d) => d.value === review.decision);
  const fillPct = ((review.confidence - 1) / 4) * 100;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Mono', monospace;
      background: #0a0a0f;
    }

    .rv-root {
      min-height: 100vh;
      background: #0a0a0f;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      position: relative;
      overflow: hidden;
    }

    .rv-root::before {
      content: '';
      position: fixed;
      top: -30%;
      right: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .rv-root::after {
      content: '';
      position: fixed;
      bottom: -20%;
      left: -5%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .rv-card {
      width: 100%;
      max-width: 680px;
      background: #111118;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
      z-index: 1;
      animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .rv-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
    }

    .rv-dots { display: flex; gap: 6px; }
    .rv-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
    }
    .rv-dot:nth-child(1) { background: #ff5f57; }
    .rv-dot:nth-child(2) { background: #febc2e; }
    .rv-dot:nth-child(3) { background: #28c840; }

    .rv-tag {
      font-size: 10px;
      letter-spacing: 0.12em;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
    }

    .rv-body { padding: 32px; display: flex; flex-direction: column; gap: 28px; }

    .rv-heading {
      font-family: 'Fraunces', serif;
      font-size: 30px;
      font-weight: 300;
      color: #f1f5f9;
      line-height: 1.2;
      letter-spacing: -0.5px;
    }
    .rv-heading em {
      font-style: italic;
      color: #818cf8;
    }
    .rv-meta {
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      letter-spacing: 0.06em;
      margin-top: 6px;
      text-transform: uppercase;
    }

    .rv-divider {
      height: 1px;
      background: rgba(255,255,255,0.06);
    }

    /* CODE */
    .rv-code-wrap {
      background: #0d0d15;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 4px;
      overflow: hidden;
    }
    .rv-code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .rv-code-label {
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.25);
    }
    .rv-code-lang {
      font-size: 10px;
      color: #6366f1;
      background: rgba(99,102,241,0.1);
      padding: 2px 8px;
      border-radius: 2px;
      letter-spacing: 0.06em;
    }
    .rv-code-pre {
      padding: 16px;
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      line-height: 1.7;
      color: #e2e8f0;
      overflow-x: auto;
    }
    .rv-kw { color: #818cf8; }
    .rv-fn { color: #34d399; }
    .rv-param { color: #f9a8d4; }

    /* SECTION */
    .rv-section-label {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      margin-bottom: 12px;
    }

    /* DECISION GRID */
    .rv-decisions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .rv-decision-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: rgba(255,255,255,0.5);
      font-family: 'DM Mono', monospace;
      font-size: 12px;
      text-align: left;
    }
    .rv-decision-btn:hover {
      background: rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.15);
      color: #fff;
    }
    .rv-decision-btn.active {
      border-color: var(--dc);
      background: color-mix(in srgb, var(--dc) 10%, transparent);
      color: var(--dc);
    }
    .rv-decision-icon {
      width: 22px; height: 22px;
      border-radius: 50%;
      border: 1px solid currentColor;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
    }
    .rv-error-msg {
      font-size: 11px;
      color: #f87171;
      margin-top: 6px;
      letter-spacing: 0.04em;
    }

    /* CONFIDENCE */
    .rv-confidence-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .rv-confidence-val {
      font-family: 'Fraunces', serif;
      font-size: 22px;
      color: #818cf8;
    }
    .rv-confidence-word {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.08em;
    }
    .rv-slider-wrap { position: relative; }
    .rv-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 3px;
      background: rgba(255,255,255,0.08);
      border-radius: 2px;
      outline: none;
      cursor: pointer;
    }
    .rv-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #818cf8;
      border: 2px solid #0a0a0f;
      box-shadow: 0 0 0 3px rgba(129,140,248,0.2);
      cursor: pointer;
      transition: box-shadow 0.15s;
    }
    .rv-slider::-webkit-slider-thumb:hover {
      box-shadow: 0 0 0 6px rgba(129,140,248,0.2);
    }
    .rv-slider-ticks {
      display: flex;
      justify-content: space-between;
      padding: 0 2px;
      margin-top: 6px;
    }
    .rv-tick {
      font-size: 9px;
      color: rgba(255,255,255,0.2);
      letter-spacing: 0.04em;
    }

    /* TEXTAREA */
    .rv-textarea {
      width: 100%;
      min-height: 110px;
      padding: 14px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 4px;
      color: #e2e8f0;
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      line-height: 1.6;
      resize: vertical;
      outline: none;
      transition: border-color 0.15s;
    }
    .rv-textarea::placeholder { color: rgba(255,255,255,0.2); }
    .rv-textarea:focus { border-color: rgba(129,140,248,0.4); }
    .rv-textarea.err { border-color: rgba(248,113,113,0.4); }
    .rv-char-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 5px;
    }
    .rv-char-count {
      font-size: 10px;
      color: rgba(255,255,255,0.2);
      letter-spacing: 0.04em;
    }

    /* CONFLICT */
    .rv-conflict {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(239,68,68,0.06);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 4px;
      font-size: 12px;
      color: #f87171;
      letter-spacing: 0.04em;
    }
    .rv-conflict-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #ef4444;
      flex-shrink: 0;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* SUBMIT */
    .rv-submit {
      width: 100%;
      padding: 15px;
      background: #4f46e5;
      border: none;
      border-radius: 4px;
      color: white;
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }
    .rv-submit:hover { background: #4338ca; }
    .rv-submit:active { transform: scale(0.99); }
    .rv-submit:disabled { opacity: 0.4; cursor: not-allowed; }

    /* SUCCESS */
    .rv-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      padding: 60px 32px;
      text-align: center;
      animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
    }
    .rv-success-icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 26px;
    }
    .rv-success-title {
      font-family: 'Fraunces', serif;
      font-size: 26px;
      font-weight: 300;
      color: #f1f5f9;
    }
    .rv-success-meta {
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .rv-success-chips {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .rv-chip {
      font-size: 11px;
      padding: 5px 12px;
      border-radius: 2px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.06em;
    }
    .rv-reset {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .rv-reset:hover { color: rgba(255,255,255,0.6); }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="rv-root">
        <div className="rv-card">

          {/* Top bar */}
          <div className="rv-topbar">
            <div className="rv-dots">
              <div className="rv-dot" />
              <div className="rv-dot" />
              <div className="rv-dot" />
            </div>
            <span className="rv-tag">peer-review · anonymous</span>
            <span className="rv-tag">PR #284</span>
          </div>

          {submitted ? (
            <div className="rv-success">
              <div className="rv-success-icon">✓</div>
              <div>
                <div className="rv-success-title">Review <em style={{fontStyle:'italic',color:'#818cf8'}}>submitted.</em></div>
                <div className="rv-success-meta" style={{marginTop:6}}>Your feedback has been recorded anonymously</div>
              </div>
              <div className="rv-success-chips">
                <span className="rv-chip" style={{color: activeDecision?.color, borderColor: activeDecision?.color + '44'}}>
                  {activeDecision?.icon} {activeDecision?.label}
                </span>
                <span className="rv-chip">Confidence · {review.confidence}/5</span>
                <span className="rv-chip">{charCount} chars</span>
              </div>
              <button className="rv-reset" onClick={handleReset}>Submit another review</button>
            </div>
          ) : (
            <div className="rv-body">

              {/* Heading */}
              <div>
                <h1 className="rv-heading">Review <em>Assignment</em></h1>
                <p className="rv-meta">Stay unbiased · feedback is anonymous</p>
              </div>

              <div className="rv-divider" />

              {/* Code */}
              <div>
                <p className="rv-section-label">Submitted Code</p>
                <div className="rv-code-wrap">
                  <div className="rv-code-header">
                    <span className="rv-code-label">snippet</span>
                    <span className="rv-code-lang">javascript</span>
                  </div>
                  <pre className="rv-code-pre">
                    <span className="rv-kw">function</span>{" "}
                    <span className="rv-fn">sum</span>(
                    <span className="rv-param">a</span>,{" "}
                    <span className="rv-param">b</span>) {"{\n"}
                    {"  "}<span className="rv-kw">return</span> a + b;{"\n"}
                    {"}"}
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
                  <p className="rv-section-label" style={{marginBottom:0}}>Confidence Level</p>
                  <div style={{textAlign:'right'}}>
                    <div className="rv-confidence-val">{review.confidence}</div>
                    <div className="rv-confidence-word">{CONFIDENCE_LABELS[review.confidence]}</div>
                  </div>
                </div>
                <div className="rv-slider-wrap">
                  <input
                    type="range"
                    className="rv-slider"
                    min="1" max="5"
                    value={review.confidence}
                    onChange={handleConfidence}
                    style={{
                      background: `linear-gradient(to right, #818cf8 ${fillPct}%, rgba(255,255,255,0.08) ${fillPct}%)`
                    }}
                  />
                </div>
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
                  placeholder="Write constructive, specific feedback..."
                  value={review.comment}
                  onChange={handleComment}
                />
                <div className="rv-char-row">
                  <span className="rv-char-count">{charCount} chars</span>
                </div>
                {errors.comment && <p className="rv-error-msg">↑ {errors.comment}</p>}
              </div>

              {/* Conflict */}
              {conflictDetected && (
                <div className="rv-conflict">
                  <span className="rv-conflict-dot" />
                  Conflict detected — will be escalated for further review
                </div>
              )}

              {/* Submit */}
              <button className="rv-submit" onClick={handleSubmit}>
                Submit Review →
              </button>

            </div>
          )}
        </div>
      </div>
    </>
  );
}