import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import styles from './QuickNote.module.css';
import newBurst from '../assets/new_burst.svg';

const QuickNote = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotes = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await api.get('/events', { params: { category: 'QUICK_NOTE' } });
            setNotes(res.data);
        } catch (err) {
            console.error('Error fetching quick notes:', err);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
        const interval = setInterval(() => fetchNotes(true), 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    // Check if a note is "NEW" (within 30 days)
    const isNew = (date) => {
        if (!date) return false;
        const noteDate = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - noteDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    };

    if (loading && notes.length === 0) return null;
    if (!loading && notes.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.labelWrapper}>
                <span className={styles.label}>Quick Note</span>
            </div>
            <div className={styles.marqueeWrapper}>
                <div className={styles.marqueeTrack}>
                    <div className={styles.marqueeContent}>
                        {notes.map((note, i) => (
                            <div key={note.id} className={styles.noteItem}>
                                <span className={styles.dot}>■</span>
                                {isNew(note.createdAt) && (
                                    <img src={newBurst} alt="New" className={styles.newBadgeImg} />
                                )}
                                <span className={styles.noteText}>{note.title}: {note.description}</span>
                            </div>
                        ))}
                    </div>
                    {/* Seamless Loop */}
                    <div className={styles.marqueeContent}>
                        {notes.map((note, i) => (
                            <div key={`loop-${note.id}`} className={styles.noteItem}>
                                <span className={styles.dot}>■</span>
                                {isNew(note.createdAt) && (
                                    <img src={newBurst} alt="New" className={styles.newBadgeImg} />
                                )}
                                <span className={styles.noteText}>{note.title}: {note.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickNote;
