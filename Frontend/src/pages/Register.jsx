import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]           = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]         = useState("");
  const [apiError, setApiError]   = useState("");
  const [success, setSuccess]     = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!form.name.trim())  { setError("Full name is required"); return; }
    if (!form.email.trim()) { setError("Email is required"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Registration failed");
        return;
      }

      // Auto-login after registration
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role || "USER");

      setSuccess(true);

    } catch (err) {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Weak", "Fair", "Strong", "Very strong"][strength];
  const strengthColor = ["", "#ff4455", "#ff8c00", "#f0b429", "#00c8ff", "#00e87a"][strength];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .rg-wrap {
          background: #080d14; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 32px 20px; font-family: 'Space Grotesk', sans-serif;
          color: #e2f0ff; position: relative; overflow: hidden;
        }
        .rg-wrap::before {
          content: ''; position: absolute; inset: 0;
          background:
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,200,255,.03) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,200,255,.03) 40px);
          pointer-events: none;
        }
        .rg-corner { position: absolute; width: 18px; height: 18px; border-color: #00c8ff; border-style: solid; opacity: .45; }
        .rg-corner.tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
        .rg-corner.tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
        .rg-corner.bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
        .rg-corner.br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }
        .rg-card {
          background: #0d1a27; border: 1px solid #0e2e47; border-radius: 4px;
          padding: 36px 32px; width: 100%; max-width: 440px; position: relative;
        }
        .rg-card::before {
          content: 'NEW USER // v2.4.1'; position: absolute; top: -10px; left: 16px;
          background: #0d1a27; padding: 0 8px;
          font-family: 'Space Mono', monospace; font-size: 9px; color: #00c8ff; letter-spacing: 2px;
        }
        .rg-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #00c8ff, transparent); opacity: .4;
        }
        .rg-header { text-align: center; margin-bottom: 28px; }
        .rg-sys { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #00c8ff; opacity: .7; margin-bottom: 10px; }
        .rg-title { font-family: 'Space Mono', monospace; font-size: 22px; font-weight: 700; color: #fff; letter-spacing: 2px; text-transform: uppercase; }
        .rg-sub { font-size: 13px; color: #5a7fa0; margin-top: 6px; letter-spacing: .5px; }
        .rg-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .rg-field label { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3a7a9c; text-transform: uppercase; }
        .rg-input-wrap { position: relative; }
        .rg-input {
          width: 100%; background: #060e18; border: 1px solid #0e2e47; border-radius: 2px;
          color: #c8dff0; padding: 11px 14px; font-family: 'Space Grotesk', sans-serif;
          font-size: 14px; outline: none; transition: border-color .2s, box-shadow .2s;
        }
        .rg-input:focus { border-color: #00c8ff; box-shadow: 0 0 0 2px rgba(0,200,255,.08); }
        .rg-input.has-toggle { padding-right: 44px; }
        .rg-input.invalid { border-color: #ff4455 !important; box-shadow: 0 0 0 2px rgba(255,68,85,.08) !important; }
        .rg-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-family: 'Space Mono', monospace; font-size: 9px; color: #3a7a9c;
          letter-spacing: 1px; text-transform: uppercase; padding: 4px; transition: color .2s;
        }
        .rg-toggle:hover { color: #00c8ff; }
        .rg-strength { margin-top: 8px; }
        .rg-strength-bars { display: flex; gap: 4px; margin-bottom: 4px; }
        .rg-bar { flex: 1; height: 2px; background: #0e2e47; border-radius: 2px; transition: background .3s; }
        .rg-strength-label { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 1px; transition: color .3s; }
        .rg-error {
          background: rgba(255,68,85,.08); border: 1px solid rgba(255,68,85,.3); border-radius: 2px;
          padding: 10px 14px; font-family: 'Space Mono', monospace;
          font-size: 11px; color: #ff6677; letter-spacing: 1px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .rg-divider { border: none; border-top: 1px solid #0e2e47; margin: 20px 0; }
        .rg-btn {
          width: 100%; background: #00c8ff; color: #060e18;
          font-family: 'Space Mono', monospace; font-size: 13px; letter-spacing: 3px;
          text-transform: uppercase; border: none; border-radius: 2px; padding: 14px;
          cursor: pointer; font-weight: 700; transition: background .2s, transform .1s;
        }
        .rg-btn:hover { background: #33d4ff; }
        .rg-btn:active { transform: scale(0.98); }
        .rg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rg-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #3a6080; }
        .rg-footer span { color: #00c8ff; cursor: pointer; font-weight: 500; }
        .rg-footer span:hover { text-decoration: underline; }
        .rg-success { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px 0; text-align: center; }
        .rg-success-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(0,232,122,.1); border: 1px solid rgba(0,232,122,.3); display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .rg-success-title { font-family: 'Space Mono', monospace; font-size: 16px; color: #00e87a; letter-spacing: 2px; text-transform: uppercase; }
        .rg-success-sub { font-size: 13px; color: #5a7fa0; }
        .rg-status { display: flex; justify-content: center; gap: 24px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #0a1e30; }
        .rg-stat { text-align: center; }
        .rg-stat-val { font-family: 'Space Mono', monospace; font-size: 14px; color: #00c8ff; font-weight: 700; }
        .rg-stat-lbl { font-size: 10px; color: #2a5a7a; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
        .rg-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #00e87a; margin-right: 6px; animation: rg-blink 1.2s ease-in-out infinite; }
        @keyframes rg-blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .rg-live { font-family: 'Space Mono', monospace; font-size: 10px; color: #3a7a9c; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; }
        @media (max-width: 480px) { .rg-card { padding: 28px 18px; } }
      `}</style>

      <div className="rg-wrap">
        <div className="rg-corner tl" /><div className="rg-corner tr" />
        <div className="rg-corner bl" /><div className="rg-corner br" />

        <div className="rg-card">
          {success ? (
            <div className="rg-success">
              <div className="rg-success-icon">✓</div>
              <div className="rg-success-title">Access Granted</div>
              <div className="rg-success-sub">Your account has been created successfully.</div>
              {/* FIX: navigate to /dashboard after registration (user is already logged in) */}
              <button className="rg-btn" style={{ marginTop: 8 }} onClick={() => navigate("/dashboard")}>
                Go to Dashboard →
              </button>
            </div>
          ) : (
            <>
              <div className="rg-header">
                <div className="rg-sys">— CODE REVIEW SYSTEM · v2.4.1 —</div>
                <div className="rg-title">Create Account</div>
                <div className="rg-sub">Join the Code Review System</div>
              </div>

              {(error || apiError) && (
                <div className="rg-error">
                  <span>!</span> {error || apiError}
                </div>
              )}

              <div className="rg-field">
                <label>Full Name</label>
                <input name="name" type="text" className="rg-input"
                  placeholder="Enter your full name"
                  value={form.name} onChange={handleChange} />
              </div>

              <div className="rg-field">
                <label>Email</label>
                <input name="email" type="email" className="rg-input"
                  placeholder="Enter your email"
                  value={form.email} onChange={handleChange} />
              </div>

              <div className="rg-field">
                <label>Password</label>
                <div className="rg-input-wrap">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    className={`rg-input has-toggle${error && error.includes("Password") ? " invalid" : ""}`}
                    placeholder="Create password"
                    value={form.password} onChange={handleChange}
                  />
                  <button className="rg-toggle" onClick={() => setShowPass(!showPass)} type="button">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                {form.password && (
                  <div className="rg-strength">
                    <div className="rg-strength-bars">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="rg-bar" style={{ background: i <= strength ? strengthColor : undefined }} />
                      ))}
                    </div>
                    <div className="rg-strength-label" style={{ color: strengthColor }}>{strengthLabel}</div>
                  </div>
                )}
              </div>

              <div className="rg-field">
                <label>Confirm Password</label>
                <div className="rg-input-wrap">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    className={`rg-input has-toggle${error && error.includes("match") ? " invalid" : ""}`}
                    placeholder="Confirm password"
                    value={form.confirmPassword} onChange={handleChange}
                  />
                  <button className="rg-toggle" onClick={() => setShowConfirm(!showConfirm)} type="button">
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <hr className="rg-divider" />

              <button className="rg-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating Account…" : "Create Account →"}
              </button>

              {/* FIX: correct route /login instead of /Login1 */}
              <p className="rg-footer">
                Already have an account? <span onClick={() => navigate("/login")}>Login</span>
              </p>
            </>
          )}

          <div className="rg-status">
            <div className="rg-live"><span className="rg-dot" />System online</div>
            <div className="rg-stat"><div className="rg-stat-val">97.3%</div><div className="rg-stat-lbl">Uptime</div></div>
            <div className="rg-stat"><div className="rg-stat-val">256-bit</div><div className="rg-stat-lbl">Encryption</div></div>
          </div>
        </div>
      </div>
    </>
  );
}