import { useState, useEffect, useRef } from "react";

const tickData = [
  "AVG TURNAROUND", "4.2 MIN", "CONSENSUS RATE", "97.3%",
  "ACTIVE REVIEWERS", "6", "QUEUE DEPTH", "2",
  "TRUST INDEX", "82%", "REVIEWS TODAY", "+14",
];

export default function SubmitCode() {
  const [form, setForm] = useState({ title: "", description: "", language: "", code: "" });
  const [files, setFiles] = useState([]);
  const [lineCount, setLineCount] = useState(0);
  const [toast, setToast] = useState(false);
  const [btnError, setBtnError] = useState(false);
  const fileInputRef = useRef();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCodeChange = (e) => {
    setForm({ ...form, code: e.target.value });
    setLineCount(e.target.value ? e.target.value.split("\n").length : 0);
  };

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  const resetForm = () => {
    setForm({ title: "", description: "", language: "", code: "" });
    setFiles([]);
    setLineCount(0);
  };

  const submitCode = () => {
    if (!form.title.trim() || !form.code.trim()) {
      setBtnError(true);
      setTimeout(() => setBtnError(false), 2000);
      return;
    }
    console.log("Submission:", { ...form, files });
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sc-wrap {
          background: #080d14;
          min-height: 100vh;
          padding: 32px 20px;
          font-family: 'Space Grotesk', sans-serif;
          color: #e2f0ff;
          position: relative;
          overflow: hidden;
        }
        .sc-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,200,255,.03) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,200,255,.03) 40px);
          pointer-events: none;
        }
        .sc-corner { position: absolute; width: 18px; height: 18px; border-color: #00c8ff; border-style: solid; opacity: .5; }
        .sc-corner.tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
        .sc-corner.tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
        .sc-corner.bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
        .sc-corner.br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }
        .sc-header { text-align: center; margin-bottom: 28px; }
        .sc-sys-label { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #00c8ff; opacity: .7; margin-bottom: 8px; }
        .sc-title { font-family: 'Space Mono', monospace; font-size: 30px; font-weight: 700; color: #fff; letter-spacing: 2px; text-transform: uppercase; }
        .sc-subtitle { font-size: 13px; color: #5a7fa0; letter-spacing: 1px; margin-top: 6px; }
        .sc-ticker { background: #0d1520; border-top: 1px solid #0e2840; border-bottom: 1px solid #0e2840; padding: 7px 0; overflow: hidden; margin-bottom: 28px; }
        .sc-ticker-inner { display: flex; gap: 40px; animation: sc-tick 18s linear infinite; width: max-content; }
        @keyframes sc-tick { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .sc-tick-item { font-family: 'Space Mono', monospace; font-size: 10px; color: #3a6080; white-space: nowrap; }
        .sc-tick-item span { color: #00c8ff; }
        .sc-card {
          background: #0d1a27;
          border: 1px solid #0e2e47;
          border-radius: 4px;
          padding: 24px;
          max-width: 860px;
          margin: 0 auto;
          position: relative;
        }
        .sc-card::before {
          content: 'SUBMIT CODE // v2.4.1';
          position: absolute;
          top: -10px; left: 16px;
          background: #0d1a27;
          padding: 0 8px;
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          color: #00c8ff;
          letter-spacing: 2px;
        }
        .sc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .sc-row.full { grid-template-columns: 1fr; }
        .sc-field { display: flex; flex-direction: column; gap: 6px; }
        .sc-field label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3a7a9c; text-transform: uppercase; }
        .sc-input, .sc-select, .sc-textarea {
          background: #060e18;
          border: 1px solid #0e2e47;
          border-radius: 2px;
          color: #c8dff0;
          padding: 10px 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color .2s;
          width: 100%;
        }
        .sc-input:focus, .sc-select:focus, .sc-textarea:focus {
          border-color: #00c8ff;
          box-shadow: 0 0 0 2px rgba(0,200,255,.08);
        }
        .sc-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2300c8ff'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-color: #060e18;
        }
        .sc-textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
        .sc-code-wrap { position: relative; }
        .sc-code {
          background: #060e18;
          border: 1px solid #0e2e47;
          border-radius: 2px;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          color: #7fcccc;
          min-height: 200px;
          line-height: 1.7;
          padding: 14px;
          resize: vertical;
          width: 100%;
          outline: none;
          transition: border-color .2s;
        }
        .sc-code:focus { border-color: #00c8ff; box-shadow: 0 0 0 2px rgba(0,200,255,.08); }
        .sc-code-badge { position: absolute; top: 8px; right: 10px; font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #1a4a6a; text-transform: uppercase; }
        .sc-file-zone {
          border: 1px dashed #0e2e47;
          border-radius: 2px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: border-color .2s;
          background: #060e18;
        }
        .sc-file-zone:hover { border-color: #00c8ff; }
        .sc-file-icon { font-size: 20px; opacity: .6; }
        .sc-file-label { font-family: 'Space Mono', monospace; font-size: 10px; color: #3a7a9c; letter-spacing: 1px; }
        .sc-file-list { font-size: 12px; color: #3a7a9c; font-family: 'Space Mono', monospace; }
        .sc-divider { border: none; border-top: 1px solid #0e2e47; margin: 20px 0; }
        .sc-actions { display: flex; gap: 12px; align-items: center; }
        .sc-btn-submit {
          flex: 1;
          background: #00c8ff;
          color: #060e18;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: none;
          border-radius: 2px;
          padding: 14px 24px;
          cursor: pointer;
          font-weight: 700;
          transition: background .2s, transform .1s;
        }
        .sc-btn-submit:hover { background: #33d4ff; }
        .sc-btn-submit:active { transform: scale(0.98); }
        .sc-btn-submit.error { background: #ff4455 !important; }
        .sc-btn-cancel {
          background: transparent;
          color: #3a6080;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          border: 1px solid #0e2e47;
          border-radius: 2px;
          padding: 14px 20px;
          cursor: pointer;
          transition: border-color .2s, color .2s;
        }
        .sc-btn-cancel:hover { border-color: #3a6080; color: #5a8090; }
        .sc-status-bar { display: flex; gap: 20px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #0a1e30; flex-wrap: wrap; }
        .sc-stat { display: flex; flex-direction: column; gap: 2px; }
        .sc-stat-val { font-family: 'Space Mono', monospace; font-size: 15px; color: #00c8ff; font-weight: 700; }
        .sc-stat-lbl { font-size: 10px; color: #2a5a7a; letter-spacing: 1px; text-transform: uppercase; }
        .sc-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #00c8ff; margin-right: 6px; animation: sc-blink 1.2s ease-in-out infinite; }
        @keyframes sc-blink { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
        .sc-live { font-family: 'Space Mono', monospace; font-size: 10px; color: #3a7a9c; display: flex; align-items: center; }
        .sc-toast {
          display: none;
          position: fixed;
          top: 20px; right: 20px;
          background: #0d2a1a;
          border: 1px solid #0a5020;
          border-radius: 4px;
          padding: 12px 20px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #00e87a;
          letter-spacing: 1px;
          z-index: 10;
          animation: sc-fadein .3s ease;
        }
        .sc-toast.show { display: block; }
        @keyframes sc-fadein { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 600px) { .sc-row { grid-template-columns: 1fr; } }
      `}</style>

      <div className="sc-wrap">
        <div className="sc-corner tl" /><div className="sc-corner tr" />
        <div className="sc-corner bl" /><div className="sc-corner br" />

        <div className="sc-header">
          <div className="sc-sys-label">— CODE REVIEW SYSTEM · v2.4.1 —</div>
          <div className="sc-title">Submit Code</div>
          <div className="sc-subtitle">Share for anonymous review &amp; feedback</div>
        </div>

        <div className="sc-ticker">
          <div className="sc-ticker-inner">
            {[...tickData, ...tickData].map((t, i) => {
              const isNum = /^[\d.%+]+$/.test(t);
              return (
                <div key={i} className="sc-tick-item">
                  {isNum ? <span>{t}</span> : t}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sc-card">
          <div className="sc-row">
            <div className="sc-field">
              <label>Title</label>
              <input
                name="title"
                className="sc-input"
                placeholder="e.g. Sorting algorithm optimization"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="sc-field">
              <label>Language</label>
              <select name="language" className="sc-select" value={form.language} onChange={handleChange}>
                <option value="">Select language</option>
                {["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sc-row full">
            <div className="sc-field">
              <label>Description</label>
              <textarea
                name="description"
                className="sc-textarea"
                placeholder="Describe your problem, approach, or doubts..."
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="sc-row full">
            <div className="sc-field">
              <label>Code</label>
              <div className="sc-code-wrap">
                <textarea
                  className="sc-code"
                  placeholder="// Paste your code here..."
                  value={form.code}
                  onChange={handleCodeChange}
                />
                <div className="sc-code-badge">{lineCount} line{lineCount !== 1 ? "s" : ""}</div>
              </div>
            </div>
          </div>

          <div className="sc-row full">
            <div className="sc-field">
              <label>Attachments</label>
              <div className="sc-file-zone" onClick={() => fileInputRef.current.click()}>
                <div className="sc-file-icon">⊕</div>
                <div className="sc-file-label">Upload screenshots / files</div>
                <div className="sc-file-list">
                  {files.length ? files.map((f) => f.name).join(", ") : "No files selected"}
                </div>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <hr className="sc-divider" />

          <div className="sc-actions">
            <button className="sc-btn-cancel" onClick={resetForm}>Clear</button>
            <button
              className={`sc-btn-submit${btnError ? " error" : ""}`}
              onClick={submitCode}
            >
              {btnError ? "! Title & code required" : "Submit for review →"}
            </button>
          </div>

          <div className="sc-status-bar">
            <div className="sc-live"><span className="sc-dot" />Live</div>
            {[
              { val: "4.2m", lbl: "Avg turnaround" },
              { val: "97.3%", lbl: "Consensus rate" },
              { val: "6", lbl: "Active reviewers" },
              { val: "82%", lbl: "Trust index" },
            ].map((s) => (
              <div key={s.lbl} className="sc-stat">
                <div className="sc-stat-val">{s.val}</div>
                <div className="sc-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`sc-toast${toast ? " show" : ""}`}>✓ CODE SUBMITTED SUCCESSFULLY</div>
      </div>
    </>
  );
}