import { useState, useEffect } from "react";
import { useApp, DEPARTMENTS } from "../context/AppContext";
import AvatarImg from "../components/AvatarImg";
import styles from "./dashboard.module.css";

export function ManageAdmins() {
    const { admins, fetchAdmins, revokeAdminAccess, promoteAdmin, assignAdmin, fetchAlumniOnly, updateAdminDepartment, currentUser, confirm, notify } = useApp();
    const [alumniList, setAlumniList] = useState([]);
    const [selectedAlumnusId, setSelectedAlumnusId] = useState("");
    const [department, setDepartment] = useState("Alumni Office");
    const [searchQuery, setSearchQuery] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editDepartment, setEditDepartment] = useState("");

    const handleEditClick = (u) => {
        setEditingId(u.id);
        setEditDepartment(u.department || "Alumni Office");
    };

    const handleSaveEdit = async (id) => {
        await updateAdminDepartment(id, editDepartment);
        setEditingId(null);
    };

    useEffect(() => {
        const load = async () => {
            const list = await fetchAlumniOnly();
            setAlumniList(list);
        };
        load();
        fetchAdmins();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedAlumnusId) return notify("Select an Alumnus first", "err");
        const ok = await assignAdmin(selectedAlumnusId, department);
        if (ok) {
            setSelectedAlumnusId("");
            setSearchQuery("");
            // Refresh potential alumni list
            const list = await fetchAlumniOnly();
            setAlumniList(list);
        }
    };

    const filteredAlumni = alumniList.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.maContainer}>
            <div className={styles.maGrid}>
                {/* Left: Form Card */}
                <div className={styles.maFormPanel}>
                    <div className={styles.maCard}>
                        <div className={styles.maCardTab}>Assign Administrator</div>
                        <h3 className={styles.maCardTitle}>Promote Alumnus</h3>
                        <p className={styles.maCardSub}>Select an existing Alumnus to become a Department Admin</p>

                        <form onSubmit={handleAssign} className={styles.maForm}>
                            <div className="form-group">
                                <label className="form-label">Search Alumnus</label>
                                <input
                                    className="inp"
                                    type="text"
                                    placeholder="Filter by name or email…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select Alumnus Profile</label>
                                <select
                                    className="inp"
                                    required
                                    value={selectedAlumnusId}
                                    onChange={e => setSelectedAlumnusId(e.target.value)}
                                >
                                    <option value="">-- Choose Alumnus --</option>
                                    {filteredAlumni.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} ({a.email})
                                        </option>
                                    ))}
                                </select>
                                {alumniList.length === 0 && <p className={styles.maCardSub} style={{ color: 'var(--amber-500)', marginTop: '5px' }}>No available Alumni found.</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Assign Department</label>
                                <select
                                    className="inp"
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                >
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full mt-15" disabled={!selectedAlumnusId}>
                                🛡️ Assign as Department Admin
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Table Panel */}
                <div className={styles.maTablePanel}>
                    <div className={styles.maTableCard}>
                        <div className={styles.maTableHeader}>
                            <div>
                                <h3 className={styles.maTableTitle}>Active Administrators</h3>
                                <p className={styles.maTableSub}>Currently managing the portal</p>
                            </div>
                            <div className={styles.adminCount}>
                                {admins.length} Admins
                            </div>
                        </div>

                        <div className="table-wrap">
                            <table className={styles.maTable}>
                                <thead>
                                    <tr>
                                        <th>Administrative User</th>
                                        <th>Email Address</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className={styles.maUserCell}>
                                                    <AvatarImg user={u} className="avatar avatar-sm" />
                                                    <div>
                                                        <div className={styles.maUserName}>{u.name}</div>
                                                        {editingId === u.id ? (
                                                            <div style={{ marginTop: '5px' }}>
                                                                <select
                                                                    className="inp"
                                                                    style={{ padding: '6px', fontSize: '12px', minWidth: '160px' }}
                                                                    value={editDepartment}
                                                                    onChange={e => setEditDepartment(e.target.value)}
                                                                >
                                                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <div className={styles.maUserRole}>
                                                                {u.role === 'ROLE_SUPER_ADMIN' ? 'System Super Admin' : (u.department || 'General Administrator')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.maEmailCell}>{u.email}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                    {editingId === u.id ? (
                                                        <>
                                                            <button className="btn btn-green btn-sm" onClick={() => handleSaveEdit(u.id)}>💾 Save</button>
                                                            <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="btn btn-outline btn-sm"
                                                                onClick={() => handleEditClick(u)}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            {u.role !== 'ROLE_SUPER_ADMIN' && (
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={async () => { if (await confirm("Promote to Super Admin?", `Are you sure you want to promote ${u.name}? This gives them full system control.`)) promoteAdmin(u.id) }}
                                                                >
                                                                    ⚡ Promote
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-red btn-sm"
                                                                onClick={async () => { if (await confirm("Revoke Access?", `Revoke administrative access for ${u.name}? They will be demoted to Alumnus status.`)) revokeAdminAccess(u.id) }}
                                                                disabled={u.id === currentUser.id}
                                                                title={u.id === currentUser.id ? "You cannot revoke your own access" : "Revoke access"}
                                                            >
                                                                Revoke Access
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                                                No administrative accounts found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
