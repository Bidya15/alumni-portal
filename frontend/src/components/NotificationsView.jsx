import { useApp } from "../context/AppContext";
import { timeAgo } from "../utils/helpers";
import AvatarImg from "./AvatarImg";
import s from "./NotificationsView.module.css";

function NotificationsView() {
    const {
        myNotifications = [], markNotificationRead, clearNotifications,
        setTab, handleConnectionResponse, connections = [], users = []
    } = useApp();

    return (
        <div className={s.notifWrap}>
            <div className={s.notifHead}>
                <div>
                    <h2 className={s.notifTitle}>Notifications</h2>
                    <p className={s.notifSub}>Stay updated on your network and requests</p>
                </div>
                {myNotifications.some(n => !n.read) && (
                    <button className="btn btn-ghost btn-sm" onClick={clearNotifications}>Mark all as read</button>
                )}
            </div>

            {myNotifications.length === 0 ? (
                <div className={s.emptyStateCard}>
                    <div className={s.emptyIcon}>🔔</div>
                    <h3>All caught up!</h3>
                    <p>When you get new connection requests or messages, they'll appear here.</p>
                </div>
            ) : (
                <div className={s.notifList}>
                    {myNotifications.map(n => {
                        // Try to find sender from users list (populated when directory loads),
                        // or fall back to the connection's sender object
                        const isConnReq = n.type === "CONNECTION_REQUEST";
                        const isOutreach = n.type === "OUTREACH_REQUEST";

                        // For connection requests, find the actual connection object by sender id
                        const conn = isConnReq
                            ? connections.find(c => c.sender?.id === n.senderId && c.status === "PENDING")
                            : null;

                        // Sender info: try users list first, then connection sender object
                        const senderFromConn = connections.find(c => c.sender?.id === n.senderId)?.sender;
                        const senderFromUsers = users.find(u => u.id === n.senderId);
                        const sender = senderFromUsers || senderFromConn;

                        return (
                            <div
                                key={n.id}
                                className={`${s.notifCard} ${!n.read ? s.notifCardUnread : ""}`}
                                onClick={() => markNotificationRead(n.id)}
                            >
                                <div className={s.notifRow}>
                                    <div className={s.notifAvatarCol}>
                                        <AvatarImg user={sender || { name: 'S' }} size="md" />
                                        {!n.read && <span className={s.unreadPulse}></span>}
                                    </div>

                                    <div className={s.notifBody}>
                                        <div className={s.notifHeader}>
                                            <span className={s.notifSender}>{sender?.name || "A fellow alumni"}</span>
                                            <span className={s.notifTime}>{timeAgo(n.createdAt)}</span>
                                        </div>

                                        <div className={s.notifMessage}>{n.message}</div>

                                        {isConnReq && sender?.batch && (
                                            <div className={s.notifMetaBox}>
                                                <span className={s.metaTag}>Batch {sender.batch}</span>
                                                {sender.company && <span className={s.metaTag}>🏢 {sender.company}</span>}
                                            </div>
                                        )}

                                        <div className={s.notifActions}>
                                            {isConnReq && conn && (
                                                <>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={(e) => { e.stopPropagation(); handleConnectionResponse(conn.id, "ACCEPTED"); markNotificationRead(n.id); }}
                                                    >✓ Accept</button>
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={(e) => { e.stopPropagation(); handleConnectionResponse(conn.id, "REJECTED"); markNotificationRead(n.id); }}
                                                    >✗ Ignore</button>
                                                </>
                                            )}

                                            {isConnReq && !conn && (
                                                <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>
                                                    {connections.find(c => c.sender?.id === n.senderId && c.status === "ACCEPTED") ? "✓ Connected" : "Already responded"}
                                                </span>
                                            )}

                                            {isOutreach && (
                                                <button className={`btn btn-sm ${s.btnIndigoLight}`} onClick={(e) => { e.stopPropagation(); setTab("feed"); }}>
                                                    View Outreach Request →
                                                </button>
                                            )}

                                            {n.type === "NEW_MESSAGE" && (
                                                <button className={`btn btn-ghost btn-sm ${s.btnReply}`} onClick={(e) => { e.stopPropagation(); setTab("messages"); }}>
                                                    Reply to Message →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


export default NotificationsView;
