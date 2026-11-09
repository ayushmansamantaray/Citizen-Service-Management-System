import React, { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck, LayoutDashboard, FileText, MessageSquare, LogOut, Users,
  BriefcaseBusiness, Bell, Menu, X, Plus, Search, CheckCircle2, Clock3, AlertCircle
} from "lucide-react";
import api from "./api";

/* ============================================================
   AUTH CONTEXT
   ============================================================ */
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("csms_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("csms_token");
    if (token) {
      api.get("/auth/me")
        .then(r => setUser(r.data.user))
        .catch(() => { localStorage.clear(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("csms_token", data.token);
    localStorage.setItem("csms_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async form => {
    const { data } = await api.post("/auth/register", form);
    localStorage.setItem("csms_token", data.token);
    localStorage.setItem("csms_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("csms_token");
    localStorage.removeItem("csms_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ============================================================
   APP + ROUTE PROTECTION
   ============================================================ */
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/*" element={<Protected />} />
      </Routes>
    </AuthProvider>
  );
}

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading CSMS…</div>;
  return user ? <Shell /> : <Navigate to="/login" />;
}

/* ============================================================
   LOGIN / REGISTER PAGE
   ============================================================ */
function AuthPage({ register = false }) {
  const { login, register: signup, user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav("/dashboard"); }, [user]);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      register ? await signup(form) : await login(form.email, form.password);
      nav("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to continue");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="brand-mark"><ShieldCheck size={28} /></div>
        <div>
          <span className="eyebrow">DIGITAL PUBLIC SERVICES</span>
          <h1>Services made<br />simple for everyone.</h1>
          <p>A single place to apply, track requests and connect with your local service office.</p>
        </div>
        <div className="art-bottom">CITIZEN SERVICE MANAGEMENT SYSTEM <span>•</span> ACADEMIC DEMO</div>
      </div>

      <div className="auth-panel">
        <div className="auth-box">
          <div className="mobile-brand"><ShieldCheck /> CSMS</div>
          <span className="eyebrow">WELCOME {register ? "ABOARD" : "BACK"}</span>
          <h2>{register ? "Create your account" : "Sign in to CSMS"}</h2>
          <p className="muted">
            {register ? "Register as a citizen to access public services." : "Access your services and dashboard securely."}
          </p>

          <form onSubmit={submit} className="form-stack">
            {register && (
              <Field label="Full name">
                <input name="name" value={form.name} onChange={change} required placeholder="Your full name" />
              </Field>
            )}
            <Field label="Email address">
              <input type="email" name="email" value={form.email} onChange={change} required placeholder="you@example.com" />
            </Field>
            {register && (
              <Field label="Phone number">
                <input name="phone" value={form.phone} onChange={change} placeholder="Mobile number" />
              </Field>
            )}
            <Field label="Password">
              <input type="password" name="password" value={form.password} onChange={change} required minLength="8" placeholder="At least 8 characters" />
            </Field>
            {error && <div className="error">{error}</div>}
            <button className="btn primary full" disabled={busy}>
              {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            {register ? "Already registered?" : "New to the portal?"}{" "}
            <Link to={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link>
          </p>

          {!register && (
            <div className="demo-hint">
              <strong>Demo access</strong><br />
              Admin: admin@csms.local<br />
              Officer: officer@csms.local<br />
              Citizen: citizen@csms.local<br />
              Password: Password123!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

/* ============================================================
   SHELL (SIDEBAR + TOPBAR + ROUTES)
   ============================================================ */
function Shell() {
  const { user, logout } = useAuth();
  const [mobile, setMobile] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  const citizenLinks = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/services", label: "Browse services", icon: BriefcaseBusiness },
    { to: "/applications", label: "My applications", icon: FileText },
    { to: "/complaints", label: "Complaints", icon: MessageSquare },
    { to: "/notifications", label: "Notifications", icon: Bell }
  ];
  const adminLinks = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/applications", label: "Applications", icon: FileText },
    { to: "/services", label: "Manage services", icon: BriefcaseBusiness },
    { to: "/complaints", label: "Complaints", icon: MessageSquare },
    { to: "/team", label: "Officer accounts", icon: Users }
  ];
  const officerLinks = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/applications", label: "Applications", icon: FileText },
    { to: "/complaints", label: "Complaints", icon: MessageSquare },
    { to: "/notifications", label: "Notifications", icon: Bell }
  ];
  const links = user.role === "citizen" ? citizenLinks : user.role === "admin" ? adminLinks : officerLinks;

  const signout = () => { logout(); nav("/login"); };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <div className="side-brand">
          <div className="brand-mark small"><ShieldCheck /></div>
          <div><b>CSMS</b><small>Citizen Services</small></div>
          <button className="mobile-close" onClick={() => setMobile(false)}><X /></button>
        </div>

        <div className="side-label">WORKSPACE</div>
        <nav>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobile(false)}
              className={location.pathname === l.to ? "nav-link active" : "nav-link"}
            >
              <l.icon size={18} />{l.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div><b>{user.name}</b><small>{user.role}</small></div>
          </div>
          <button className="nav-link logout" onClick={signout}><LogOut size={18} />Sign out</button>
        </div>
      </aside>

      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobile(true)}><Menu /></button>
          <div className="crumb">
            Workspace <span>/</span> <b>{links.find(l => l.to === location.pathname)?.label || "Dashboard"}</b>
          </div>
          <div className="top-user">
            <span className="role-chip">{user.role}</span>
            <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          </div>
        </header>

        <div className="page-wrap">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/team" element={<Team />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          <footer>CSMS Academic Project <span>•</span> MERN Stack Demonstration</footer>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   SHARED UI PIECES
   ============================================================ */
function PageTitle({ eyebrow, title, desc, action }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone = "blue", note }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-value">{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
      {note && <small>{note}</small>}
    </div>
  );
}

function Status({ value }) {
  let cls = "amber";
  if (value === "Approved" || value === "Completed" || value === "Resolved") cls = "green";
  else if (value === "Rejected" || value === "Closed") cls = "red";
  else if (value === "Submitted" || value === "Open") cls = "blue";
  return <span className={`status ${cls}`}>{value}</span>;
}

function Empty({ text }) {
  return (
    <div className="empty">
      <div className="empty-icon"><FileText /></div>
      {text}
    </div>
  );
}

function Modal({ title, close, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button onClick={close}><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD  (Total applications + Total applicants added here)
   ============================================================ */
function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null); // { totalApplications, totalApplicants }
  const [apps, setApps] = useState([]);
  const [services, setServices] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
  const load = async () => {
    // Total applications and applicants come straight from the database
    try {
      const m = await api.get("/applications/stats/summary");
      setSummary(m.data);
    } catch (e) {
      console.error("summary failed", e.response?.status, e.response?.data);
    }

    // The other requests are independent, so one failure can't zero the totals
    if (user.role === "citizen") {
      const [a, s, c] = await Promise.allSettled([
        api.get("/applications/my"),
        api.get("/services"),
        api.get("/complaints/my")
      ]);
      if (a.status === "fulfilled") setApps(a.value.data); else console.error("applications failed", a.reason);
      if (s.status === "fulfilled") setServices(s.value.data); else console.error("services failed", s.reason);
      if (c.status === "fulfilled") setComplaints(c.value.data); else console.error("complaints failed", c.reason);
    } else {
      const [st, a] = await Promise.allSettled([
        api.get("/users/stats"),
        api.get("/applications")
      ]);
      if (st.status === "fulfilled") setStats(st.value.data); else console.error("user stats failed", st.reason);
      if (a.status === "fulfilled") setApps(a.value.data); else console.error("applications failed", a.reason);
    }
  };
  load();
}, [user.role]);

  const citizen = user.role === "citizen";
  const countStatus = s => apps.filter(a => a.status === s).length;

  const quickLinks = citizen
    ? [
        ["Browse services", "Explore available certificates and services", "/services", BriefcaseBusiness],
        ["Track applications", "Check the latest application updates", "/applications", FileText],
        ["Raise a complaint", "Tell us about an issue", "/complaints", MessageSquare]
      ]
    : [
        ["Review applications", "Open the application work queue", "/applications", FileText],
        ["Manage complaints", "Review citizen feedback and issues", "/complaints", MessageSquare],
        ...(user.role === "admin"
          ? [["Manage services", "Update the service catalogue", "/services", BriefcaseBusiness]]
          : [])
      ];

  return (
    <>
      <PageTitle
        eyebrow={`GOOD DAY, ${user.name?.split(" ")[0]?.toUpperCase()}`}
        title={citizen ? "Your service overview" : user.role === "admin" ? "Administration overview" : "Officer workspace"}
        desc={citizen
          ? "Keep track of your applications and discover available services."
          : "Monitor requests and keep citizen services moving."}
        action={citizen && (
          <Link className="btn primary" to="/services"><Plus size={17} /> Apply for service</Link>
        )}
      />

      {/* ---------- STAT CARDS ---------- */}
      <div className="stats-grid">
        {citizen ? (
          <>
            <Stat label="Total applications" value={summary?.totalApplications ?? apps.length} icon={FileText} />
            <Stat label="Under review" value={countStatus("Under Review") + countStatus("Submitted")} icon={Clock3} tone="amber" />
            <Stat label="Approved" value={countStatus("Approved") + countStatus("Completed")} icon={CheckCircle2} tone="green" />
            <Stat
              label="Open complaints"
              value={complaints.filter(c => c.status !== "Resolved" && c.status !== "Closed").length}
              icon={MessageSquare}
              tone="violet"
            />
          </>
        ) : (
          <>
            <Stat label="Total applications" value={summary?.totalApplications} icon={FileText}/>
            <Stat label="Total applicants" value={summary?.totalApplicants} icon={Users} tone="blue" />
            <Stat label="Pending review" value={stats?.pending} icon={Clock3} tone="amber" />
            <Stat label="Approved / completed" value={stats?.approved} icon={CheckCircle2} tone="green" />
            <Stat label="Registered citizens" value={stats?.citizens} icon={Users} tone="violet" />
          </>
        )}
      </div>

      {/* ---------- QUEUE + QUICK ACCESS ---------- */}
      <div className="content-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>{citizen ? "Recent applications" : "Application queue"}</h3>
              <p>{citizen ? "Your latest service requests" : "Most recently submitted requests"}</p>
            </div>
            <Link to="/applications" className="text-link">View all →</Link>
          </div>
          <ApplicationsTable items={apps.slice(0, 5)} citizen={citizen} />
        </section>

        <section className="panel quick-panel">
          <div className="panel-head">
            <div><h3>Quick access</h3><p>Common actions</p></div>
          </div>
          {quickLinks.map(([t, d, to, I]) => (
            <Link className="quick-item" to={to} key={to}>
              <div className="quick-icon"><I size={18} /></div>
              <div><b>{t}</b><small>{d}</small></div>
              <span>→</span>
            </Link>
          ))}
        </section>
      </div>

      {/* ---------- SERVICE STRIP / WORK STATUS ---------- */}
      <section className="panel service-strip">
        <div className="panel-head">
          <div>
            <h3>{citizen ? "Available services" : "Work status"}</h3>
            <p>{citizen ? "Services you can request through this portal" : "A snapshot of the current queue"}</p>
          </div>
          {citizen && <Link to="/services" className="text-link">Browse all →</Link>}
        </div>

        {citizen ? (
          <div className="service-cards">
            {services.slice(0, 3).map(s => (
              <div className="service-card" key={s._id}>
                <div className="service-symbol"><BriefcaseBusiness /></div>
                <b>{s.name}</b>
                <p>{s.description}</p>
                <span>{s.processingDays} day estimate</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="status-note">
            <AlertCircle size={19} /> {apps.length} applications are visible in your current work queue.
          </div>
        )}
      </section>
    </>
  );
}

function ApplicationsTable({ items, citizen = false }) {
  if (!items.length) return <Empty text="No applications to display yet." />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Service</th>
            {!citizen && <th>Citizen</th>}
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map(a => (
            <tr key={a._id}>
              <td><b className="id-text">{a.applicationId}</b></td>
              <td>{a.service?.name || "—"}</td>
              {!citizen && <td>{a.citizen?.name || "—"}</td>}
              <td>{new Date(a.createdAt).toLocaleDateString()}</td>
              <td><Status value={a.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   SERVICES
   ============================================================ */
function Services() {
  const { user } = useAuth();
  const emptyForm = { name: "", description: "", department: "Citizen Services", processingDays: 7, fee: 0, requiredDocuments: "" };
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const load = () =>
    api.get("/services")
      .then(r => setItems(r.data))
      .catch(e => setError(e.response?.data?.message || "Could not load services"));

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post("/services", {
        ...form,
        requiredDocuments: form.requiredDocuments.split(",").map(x => x.trim()).filter(Boolean)
      });
      setModal(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to save service");
    }
  };

  const remove = async id => {
    if (confirm("Deactivate this service?")) {
      await api.delete(`/services/${id}`);
      load();
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="SERVICE DIRECTORY"
        title={user.role === "admin" ? "Manage services" : "Explore services"}
        desc="Find the service you need and review its requirements."
        action={user.role === "admin" && (
          <button className="btn primary" onClick={() => setModal(true)}><Plus size={17} /> Add service</button>
        )}
      />
      {error && <div className="error">{error}</div>}

      <div className="service-grid">
        {items.map(s => (
          <div className="service-tile" key={s._id}>
            <div className="tile-top">
              <div className="service-symbol"><BriefcaseBusiness /></div>
              <span className="department">{s.department}</span>
            </div>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <div className="service-meta">
              <span><Clock3 size={14} /> {s.processingDays} working days</span>
              <span>Fee: ₹{s.fee}</span>
            </div>
            <div className="requirements">
              <b>Required documents</b>
              <div>{(s.requiredDocuments || []).map(d => <span key={d}>{d}</span>)}</div>
            </div>
            {user.role === "citizen" ? (
              <Link className="btn primary full" to={`/applications?service=${s._id}`}>Apply now <span>→</span></Link>
            ) : (
              user.role === "admin" && (
                <button className="btn danger-outline full" onClick={() => remove(s._id)}>Deactivate service</button>
              )
            )}
          </div>
        ))}
      </div>

      {modal && (
        <Modal title="Add a government service" close={() => setModal(false)}>
          <form className="form-stack" onSubmit={submit}>
            <Field label="Service name">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Department">
              <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            </Field>
            <Field label="Required documents (comma separated)">
              <input value={form.requiredDocuments} onChange={e => setForm({ ...form, requiredDocuments: e.target.value })} />
            </Field>
            <div className="form-row">
              <Field label="Processing days">
                <input type="number" min="1" value={form.processingDays} onChange={e => setForm({ ...form, processingDays: e.target.value })} />
              </Field>
              <Field label="Fee (₹)">
                <input type="number" min="0" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} />
              </Field>
            </div>
            <button className="btn primary full">Save service</button>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   APPLICATIONS
   ============================================================ */
function Applications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ service: "", applicantName: user.name, details: "" });
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const citizen = user.role === "citizen";

  const load = () =>
    api.get(citizen ? "/applications/my" : "/applications")
      .then(r => setItems(r.data))
      .catch(e => setError(e.response?.data?.message || "Could not load applications"));

  useEffect(() => {
    load();
    if (citizen) {
      api.get("/services").then(r => setServices(r.data));
      const p = new URLSearchParams(window.location.search);
      if (p.get("service")) setForm(f => ({ ...f, service: p.get("service") }));
    } else if (user.role === "admin") {
      api.get("/users/officers").then(r => setOfficers(r.data));
    }
  }, []);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append("documents", f));
      await api.post("/applications", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSelected(null);
      setFiles([]);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to submit application");
    } finally {
      setBusy(false);
    }
  };

  const update = async (id, status, remarks) => {
    try {
      await api.put(`/applications/${id}/status`, { status, remarks });
      load();
      setSelected(null);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update status");
    }
  };

  const assign = async (id, officerId) => {
    try {
      await api.put(`/applications/${id}/assign`, { officerId });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to assign officer");
    }
  };

  const filtered = filter === "All" ? items : items.filter(a => a.status === filter);

  return (
    <>
      <PageTitle
        eyebrow="APPLICATION CENTRE"
        title={citizen ? "My applications" : "Application management"}
        desc={citizen
          ? "Submit new requests and track every stage of processing."
          : "Review, assign and process citizen service requests."}
        action={citizen && (
          <button className="btn primary" onClick={() => setSelected({ new: true })}><Plus size={17} /> New application</button>
        )}
      />
      {error && <div className="error">{error}</div>}

      <div className="filter-row">
        <div className="searchbox"><Search size={16} /><span>{items.length} total records</span></div>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option>
          {["Submitted", "Under Review", "Document Required", "Approved", "Rejected", "Completed"].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {citizen ? (
        <div className="panel"><ApplicationsTable items={filtered} citizen /></div>
      ) : (
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Citizen</th>
                  <th>Service</th>
                  <th>Assigned officer</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a._id}>
                    <td><b className="id-text">{a.applicationId}</b></td>
                    <td>
                      {a.citizen?.name}
                      <small className="cell-sub">{a.citizen?.email}</small>
                    </td>
                    <td>{a.service?.name}</td>
                    <td>
                      {user.role === "admin" ? (
                        <select className="compact-select" value={a.officer?._id || ""} onChange={e => assign(a._id, e.target.value)}>
                          <option value="">Unassigned</option>
                          {officers.map(o => <option value={o._id} key={o._id}>{o.name}</option>)}
                        </select>
                      ) : (
                        a.officer?.name || "Unassigned"
                      )}
                    </td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><Status value={a.status} /></td>
                    <td><button className="btn small-btn" onClick={() => setSelected(a)}>Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <Empty text="No applications match this filter." />}
          </div>
        </div>
      )}

      {selected?.new && (
        <Modal title="Submit a service application" close={() => setSelected(null)}>
          <form className="form-stack" onSubmit={submit}>
            <Field label="Select service">
              <select required value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                <option value="">Choose a service</option>
                {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Applicant name">
              <input required value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })} />
            </Field>
            <Field label="Application details">
              <textarea value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder="Provide relevant details…" />
            </Field>
            <Field label="Supporting documents (PDF/JPG/PNG, max 5 MB each)">
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFiles([...e.target.files].slice(0, 5))} />
            </Field>
            {files.length > 0 && <small>{files.map(f => f.name).join(", ")}</small>}
            <button className="btn primary full" disabled={busy}>{busy ? "Submitting…" : "Submit application"}</button>
          </form>
        </Modal>
      )}

      {selected && !selected.new && (
        <ReviewModal item={selected} close={() => setSelected(null)} update={update} user={user} />
      )}
    </>
  );
}

function ReviewModal({ item, close, update, user }) {
  const [status, setStatus] = useState(item.status);
  const [remarks, setRemarks] = useState(item.remarks || "");

  return (
    <Modal title={`Review ${item.applicationId}`} close={close}>
      <div className="review-summary">
        <b>{item.service?.name}</b>
        <span>{item.citizen?.name} · {item.citizen?.email}</span>
        <Status value={item.status} />
      </div>
      <p className="review-details">{item.details || "No additional details supplied."}</p>

      <h4>Supporting documents</h4>
      {item.documents?.length ? (
        item.documents.map(d => (
          <a className="doc-link" key={d.filename} href={`http://localhost:5000${d.path}`} target="_blank" rel="noreferrer">
            <FileText size={16} />{d.originalName} ↗
          </a>
        ))
      ) : (
        <p className="muted">No documents uploaded.</p>
      )}

      {user.role !== "citizen" && (
        <form
          className="form-stack"
          onSubmit={e => { e.preventDefault(); update(item._id, status, remarks); }}
        >
          <Field label="Update status">
            <select value={status} onChange={e => setStatus(e.target.value)}>
              {["Under Review", "Document Required", "Approved", "Rejected", "Completed"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Remarks for citizen">
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add a note or explain what is needed…" />
          </Field>
          <button className="btn primary full">Save update</button>
        </form>
      )}

      {user.role === "citizen" && (
        <div className="remark-box">
          <b>Officer remarks</b>
          <p>{item.remarks || "No remarks yet."}</p>
        </div>
      )}
    </Modal>
  );
}

/* ============================================================
   COMPLAINTS
   ============================================================ */
function Complaints() {
  const { user } = useAuth();
  const citizen = user.role === "citizen";
  const emptyForm = { subject: "", description: "", category: "General" };
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () =>
    api.get(citizen ? "/complaints/my" : "/complaints")
      .then(r => setItems(r.data))
      .catch(e => setError(e.response?.data?.message || "Could not load complaints"));

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post("/complaints", form);
      setModal(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to submit complaint");
    }
  };

  const update = async (id, status, response) => {
    try {
      await api.put(`/complaints/${id}`, { status, response });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update complaint");
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="CITIZEN FEEDBACK"
        title="Complaint management"
        desc={citizen ? "Raise an issue and follow its resolution." : "Review citizen complaints and record a response."}
        action={citizen && (
          <button className="btn primary" onClick={() => setModal(true)}><Plus size={17} /> Raise complaint</button>
        )}
      />
      {error && <div className="error">{error}</div>}

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Subject</th>
                {!citizen && <th>Citizen</th>}
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                {!citizen && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c._id}>
                  <td><b className="id-text">{c.complaintId}</b></td>
                  <td>{c.subject}<small className="cell-sub">{c.response}</small></td>
                  {!citizen && <td>{c.citizen?.name}</td>}
                  <td>{c.category}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td><Status value={c.status} /></td>
                  {!citizen && <td><ComplaintAction item={c} update={update} /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!items.length && <Empty text="No complaints found." />}
      </div>

      {modal && (
        <Modal title="Raise a complaint" close={() => setModal(false)}>
          <form className="form-stack" onSubmit={submit}>
            <Field label="Subject">
              <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {["General", "Application delay", "Website issue", "Staff conduct", "Other"].map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Describe the issue">
              <textarea required rows="5" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Field>
            <button className="btn primary full">Submit complaint</button>
          </form>
        </Modal>
      )}
    </>
  );
}

function ComplaintAction({ item, update }) {
  const [status, setStatus] = useState(item.status);
  const [response, setResponse] = useState(item.response || "");

  return (
    <div className="complaint-action">
      <select value={status} onChange={e => setStatus(e.target.value)}>
        {["Open", "In Progress", "Resolved", "Closed"].map(s => <option key={s}>{s}</option>)}
      </select>
      <button className="btn small-btn" onClick={() => update(item._id, status, response)}>Save</button>
      <input placeholder="Response" value={response} onChange={e => setResponse(e.target.value)} />
    </div>
  );
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function Notifications() {
  const [items, setItems] = useState([]);

  const load = () => api.get("/notifications").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const read = async id => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  return (
    <>
      <PageTitle eyebrow="UPDATES" title="Notifications" desc="Application and complaint updates from the service desk." />
      <div className="panel notification-list">
        {items.map(n => (
          <div className={`notification ${n.read ? "read" : ""}`} key={n._id}>
            <div className="notification-dot" />
            <div>
              <b>{n.message}</b>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
            {!n.read && <button className="text-link" onClick={() => read(n._id)}>Mark read</button>}
          </div>
        ))}
        {!items.length && <Empty text="You're all caught up. No notifications yet." />}
      </div>
    </>
  );
}

/* ============================================================
   TEAM (ADMIN: OFFICER ACCOUNTS)
   ============================================================ */
function Team() {
  const emptyForm = { name: "", email: "", password: "Password123!" };
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => api.get("/users/officers").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users/officers", form);
      setForm(emptyForm);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to create officer");
    }
  };

  return (
    <>
      <PageTitle eyebrow="TEAM MANAGEMENT" title="Officer accounts" desc="Create officer logins for application verification." />
      <div className="content-grid team-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Create an officer</h3>
              <p>New officers can sign in and process applications.</p>
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <form className="form-stack" onSubmit={submit}>
            <Field label="Officer name">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email address">
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Temporary password">
              <input type="text" minLength="8" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </Field>
            <button className="btn primary">Create officer account</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Active officers</h3>
              <p>{items.length} accounts</p>
            </div>
          </div>
          {items.map(o => (
            <div className="team-person" key={o._id}>
              <div className="avatar">{o.name[0]}</div>
              <div><b>{o.name}</b><small>{o.email}</small></div>
              <Status value="Active" />
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

export default App;
