import { useEffect, useState } from "react";
import api from "./api/axios";
import "./App.css";

function App() {
  /* ================= AUTH ================= */
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLogin, setIsLogin] = useState(true);

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: ""
  });

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

  /* ================= TOAST ================= */
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ================= HELPERS ================= */
  const getRelativeTime = (date) => {
    const today = new Date();
    const d = new Date(date);

    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "today";
    if (diff === 1) return "yesterday";
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
    return `${Math.floor(diff / 365)} years ago`;
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (token) fetchDecisions();
  }, [token]);

  /* ================= AUTH ================= */
  const signup = async () => {
    await api.post("/api/auth/signup", authData);
    alert("Signup successful. Please login.");
    setIsLogin(true);
  };

  const login = async () => {
    const res = await api.post("/api/auth/login", authData);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setActiveTab("add");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  /* ================= DATA ================= */
  const fetchDecisions = async () => {
    const res = await api.get("/api/decisions");
    setDecisions(res.data);
  };

  const saveDecision = async () => {
    const payload = {
      ...form,
      constraints: form.constraints.split(","),
      alternatives: form.alternatives.split(",")
    };

    if (editingId) {
      await api.put(`/api/decisions/${editingId}`, payload);
      setEditingId(null);
      setActiveTab("timeline");
    } else {
      await api.post("/api/decisions", payload);
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
    await api.delete(`/api/decisions/${id}`);
    fetchDecisions();
    showToast("Decision deleted");
  };

  /* ================= AI ================= */
  const askAI = async () => {
    if (!selectedDecision) return alert("Select a decision");

    const res = await api.post("/api/decisions/ai-recall", {
      question: aiQuestion,
      decisionId: selectedDecision
    });

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

          <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
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
          <button onClick={() => setActiveTab("add")}>Add</button>
          <button onClick={() => setActiveTab("timeline")}>Timeline</button>
          <button onClick={() => setActiveTab("ai")}>Ask AI</button>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
          <button className="danger" onClick={logout}>Logout</button>
        </div>
      </div>

      {/* ADD */}
      {activeTab === "add" && (
        <div className="card">
          <h2>{editingId ? "Edit Decision" : "Add Decision"}</h2>

          <input placeholder="Title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />

          <input placeholder="Intent" value={form.intent}
            onChange={e => setForm({ ...form, intent: e.target.value })} />

          <input placeholder="Constraints (comma separated)" value={form.constraints}
            onChange={e => setForm({ ...form, constraints: e.target.value })} />

          <input placeholder="Alternatives (comma separated)" value={form.alternatives}
            onChange={e => setForm({ ...form, alternatives: e.target.value })} />

          <input placeholder="Final Choice" value={form.finalChoice}
            onChange={e => setForm({ ...form, finalChoice: e.target.value })} />

          <textarea placeholder="Reasoning" value={form.reasoning}
            onChange={e => setForm({ ...form, reasoning: e.target.value })} />

          <button className="primary" onClick={saveDecision}>
            {editingId ? "Update" : "Save"}
          </button>
        </div>
      )}

      {/* TIMELINE */}
      {activeTab === "timeline" && decisions.map(d => (
        <div className="card" key={d._id}>
          <h3>{d.title}</h3>
          <p>{d.intent}</p>
          <p>{d.finalChoice}</p>
          <p>{getRelativeTime(d.createdAt)}</p>

          <button onClick={() => editDecision(d)}>Edit</button>
          <button className="danger" onClick={() => deleteDecision(d._id)}>Delete</button>
        </div>
      ))}

      {/* AI */}
      {activeTab === "ai" && (
        <div className="card">
          <select value={selectedDecision}
            onChange={e => setSelectedDecision(e.target.value)}>
            <option value="">Select decision</option>
            {decisions.map(d => (
              <option key={d._id} value={d._id}>{d.title}</option>
            ))}
          </select>

          <input placeholder="Ask AI"
            value={aiQuestion}
            onChange={e => setAiQuestion(e.target.value)} />

          <button onClick={askAI}>Ask</button>

          {aiResponse && <div className="ai-box">{aiResponse}</div>}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;

