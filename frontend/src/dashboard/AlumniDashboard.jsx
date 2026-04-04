import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import styles from "./AlumniDashboard.module.css";
import EventsPanel from "../components/EventsPanel";

/**
 * AlumniDashboard: The central hub for alumni activities.
 * Focuses on professional utility with a modern, clean aesthetic.
 */

// Define navigation cards for the dashboard
const DASHBOARD_FEATURES = [
    { id: "networking", title: "Networking Hub", desc: "Build professional relationships with verified alumni mentors.", tab: "networking-hub" },
    { id: "jobs", title: "Career Portal", desc: "Discover career opportunities and internal referral openings.", tab: "job-portal" },
    { id: "donations", title: "Giving Hub", desc: "Support institutional advancement and research initiatives.", tab: "giving" },
    { id: "feed", title: "Alumni Feed", desc: "Engage with real-time updates from the global alumni community.", tab: "feed" },
    { id: "directory", title: "Alumni Directory", desc: "Find colleagues and friends using advanced search filters.", tab: "directory" }
];

export default function AlumniDashboard() {
    const { currentUser, setTab, posts, users } = useApp();

    // Calculate real-time stats from backend data
    const activeJobCount = posts.filter(post => post.postType === "JOB" || post.postType === "REFERRAL").length;
    const totalVerifiedAlumni = users.filter(user => user.role === "ROLE_ALUMNI" && user.status === "APPROVED").length;

    // Humanized Profile Info
    const userRoleInfo = `${currentUser?.designation || "Graduate"} ${currentUser?.company ? `at ${currentUser.company}` : "AEC Alumni"}`;
    const userClassInfo = `Class of ${currentUser?.batch || "Unknown"}`;

    return (
        <div className={styles.dashboardWrapper}>
            <div className={styles.dashboardContent}>
                {/* Main Column */}
                <div className={styles.mainCol}>
                    <header className={styles.welcomeHeader}>
                        <div className={styles.welcomeText}>
                            <h1 className={styles.greeting}>Welcome back, <span className={styles.userName}>{currentUser?.name}</span></h1>
                            <p className={styles.userRoleLine}>{userRoleInfo} | {userClassInfo}</p>
                        </div>
                        <button className={styles.profileBtn} onClick={() => setTab("profile")}>
                            Edit Professional Profile
                        </button>
                    </header>

                    <section className={styles.metricsBar}>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Verified Network:</span>
                            <span className={styles.metricValue}>{totalVerifiedAlumni} Alumni</span>
                        </div>
                        <div className={styles.metricDivider} />
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Career Opportunities:</span>
                            <span className={styles.metricValue}>{activeJobCount} Active Positions</span>
                        </div>
                        <div className={styles.metricDivider} />
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Account Status:</span>
                            <span className={`${styles.metricValue} ${styles.statusActive}`}>Certified Access</span>
                        </div>
                    </section>

                    <main className={styles.featuresGrid}>
                        {DASHBOARD_FEATURES.map((feature, index) => (
                            <motion.div
                                key={feature.id}
                                className={styles.featureCard}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                whileHover={{ y: -4 }}
                            >
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDesc}>{feature.desc}</p>
                                <button
                                    className={styles.featureAction}
                                    onClick={() => setTab(feature.tab)}
                                >
                                    Open Module &rarr;
                                </button>
                            </motion.div>
                        ))}
                    </main>
                </div>

                {/* Sidebar Column: Centralized Events & Circulars */}
                <aside className={styles.sideCol}>
                    <EventsPanel
                        limit={5}
                        isCompact={true}
                        title="📅 Upcoming Events & Circulars"
                    />
                </aside>
            </div>
        </div>
    );
}
