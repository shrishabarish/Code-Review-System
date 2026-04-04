import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ❌ No token → redirect
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // ✅ Only admin reaches here
      const fetchLogs = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/logs", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          setLogs(data);
        } catch (err) {
          console.error("Error fetching logs:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchLogs();

    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/login");
    }

  }, [navigate]);

  return (
    <div style={{ padding: "20px", color: "white", background: "#05070f", minHeight: "100vh" }}>
      <h2>System Logs (Admin Only)</h2>

      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No logs found</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td>{log.userId}</td>
                <td>{log.action}</td>
                <td>{log.module}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Logs;