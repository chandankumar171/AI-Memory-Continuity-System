import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  /* ================= AUTH ================= */
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLogin, setIsLogin] = useState(true);
  
  const showToast = (message) => {
  setToast(message);
  setTimeout(() => setToast(""), 3000);
};

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const getRelativeTime = (date) => {
  const today = new Date();
  const decisionDate = new Date(date);

  // Normalize both dates to midnight (local)
  today.setHours(0, 0, 0, 0);
  decisionDate.setHours(0, 0, 0, 0);

  const diffMs = today - decisionDate;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return `${Math.floor(diffDays / 365)} years ago`;
};

  /* ================= UI ================= */
  const [activeTab, setActiveTab] = useState("add");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  /* ================= DATA ================= */
  const [decisions, setDecisions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    intent: "",
    constraints: "",
    alternatives: "",
    finalChoice: "",
    reasoning: ""
  });

  /* ================= AI ================= */
  const [selectedDecision, setSelectedDecision] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [toast, setToast] = useState("");

  /* ================= EFFECTS ================= */
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (token) fetchDecisions();
  }, [token]);

  /* ================= AUTH FUNCTIONS ================= */
  const signup = async () => {
    await axios.post("http://localhost:5000/api/auth/signup", authData);
    alert("Signup successful. Please login.");
    setIsLogin(true);
  };

  const login = async () => {
    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      authData
    );
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setActiveTab("add");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  /* ================= DATA FUNCTIONS ================= */
  const fetchDecisions = async () => {
    const res = await axios.get("http://localhost:5000/api/decisions", {
      headers: { Authorization: token }
    });
    setDecisions(res.data);
  };

  const saveDecision = async () => {
    const payload = {
      ...form,
      constraints: form.constraints.split(","),
      alternatives: form.alternatives.split(",")
    };

    if (editingId) {
      await axios.put(
        `http://localhost:5000/api/decisions/${editingId}`,
        payload,
        { headers: { Authorization: token } }
      );
      setEditingId(null);
      setActiveTab("timeline");
    } else {
      await axios.post(
        "http://localhost:5000/api/decisions",
        payload,
        { headers: { Authorization: token } }
      );
      showToast("Decision saved successfully!");
    }

    setForm({
      title: "",
      intent: "",
      constraints: "",
      alternatives: "",
      finalChoice: "",
      reasoning: ""
    });

    fetchDecisions();
  };

  const editDecision = (d) => {
    setEditingId(d._id);
    setForm({
      title: d.title,
      intent: d.intent,
      constraints: d.constraints.join(","),
      alternatives: d.alternatives.join(","),
      finalChoice: d.finalChoice,
      reasoning: d.reasoning
    });
    setActiveTab("add");
  };

  const deleteDecision = async (id) => {
    if (!window.confirm("Delete this decision?")) return;

    await axios.delete(
      `http://localhost:5000/api/decisions/${id}`,
      { headers: { Authorization: token } }
    );
    fetchDecisions();
    showToast("Decision deleted successfully!");
  };

  /* ================= AI ================= */
  const askAI = async () => {
    if (!selectedDecision) {
      alert("Please select a decision");
      return;
    }

    const res = await axios.post(
      "http://localhost:5000/api/decisions/ai-recall",
      { question: aiQuestion, decisionId: selectedDecision },
      { headers: { Authorization: token } }
    );

    setAiResponse(res.data.advice);
  };

  /* ================= AUTH UI ================= */
  if (!token) {
    return (
      <div className="container">
        <div className="card auth-card">
          <h2>{isLogin ? "Login" : "Signup"}</h2>

          {!isLogin && (
            <input
              placeholder="Name"
              value={authData.name}
              onChange={(e) =>
                setAuthData({ ...authData, name: e.target.value })
              }
            />
          )}

          <input
            placeholder="Email"
            value={authData.email}
            onChange={(e) =>
              setAuthData({ ...authData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={authData.password}
            onChange={(e) =>
              setAuthData({ ...authData, password: e.target.value })
            }
          />

          <button className="primary" onClick={isLogin ? login : signup}>
            {isLogin ? "Login" : "Signup"}
          </button>

          <p
            style={{ cursor: "pointer", color: "#4f46e5" }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "New user? Signup" : "Already have an account? Login"}
          </p>
        </div>
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="container">
      {/* NAVBAR */}
      <div className="nav">
        <h1>IntentAI</h1>
        <div className="actions">
          <button
            className={`nav-btn ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            Add Decision
          </button>

          <button
            className={`nav-btn ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            Timeline
          </button>

          <button
            className={`nav-btn ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            Ask AI
          </button>

          <button
            className="secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>

          <button className="danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* ADD / EDIT */}
      {activeTab === "add" && (
        <div className="card">
          <h2>{editingId ? "Edit Decision" : "Add New Decision"}</h2>

          <input
            placeholder="Decision Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            placeholder="Intent / Goal"
            value={form.intent}
            onChange={(e) => setForm({ ...form, intent: e.target.value })}
          />

          <input
            placeholder="Constraints (comma separated)"
            value={form.constraints}
            onChange={(e) =>
              setForm({ ...form, constraints: e.target.value })
            }
          />

          <input
            placeholder="Alternatives (comma separated)"
            value={form.alternatives}
            onChange={(e) =>
              setForm({ ...form, alternatives: e.target.value })
            }
          />

          <input
            placeholder="Final Choice"
            value={form.finalChoice}
            onChange={(e) =>
              setForm({ ...form, finalChoice: e.target.value })
            }
          />

          <textarea
            placeholder="Reason behind the decision"
            value={form.reasoning}
            onChange={(e) =>
              setForm({ ...form, reasoning: e.target.value })
            }
          />

          <button className="primary" onClick={saveDecision}>
            {editingId ? "Update Decision" : "Save Decision"}
          </button>
        </div>
      )}

      {/* TIMELINE */}
      {activeTab === "timeline" && (
        <>
          <h2>Your Decision Timeline</h2>

          {decisions.map((d) => (
            <div className="card" key={d._id}>
              <h3>{d.title}</h3>
              <p><strong>Date:</strong> {new Date(d.createdAt).toLocaleDateString("en-GB", {
                day:"2-digit",
                month:"short",
                year:"numeric"
              })}</p>
              <p><strong>Intent:</strong> {d.intent}</p>
              <p><strong>Final Choice:</strong> {d.finalChoice}</p>
              <p><strong>Reasoning:</strong> {d.reasoning}</p>

              <div className="actions">
                <button className="secondary" onClick={() => editDecision(d)}>
                  Edit
                </button>
                <button className="danger" onClick={() => deleteDecision(d._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* AI */}
      {activeTab === "ai" && (
        <div className="card">
          <h2>Ask AI</h2>

          <select
            value={selectedDecision}
            onChange={(e) => setSelectedDecision(e.target.value)}
          >
            <option value="">Select decision</option>
            {decisions.map((d) => (
              <option key={d._id} value={d._id}>
                {d.title}
              </option>
            ))}
          </select>

          <input
            placeholder="Ask your question..."
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
          />

          <button className="primary" onClick={askAI}>
            Ask AI
          </button>

          {aiResponse && selectedDecision && (
  <div className="ai-box">
    <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "8px" }}>
      Based on your decision made on{" "}
      <strong>
        {new Date(
          decisions.find(d => d._id === selectedDecision)?.createdAt
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })}
      </strong>{" "}
      ({getRelativeTime(
        decisions.find(d => d._id === selectedDecision)?.createdAt
      )})
    </p>

    <div>{aiResponse}</div>
  </div>
)}
        </div>
      )}

      {toast && (
  <div className="toast">
    {toast}
  </div>
)}

    </div>
  );

}

export default App;