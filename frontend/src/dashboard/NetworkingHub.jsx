import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import styles from "./NetworkingHub.module.css";
import { useState } from "react";

/**
 * NetworkingHub: Facilitates professional connections and mentorship.
 * Uses a clean, multi-section layout with real-time data from the backend.
 */

export default function NetworkingHub() {
    const { notify, users, posts, sendConnectionRequest, currentUser, connectedAlumniIds = [], sendMentorshipRequest, mentorshipRequests = [] } = useApp();

    const [reqModal, setReqModal] = useState(null); // { mentorId, postId, title }
    const [reqNote, setReqNote] = useState("");

    // Data Filtering: Separating concerns for clarity (excluding own profile/posts and ALREADY CONNECTED ALUMNI)
    const approvedAlumni = users.filter(user =>
        user.role === "ROLE_ALUMNI" &&
        user.status === "APPROVED" &&
        user.id !== currentUser?.id &&
        !connectedAlumniIds.includes(user.id)
    );
    const mentorshipPosts = posts.filter(post =>
        post.postType === "MENTORSHIP" &&
        post.user?.id !== currentUser?.id
    );
    const trendingWebinars = posts.filter(post =>
        post.postType === "WEBINAR" &&
        post.user?.id !== currentUser?.id
    );

    /**
     * Helper to handle connection requests with user feedback.
     */
    const handleConnect = async (alumniId, alumniName) => {
        try {
            await sendConnectionRequest(alumniId);
            // AppContext handles the notification, but we could add extra logic here
        } catch (error) {
            notify(`Could not connect with ${alumniName}.`, "err");
        }
    };

    return (
        <div className={styles.hubContainer}>
            {/* Page Header */}
            <header className={styles.hubHeader}>
                <div className={styles.headerContext}>
                    <h1 className={styles.hubTitle}>Networking & Mentorship</h1>
                    <p className={styles.hubSubtitle}>
                        Expand your professional reach by connecting with verified Aecians across the globe.
                    </p>
                </div>
            </header>


            {reqModal && (
                <div className="overlay" onClick={e => e.target === e.currentTarget && setReqModal(null)}>
                    <div className="modal" style={{ maxWidth: "420px" }}>
                        <div className="modal-title">Request Mentorship</div>
                        <p style={{ fontSize: "14px", color: "var(--gray-500)", marginBottom: "16px" }}>
                            Requesting: <strong>{reqModal.title}</strong>
                        </p>
                        <div className="form-group">
                            <label>Add a note (optional)</label>
                            <textarea
                                className="inp"
                                placeholder="Tell the mentor what you'd like to discuss..."
                                value={reqNote}
                                onChange={e => setReqNote(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReqModal(null)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2 }}
                                onClick={async () => {
                                    await sendMentorshipRequest(reqModal.mentorId, reqModal.postId, reqNote);
                                    setReqModal(null);
                                    setReqNote("");
                                }}
                            >
                                Send Request 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Global Alumni Network Section */}
            <section className={styles.hubSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Global Alumni Network</h2>
                    <p className={styles.sectionDesc}>Direct access to industry professionals for peer-to-peer networking.</p>
                </div>

                <div className={styles.unifiedGrid}>
                    {approvedAlumni.length > 0 ? approvedAlumni.map((alumni, index) => (
                        <motion.div
                            key={alumni.id}
                            className={styles.networkCard}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <div className={styles.cardInfo}>
                                <h3 className={styles.alumniName}>{alumni.name}</h3>
                                <p className={styles.alumniRole}>
                                    {alumni.designation || "Engineering Professional"}
                                    {alumni.company ? ` @ ${alumni.company}` : ""}
                                </p>
                                <span className={styles.alumniLocation}>📍 {alumni.location || "Global"}</span>
                            </div>
                            <button
                                className={styles.connectBtn}
                                onClick={() => handleConnect(alumni.id, alumni.name)}
                            >
                                Connect
                            </button>
                        </motion.div>
                    )) : (
                        <div className={styles.emptyState}>No alumni directory data available yet.</div>
                    )}
                </div>
            </section>

            {/* 2. Structured Mentorship Section */}
            <section className={styles.hubSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Professional Mentorship</h2>
                    <p className={styles.sectionDesc}>Request one-on-one guidance from seniors verified in their respective domains.</p>
                </div>

                <div className={styles.unifiedGrid}>
                    {mentorshipPosts.length > 0 ? mentorshipPosts.map((mentor, index) => (
                        <motion.div
                            key={mentor.id}
                            className={styles.programCard}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <div className={styles.cardInfo}>
                                <h3 className={styles.programTitle}>{mentor.title}</h3>
                                <p className={styles.mentorName}>Mentor: {mentor.user?.name || "AEC Alumni"}</p>
                                <p className={styles.mentorExpertise}>Focus: {mentor.company || "General Professional Services"}</p>
                            </div>
                            <button
                                className={styles.mentorshipBtn}
                                onClick={() => {
                                    const existing = mentorshipRequests.find(r =>
                                        (r.post?.id === mentor.id || r.post_id === mentor.id) &&
                                        (r.mentee?.id === currentUser?.id || r.mentee_id === currentUser?.id)
                                    );
                                    if (existing) {
                                        notify("You have already requested this session.", "info");
                                    } else {
                                        setReqModal({ mentorId: mentor.user.id, postId: mentor.id, title: mentor.title });
                                    }
                                }}
                            >
                                {mentorshipRequests.some(r =>
                                    (r.post?.id === mentor.id || r.post_id === mentor.id) &&
                                    (r.mentee?.id === currentUser?.id || r.mentee_id === currentUser?.id)
                                ) ? "✓ Requested" : "Request Session"}
                            </button>
                        </motion.div>
                    )) : (
                        <div className={styles.emptyState}>No active mentorship programs currently listed.</div>
                    )}
                </div>
            </section>

            {/* 3. Knowledge Exchange (Webinars) Section */}
            <section className={styles.hubSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Digital Summits & Webinars</h2>
                    <p className={styles.sectionDesc}>Join live sessions hosted by alumni experts to stay ahead in your career.</p>
                </div>

                <div className={styles.unifiedGrid}>
                    {trendingWebinars.length > 0 ? trendingWebinars.map((webinar, index) => (
                        <motion.div
                            key={webinar.id}
                            className={styles.webinarCard}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <div className={styles.cardInfo}>
                                <h3 className={styles.webinarTitle}>{webinar.title}</h3>
                                <p className={styles.webinarMeta}>
                                    📅 {new Date(webinar.webinarDate).toLocaleDateString()} | 🕒 {webinar.location || "Online"}
                                </p>
                            </div>
                            <button
                                className={styles.webinarBtn}
                                onClick={() => window.open(webinar.webinarLink, "_blank")}
                            >
                                Secure a Seat
                            </button>
                        </motion.div>
                    )) : (
                        <div className={styles.emptyState}>No upcoming webinars scheduled for this month.</div>
                    )}
                </div>
            </section>
        </div>
    );
}
