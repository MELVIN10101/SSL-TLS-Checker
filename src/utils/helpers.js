// ─── Shared utility functions used across pages ───────────────────────────────

export const stripDomain = (input) =>
    input.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();

export const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
};

export const formatDateTime = (isoStr) => {
    const d = isoStr ? new Date(isoStr) : new Date();
    return d.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

export const getDaysColor = (days) => {
    if (days === null || days === undefined) return 'badge-gray';
    if (days <= 0) return 'badge-danger';
    if (days <= 30) return 'badge-warning';
    if (days <= 90) return 'badge-info';
    return 'badge-safe';
};

export const getGradeClass = (grade) => {
    if (!grade) return 'grade-default';
    if (grade === 'A+') return 'grade-A-plus';
    if (grade === 'A') return 'grade-A';
    if (grade === 'B') return 'grade-B';
    if (grade === 'C') return 'grade-C';
    if (grade === 'D') return 'grade-D';
    return 'grade-F';
};

export const getGradeTextColor = (grade) => {
    if (!grade) return '#94a3b8';
    if (grade === 'A+') return '#000';
    if (grade === 'A') return '#fff';
    if (grade === 'B') return '#000';
    return '#fff';
};

export const getScoreColor = (score) => {
    if (score >= 90) return '#00ff9f';
    if (score >= 75) return '#00d4ff';
    if (score >= 60) return '#fbbf24';
    if (score >= 40) return '#f97316';
    return '#ef4444';
};

export const getProtocolBadge = (color) => {
    const map = {
        green: 'badge-safe', yellow: 'badge-warning',
        orange: 'badge-warning', red: 'badge-danger',
        gray: 'badge-gray', teal: 'badge-info', cyan: 'badge-info',
    };
    return map[color] || 'badge-gray';
};

export const getCipherBadge = (strength) => {
    const map = {
        'Excellent': 'badge-safe', 'Strong': 'badge-safe',
        'Good': 'badge-info', 'Fair': 'badge-warning',
        'Weak': 'badge-danger', 'Critical': 'badge-danger',
        'Unknown': 'badge-gray',
    };
    return map[strength] || 'badge-gray';
};

// ─── localStorage history ────────────────────────────────────────────────────

const HISTORY_KEY = 'sslchecker_history';
const MAX_HISTORY = 50;

export const loadHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
};

export const saveToHistory = (result) => {
    const existing = loadHistory();
    // deduplicate by hostname + scannedAt
    const filtered = existing.filter(
        r => !(r.hostname === result.hostname && r.scannedAt === result.scannedAt)
    );
    const updated = [result, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
};

export const deleteFromHistory = (id) => {
    const existing = loadHistory();
    const updated = existing.filter(r => r._id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
};

export const clearHistory = () => {
    localStorage.setItem(HISTORY_KEY, '[]');
    return [];
};
