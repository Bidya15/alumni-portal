import { useApp } from "../context/AppContext";
import Sidebar from "./Sidebar";
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ChatView from "./ChatView";
import NotificationsView from "./NotificationsView";
import Gallery from "../pages/Gallery";
import Donate from "../pages/Donate";
import ForgotPassword from "../pages/ForgotPassword";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import styles from "./AppShell.module.css";
import { motion, AnimatePresence } from "framer-motion";

// ─── Admin sub-views ─────────────────────────────────
import { Overview, Pending, ManageAlumni, ManagePosts, Export } from "../dashboard/Admin";
import ManageEvents from "../cms/ManageEvents";
import AdminProfile from "../dashboard/AdminProfile";
import EmailCampaign from "../dashboard/EmailCampaign";

// ─── Alumni sub-views ────────────────────────────────
import AlumniDashboard from "../dashboard/AlumniDashboard";
import NetworkingHub from "../dashboard/NetworkingHub";
import JobPortal from "../dashboard/JobPortal";
import { Feed as AlumniFeed, Directory as AlumniDirectory, Profile as AlumniProfile } from "../dashboard/Alumni";
import AlumniServices from "../dashboard/AlumniServices";
import EventsView from "../dashboard/EventsView";
import FeedbackView from "../dashboard/FeedbackView";

// ─── Super Admin sub-views ───────────────────────────
import { ManageAdmins } from "../dashboard/SuperAdmin";
import ContentManagement from "../cms/ContentManagement";
import GivingHub from "../dashboard/GivingHub";

// ─── Page titles ─────────────────────────────────────
const PAGE_TITLE = {
    ROLE_SUPER_ADMIN: {
        "manage-admins": { h: "System Control", sub: "Manage administrative accounts and system settings" },
        overview: { h: "Dashboard Overview", sub: "Global alumni statistics" },
        pending: { h: "Pending Approvals", sub: "Review and verify new registrations" },
        manage: { h: "Manage Alumni", sub: "View or remove alumni records" },
        posts: { h: "Manage Posts", sub: "Monitor and moderate all alumni posts" },
        export: { h: "Export Data", sub: "Download global alumni data" },
        events: { h: "Manage Events", sub: "Oversee registrations and participants" },
        notifications: { h: "System Alerts", sub: "Global system notifications" },
        "content-management": { h: "Unified Management Console", sub: "Central control for all portal content, users, and administrative tasks" },
        giving: { h: "Giving Hub", sub: "Support institutional growth and student initiatives" },
    },
    ROLE_ADMIN: {
        overview: { h: "Alumni Administration", sub: "Department-level management and oversight" },
        pending: { h: "Registration Review", sub: "Verify new alumni belonging to your department" },
        manage: { h: "Alumni Directory", sub: "View and manage verified alumni records" },
        posts: { h: "Moderation Hub", sub: "Monitor and manage alumni-shared content" },
        notifications: { h: "Admin Alerts", sub: "Direct updates and system notifications" },
        giving: { h: "Giving Hub", sub: "Track and support institutional initiatives" },
        events: { h: "Event Oversight", sub: "Manage alumni registrations and participants" },
        services: { h: "Alumni Services", sub: "Fulfill ID and document requests" },
    },
    ROLE_ALUMNI: {
        dashboard: { h: "Dashboard Hub", sub: "Welcome back to your portal" },
        feed: { h: "Alumni Feed", sub: "Stay updated with latest posts and discussions" },
        "networking-hub": { h: "Networking Hub", sub: "Connect with fellow alumni, mentors, and faculty" },
        "job-portal": { h: "Job Portal", sub: "Find your next career opportunity" },
        directory: { h: "Alumni Directory", sub: "Browse and connect with verified alumni" },
        messages: { h: "Messages", sub: "Direct communication with your connections" },
        notifications: { h: "Notifications", sub: "Stay up to date with alerts" },
        giving: { h: "Giving Hub", sub: "Support university growth and institutional initiatives" },
        events: { h: "Events & Reunions", sub: "Stay updated with latest happenings" },
        "success-stories": { h: "Success Stories", sub: "Inspiring alumni achievements" },
        profile: { h: "My Profile", sub: "Manage your public alumni presence" },
        services: { h: "Alumni Services", sub: "Digital ID and official document requests" },
        feedback: { h: "Alumni Feedback", sub: "Share your thoughts with the community" },
    },
};

// ─── Tab router ──────────────────────────────────────
function renderTab(role, tab) {
    if (role === "ROLE_SUPER_ADMIN") {
        if (tab === "manage-admins") return <ManageAdmins />;
        if (tab === "overview") return <Overview />;
        if (tab === "pending") return <Pending />;
        if (tab === "manage") return <ManageAlumni />;
        if (tab === "posts") return <ManagePosts />;
        if (tab === "events") return <ManageEvents />;
        if (tab === "export") return <Export />;
        if (tab === "messages") return <ChatView />;
        if (tab === "notifications") return <NotificationsView />;
        if (tab === "content-management") return <ContentManagement />;
        if (tab === "giving") return <GivingHub />;
        if (tab === "profile") return <AdminProfile />;
        if (tab === "email-campaign") return <EmailCampaign />;
    }
    if (role === "ROLE_ADMIN") {
        // Strict guard: Dept Admins cannot access Super Admin tabs
        const allowed = ["overview", "pending", "manage", "posts", "events", "notifications", "giving", "services", "profile", "email-campaign"];
        if (!allowed.includes(tab)) return <Overview />; // Default to safe overview

        if (tab === "overview") return <Overview />;
        if (tab === "pending") return <Pending />;
        if (tab === "manage") return <ManageAlumni />;
        if (tab === "posts") return <ManagePosts />;
        if (tab === "events") return <ManageEvents />;
        if (tab === "notifications") return <NotificationsView />;
        if (tab === "giving") return <GivingHub />;
        if (tab === "services") return <AlumniServices />;
        if (tab === "profile") return <AdminProfile />;
        if (tab === "email-campaign") return <EmailCampaign />;
    }
    if (role === "ROLE_ALUMNI") {
        if (tab === "dashboard") return <AlumniDashboard />;
        if (tab === "feed") return <AlumniFeed />;
        if (tab === "networking-hub") return <NetworkingHub />;
        if (tab === "job-portal") return <JobPortal />;
        if (tab === "directory") return <AlumniDirectory />;
        if (tab === "messages") return <ChatView />;
        if (tab === "notifications") return <NotificationsView />;
        if (tab === "giving") return <GivingHub />;
        if (tab === "events") return <EventsView />;
        if (tab === "success-stories") return <AlumniFeed isSuccessStories={true} />;
        if (tab === "profile") return <AlumniProfile />;
        if (tab === "services") return <AlumniServices />;
        if (tab === "feedback") return <FeedbackView />;
    }
    return null;
}

// ─── Page transition variants ─────────────────────────
const pageVariants = {
    initial: { opacity: 0, y: 18 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const tabVariants = {
    initial: { opacity: 0, x: 16 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.18 } },
};

const toastVariants = {
    initial: { opacity: 0, x: 80, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 28 } },
    exit: { opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } },
};

// ─── App Shell ───────────────────────────────────────
function AppShell() {
    const { page, currentUser, toast, tab, sidebarOpen, theme, toggleTheme } = useApp();

    // Public pages with fade-slide transition
    if (page === "HOME" || page === "ABOUT" || page === "GALLERY" || page === "DONATE" || page === "CONTACT" || page === "LOGIN" || page === "REGISTER" || page === "FORGOT_PASSWORD" || page === "PRIVACY" || page === "TERMS") {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={page}
                    variants={pageVariants}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    style={{ minHeight: "100vh" }}
                >
                    {page === "HOME" && <Home />}
                    {page === "ABOUT" && <About />}
                    {page === "GALLERY" && <Gallery isPublic />}
                    {page === "DONATE" && <Donate />}
                    {page === "CONTACT" && <Contact />}
                    {page === "LOGIN" && <Login />}
                    {page === "REGISTER" && <Register />}
                    {page === "FORGOT_PASSWORD" && <ForgotPassword />}
                    {page === "PRIVACY" && <Privacy />}
                    {page === "TERMS" && <Terms />}
                </motion.div>
            </AnimatePresence>
        );
    }

    const role = currentUser?.role;
    const meta = PAGE_TITLE[role]?.[tab] || { h: "AlumniConnect", sub: "" };

    return (
        <div className={`${styles.appShell}${sidebarOpen ? "" : ` ${styles.sidebarCollapsed}`}`}>
            {/* ── Backdrop for Mobile ── */}
            <div
                className={`${styles.backdrop} ${sidebarOpen ? styles.active : ""}`}
                onClick={() => sidebarOpen && toggleSidebar()}
            />

            {/* ── Animated Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        className={`${styles.toast} ${toast.type === "err" ? styles.toastErr : styles.toastOk}`}
                        variants={toastVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <Sidebar />

            <div className={styles.mainContent}>
                {/* ── Animated Header ── */}
                <AnimatePresence mode="wait">
                    <motion.header
                        key={tab}
                        className={styles.topHeader}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className={styles.topHeaderLeft}>
                            <h1>{meta.h}</h1>
                            {meta.sub && <p>{meta.sub}</p>}
                        </div>
                        <div className={styles.topHeaderRight}>
                            <span className={styles.dateText}>
                                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <motion.button
                                className={styles.themeBtn}
                                onClick={toggleTheme}
                                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                                whileHover={{ scale: 1.15, rotate: 15 }}
                                whileTap={{ scale: 0.85, rotate: -10 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                                {theme === "light" ? "🌙" : "☀️"}
                            </motion.button>
                        </div>
                    </motion.header>
                </AnimatePresence>

                {/* ── Animated Tab Content ── */}
                <div className={styles.pageBody}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            variants={tabVariants}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                        >
                            {renderTab(role, tab)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default AppShell;
