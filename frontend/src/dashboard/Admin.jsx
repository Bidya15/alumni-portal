import React, { useState, useEffect } from "react";
import { useApp, DEPARTMENTS } from "../context/AppContext";
import { exportCSV, exportJSON } from "../utils/export";
import { timeAgo, initials, avatarColor, fmtDate, POST_TYPE_META } from "../utils/helpers";
import AvatarImg from "../components/AvatarImg";
import d from "./dashboard.module.css";

// ─── Stat Card (New Glass Version) ─────────────
function GlassStat({ icon, num, label, type }) {
    return (
        <div className={`${d.glassStatCard} ${d[type + 'Stat']}`}>
            <div className={d.glassStatHeader}>
                <div className={d.glassStatIcon}>{icon}</div>
                <div className={d.glassStatLabel}>{label}</div>
            </div>
            <div className={d.glassStatNum}>{num}</div>
        </div>
    );
}

// ─── Overview ─────────────────────────
function Overview() {
    const {
        pendingAlumni, posts, currentUser,
        fetchPendingAlumni, fetchDashboardStats, dashboardStats,
        setTab, notify
    } = useApp();

    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN";

    useEffect(() => {
        fetchPendingAlumni();
        fetchDashboardStats();
    }, []);

    const pending = pendingAlumni.filter(u => {
        if (u.status !== "PENDING") return false;
        if (isSuper) return (u.role === "ROLE_ALUMNI" || u.role === "ROLE_ADMIN");
        // Dept Admin only sees alumni from their department
        return (u.role === "ROLE_ALUMNI" && u.department === currentUser?.department);
    });

    if (!dashboardStats) return <div className="loading-dots" style={{ padding: '40px' }}>Scanning system metrics...</div>;

    return (
        <div className={d.innerCard}>
            {/* Welcome Hero */}
            <div className={d.dashHero}>
                <div>
                    <h1 className={d.heroTitle}>Welcome back, {currentUser?.name.split(' ')[0]}! 👋</h1>
                    <p className={d.heroSub}>
                        {isSuper 
                            ? "Global system oversight and administrative control hub." 
                            : `${currentUser?.department || 'Regional'} alumni management and engagement oversight.`}
                    </p>
                </div>
                <div className={d.heroBadge}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '30px', fontSize: '12px', fontWeight: '700' }}>
                        📅 {fmtDate(new Date())}
                    </div>
                </div>
            </div>

            {/* Glass Statistics */}
            <div className={d.glassGrid}>
                <GlassStat icon="👥" num={dashboardStats.totalUsers || 0} label="Total Network" type="indigo" />
                <GlassStat icon="✅" num={dashboardStats.verifiedAlumni || 0} label="Verified Alumni" type="emerald" />
                <GlassStat icon="⏳" num={dashboardStats.pendingAlumni || 0} label="Awaiting Review" type="amber" />
                <GlassStat icon="📝" num={dashboardStats.totalPosts || 0} label="Active Contributions" type="rose" />
            </div>

            <div className={d.dashContentGrid}>
                {/* Left Column: Needs Attention / Recent Activity */}
                <div className="flex-col gap-24">
                    {pending.length > 0 ? (
                        <div className={d.contentBox}>
                            <div className={d.contentBoxTitle}>
                                <span style={{ fontSize: '20px' }}>⏳</span> Needs Attention
                            </div>
                            <div className="pend-grid">
                                {pending.slice(0, 4).map(u => <PendCard key={u.id} u={u} />)}
                            </div>
                        </div>
                    ) : (
                        <div className={d.contentBox}>
                            <div className={d.contentBoxTitle}>
                                <span style={{ fontSize: '20px' }}>🌟</span> Recent Registrations
                            </div>
                            <div className="flex-col">
                                {dashboardStats.recentUsers?.map(u => (
                                    <div key={u.id} className={d.recentUserItem}>
                                        <AvatarImg user={u} className="avatar avatar-sm" />
                                        <div className={d.recentUserInfo}>
                                            <div className={d.recentUserName}>{u.name}</div>
                                            <div className={d.recentUserSub}>{u.degree || "User"} · Class of {u.batch || "N/A"}</div>
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                                            {timeAgo(u.createdAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Mini Stats / Locations */}
                <div className="flex-col gap-24">
                    <div className={d.contentBox}>
                        <div className={d.contentBoxTitle}>
                            <span style={{ fontSize: '20px' }}>📍</span> Global Hotspots
                        </div>
                        <div className={d.locationList}>
                            {dashboardStats.topLocations?.map((loc) => (
                                <div key={loc.name} className={d.locationItem}>
                                    <span>{loc.name}</span>
                                    <span className={d.locationCount}>{loc.count} alumni</span>
                                </div>
                            ))}
                            {(!dashboardStats.topLocations || dashboardStats.topLocations.length === 0) && (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-400)', fontSize: '13px' }}>
                                    Location data will appear as alumni update profiles.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={d.contentBox} style={{ background: 'linear-gradient(to bottom, #f8fafc, #fff)' }}>
                        <div className={d.contentBoxTitle}>
                            <span style={{ fontSize: '20px' }}>🚀</span> Quick Actions
                        </div>
                        <div className="flex-col gap-10">
                            <button className="btn btn-outline btn-sm w-full" onClick={() => setTab("export")}>📊 Generate Report</button>
                            <button className="btn btn-outline btn-sm w-full" onClick={() => setTab("email-campaign")}>📧 Email Campaign</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PendCard({ u }) {
    const { approve, reject, notify } = useApp();
    return (
        <div className="pend-card">
            <div className="card-user">
                <AvatarImg user={u} className="avatar avatar-md" />
                <div>
                    <div className="td-name">{u.name}</div>
                    <div className="td-sub">{u.degree} · Batch {u.batch}</div>
                </div>
            </div>
            <div className="user-meta">
                {u.company && <span>🏢 {u.company} · {u.designation}  </span>}
                {u.location && <span>📍 {u.location}</span>}
            </div>
            <div className="card-actions">
                <button className="btn btn-green btn-sm flex-1" onClick={() => approve(u.id)}>✓ Approve</button>
                <button className="btn btn-red   btn-sm flex-1" onClick={() => reject(u.id)}>✗ Reject</button>
            </div>
        </div>
    );
}

// ─── Pending ──────────────────────────
function Pending() {
    const { pendingAlumni, currentUser, fetchPendingAlumni, notify } = useApp();
    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN";

    useEffect(() => {
        fetchPendingAlumni();
    }, []);
    const pending = pendingAlumni.filter(u => u.status === "PENDING" && (u.role === "ROLE_ALUMNI" || (isSuper && u.role === "ROLE_ADMIN")));

    if (!pending.length) return (
        <div className="empty">
            <div className="empty-icon">🎉</div>
            <div className="empty-msg">No pending requests!</div>
        </div>
    );
    return (
        <div className="pend-grid">
            {pending.map(u => <PendCard key={u.id} u={u} />)}
        </div>
    );
}

// ─── Manage Alumni ────────────────────
function ManageAlumni() {
    const { users, approve, reject, deleteUser, currentUser, fetchPendingAlumni, fetchDirectory, updateUserDepartment, confirm } = useApp();
    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN";

    useEffect(() => {
        fetchDirectory();
        fetchPendingAlumni();
    }, [isSuper]);

    const [q, setQ] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [selectedDept, setSelectedDept] = useState("");

    const visibleUsers = users.filter(u => {
        // Super Admin sees everyone (Admin accounts + Alumni)
        if (isSuper) return u.role === "ROLE_ALUMNI" || u.role === "ROLE_ADMIN";
        
        // Dept Admin only sees what the backend returned (already filtered by branch)
        return u.role === "ROLE_ALUMNI";
    });

    const filtered = visibleUsers.filter(u =>
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase())
    );

    const toggleExpand = (u) => {
        if (expandedId === u.id) {
            setExpandedId(null);
            setSelectedDept("");
        } else {
            setExpandedId(u.id);
            setSelectedDept(u.department || "");
        }
    }

    const saveDept = async (id) => {
        if (!selectedDept) return;
        await updateUserDepartment(id, selectedDept);
        setExpandedId(null);
    };

    return (
        <>
            <div className="search-bar">
                <input className="inp" placeholder="🔍 Search by name or email…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr><th>User</th><th>Role</th><th>Batch / Details</th><th>Company</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => (
                            <React.Fragment key={u.id}>
                                <tr 
                                    className={`clickable-tr ${expandedId === u.id ? 'is-expanded' : ''}`}
                                    onClick={() => toggleExpand(u)}
                                >
                                    <td>
                                        <div className="table-user">
                                            <AvatarImg user={u} className="avatar avatar-sm" />
                                            <div>
                                                <div className="td-name">{u.name}</div>
                                                <div className="td-sub">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{u.role.replace("ROLE_", "")}</td>
                                    <td>{u.role === "ROLE_ALUMNI" ? u.batch : "Admin Account"}</td>
                                    <td>{u.company || <span className="dash">—</span>}</td>
                                    <td><span className={`status-pill ${u.status.toLowerCase()}`}>{u.status}</span></td>
                                    <td>
                                        <div className="td-actions" onClick={e => e.stopPropagation()}>
                                            {u.status === "PENDING" && <button className="btn btn-green   btn-sm" onClick={() => approve(u.id)}>✓ Approve</button>}
                                            {u.status === "APPROVED" && <button className="btn btn-outline btn-sm" onClick={() => reject(u.id)}>Suspend</button>}
                                            {u.status === "REJECTED" && <button className="btn btn-green   btn-sm" onClick={() => approve(u.id)}>Restore</button>}
                                            <button className="btn btn-red btn-sm" onClick={async () => { if (await confirm("Delete User?", `Permanently delete ${u.name}? This action cannot be undone.`)) deleteUser(u.id); }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === u.id && (
                                    <tr className="expand-tr">
                                        <td colSpan={6}>
                                            <div className="expand-content">
                                                <div className="expand-profile-grid">
                                                    <AvatarImg user={u} className="avatar avatar-xl" />
                                                    <div className="prof-detail-grid">
                                                        <div className="p-item">
                                                            <div className="p-label">Department / Branch</div>
                                                            {isSuper ? (
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <select 
                                                                        className="inp" 
                                                                        style={{ height: '34px', padding: '0 8px', fontSize: '13px' }}
                                                                        value={selectedDept}
                                                                        onChange={e => setSelectedDept(e.target.value)}
                                                                        onClick={e => e.stopPropagation()}
                                                                    >
                                                                        <option value="">Not Set</option>
                                                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                                    </select>
                                                                    <button 
                                                                        className="btn btn-primary btn-sm"
                                                                        onClick={(e) => { e.stopPropagation(); saveDept(u.id); }}
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="p-val">{u.department || 'Not Set'}</div>
                                                            )}
                                                            {!u.department && u.degree?.includes("CSE") && (
                                                                <div style={{ fontSize: '11px', color: 'var(--indigo)', marginTop: '4px' }}>
                                                                    💡 Suggested: <strong>CSE Dept</strong> (Matching degree)
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">Graduation Year</div>
                                                            <div className="p-val">{u.batch || 'N/A'}</div>
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">Designation</div>
                                                            <div className="p-val">{u.designation || 'Alumnus'}</div>
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">Location</div>
                                                            <div className="p-val">{u.location || 'Unknown'}</div>
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">Tech Stack</div>
                                                            <div className="p-val">{u.techStack || 'Not shared'}</div>
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">LinkedIn Profile</div>
                                                            <div className="p-val">
                                                                {u.linkedinUrl ? (
                                                                    <a href={u.linkedinUrl} target="_blank" rel="noopener noreferrer" className="link" onClick={e => e.stopPropagation()}>View Profile ↗</a>
                                                                ) : 'Not provided'}
                                                            </div>
                                                        </div>
                                                        <div className="p-bio">
                                                            <div className="p-label" style={{ marginBottom: '8px' }}>About / Bio</div>
                                                            {u.bio || "This alumni hasn't added a bio yet."}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {!filtered.length && (
                            <tr><td colSpan={6} className="no-results">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ─── Manage Posts ─────────────────────
function ManagePosts() {
    const { posts, deletePost, fetchPosts, notify } = useApp();

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr><th>Post</th><th>Type</th><th>Posted By</th><th>Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {posts.map(p => {
                        const meta = POST_TYPE_META[p.post_type] || {};
                        return (
                            <tr key={p.id}>
                                <td className="post-cell">
                                    <div className="post-title">{p.title}</div>
                                    <div className="post-desc">{p.description}</div>
                                </td>
                                <td><span className={`type-badge ${meta.cls}`}>{meta.icon} {meta.label}</span></td>
                                <td>{p.alumni_name}</td>
                                <td className="date-cell">{fmtDate(p.created_at)}</td>
                                <td><button className="btn btn-red btn-sm" onClick={async () => { if (await confirm("Delete Post?", "Are you sure you want to remove this post from the feed?")) deletePost(p.id); }}>Delete</button></td>
                            </tr>
                        );
                    })}
                    {!posts.length && <tr><td colSpan={5} className="no-results">No posts yet.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

// ─── Export ───────────────────────────
function Export() {
    const { users, posts, exportAlumni, currentUser, notify, setTab } = useApp();
    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN";
    const alumni = users.filter(u => u.role === "ROLE_ALUMNI");

    if (!isSuper) {
        return (
            <div className="empty">
                <div className="empty-icon">🔒</div>
                <div className="empty-msg">Access Restricted</div>
                <div className="empty-sub">Only Super Admin can export user data</div>
            </div>
        );
    }

    const EXPORTS = [
        { icon: "📄", title: "Alumni Data (XLSX)", desc: "Export professional alumni records to Excel", action: () => exportAlumni() },
        { icon: "👥", title: "Alumni CSV", desc: "Basic alumni data in CSV format", action: () => exportCSV(alumni.map(u => ({ name: u.name, email: u.email, batch: u.batch, degree: u.degree, company: u.company || "", location: u.location || "", status: u.status })), "alumni_export") },
        { icon: "📊", title: "Posts CSV", desc: "All referral/mentorship posts", action: () => exportCSV(posts.map(p => ({ title: p.title, type: p.postType, author: p.alumniName, date: p.createdAt })), "posts_export") },
    ];
    return (
        <div className="export-grid">
            {EXPORTS.map(x => (
                <div key={x.title} className="export-card">
                    <div className="export-icon">{x.icon}</div>
                    <div className="export-title">{x.title}</div>
                    <div className="export-desc">{x.desc}</div>
                    <button className="btn btn-primary btn-sm" onClick={x.action}>⬇ Download</button>
                </div>
            ))}
        </div>
    );
}


// ─── Manage Events ─────────────────────
function ManageEvents() {
    const { fetchEventRegistrations, eventRegistrations, deleteEventRegistration, notify, api } = useApp();
    const [localEvents, setLocalEvents] = useState([]);
    const [selEvent, setSelEvent] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get("/events");
                setLocalEvents(res.data);
            } catch (e) { notify("Failed to load events", "err"); }
        }
        load();
    }, []);

    const handleViewParticipants = (ev) => {
        setSelEvent(ev);
        fetchEventRegistrations(ev.id);
        setShowParticipants(true);
    };

    return (
        <>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr><th>Event Name</th><th>Date</th><th>Location</th><th>Registrations</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {localEvents.map(ev => (
                            <tr key={ev.id}>
                                <td><strong>{ev.title}</strong></td>
                                <td>{ev.eventDate}</td>
                                <td>{ev.location}</td>
                                <td>{ev.registrationCount || 0}</td>
                                <td>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleViewParticipants(ev)}>👥 View Participants</button>
                                </td>
                            </tr>
                        ))}
                        {!localEvents.length && <tr><td colSpan={5} className="no-results">No events found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {showParticipants && selEvent && (
                <div className="modal-overlay" onClick={() => setShowParticipants(false)}>
                    <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Participants: {selEvent.title}</div>
                                <div className="modal-sub">Verified registration details</div>
                            </div>
                            <button className="close-btn" onClick={() => setShowParticipants(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Comments</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {eventRegistrations.map(r => (
                                            <tr key={r.id}>
                                                <td>{r.firstName} {r.lastName}</td>
                                                <td>{r.email}</td>
                                                <td>{r.phone}</td>
                                                <td><div className="td-trunc" title={r.comments}>{r.comments || "—"}</div></td>
                                                <td>
                                                    <button className="btn btn-red btn-sm" onClick={async () => { if (await confirm("Remove Registration?", "Cancel this student's registration for this event?")) deleteEventRegistration(r.id); }}>Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {!eventRegistrations.length && <tr><td colSpan={5} className="no-results">No participants registered yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Named exports – AppShell uses these for tab routing
export { Overview, Pending, ManageAlumni, ManagePosts, ManageEvents, Export };
