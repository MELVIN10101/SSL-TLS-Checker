import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    History, Search, Trash2, Trash, Eye, Shield, ChevronRight,
    AlertTriangle, CheckCircle, Clock, X, ExternalLink, BarChart2
} from 'lucide-react';
import { loadHistory, deleteFromHistory, clearHistory, formatDateTime, getGradeClass, getGradeTextColor, getScoreColor } from '../utils/helpers';
import ResultsDisplay from '../components/ResultsDisplay';

const GRADE_ORDER = ['A+', 'A', 'B', 'C', 'D', 'F', 'T', undefined];

function GradeChip({ grade }) {
    const cls = getGradeClass(grade);
    const color = getGradeTextColor(grade);
    return (
        <div
            className={`${cls} rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0 text-sm font-black`}
            style={{ color }}
        >
            {grade || '?'}
        </div>
    );
}

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [confirmClear, setConfirmClear] = useState(false);
    const [sortBy, setSortBy] = useState('date'); // 'date' | 'grade' | 'score'
    const navigate = useNavigate();

    useEffect(() => {
        setHistory(loadHistory());
    }, []);

    const handleDelete = useCallback((id, e) => {
        e.stopPropagation();
        const updated = deleteFromHistory(id);
        setHistory(updated);
        if (selectedEntry?._id === id) setSelectedEntry(null);
    }, [selectedEntry]);

    const handleClearAll = () => {
        const updated = clearHistory();
        setHistory(updated);
        setSelectedEntry(null);
        setConfirmClear(false);
    };

    const filtered = history
        .filter(r => !search || r.hostname?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.scannedAt) - new Date(a.scannedAt);
            if (sortBy === 'grade') return GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade);
            if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
            return 0;
        });

    // Stats
    const stats = {
        total: history.length,
        aPlus: history.filter(r => r.grade === 'A+').length,
        graded: history.filter(r => r.grade && r.grade !== 'T').length,
        avgScore: history.length ? Math.round(history.reduce((s, r) => s + (r.score || 0), 0) / history.length) : 0,
        issues: history.filter(r => r.assessment?.issues?.length > 0).length,
    };

    return (
        <div className="h-full flex flex-col md:flex-row overflow-hidden">

            {/* ── Left panel: list ── */}
            <div className="md:w-96 flex flex-col border-r overflow-hidden" style={{ borderColor: 'rgba(0,212,255,0.08)', flexShrink: 0 }}>

                {/* Stats strip */}
                <div
                    className="px-4 py-3 border-b grid grid-cols-4 gap-2"
                    style={{ borderColor: 'rgba(0,212,255,0.08)', background: 'rgba(0,0,0,0.2)' }}
                >
                    {[
                        { label: 'Scans', value: stats.total },
                        { label: 'A+ Grade', value: stats.aPlus },
                        { label: 'Avg Score', value: stats.avgScore },
                        { label: 'With Issues', value: stats.issues },
                    ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                            <p className="text-base font-bold" style={{ color: '#00d4ff' }}>{value}</p>
                            <p className="text-xs" style={{ color: '#334155' }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Search + controls */}
                <div className="px-4 py-3 border-b space-y-2" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Filter by domain…"
                            className="w-full text-sm rounded-xl pl-9 pr-4 py-2.5"
                            style={{
                                background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
                                color: '#e2e8f0', outline: 'none',
                            }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {['date', 'grade', 'score'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSortBy(s)}
                                    className="text-xs px-2.5 py-1 rounded-lg capitalize"
                                    style={{
                                        background: sortBy === s ? 'rgba(0,212,255,0.12)' : 'transparent',
                                        border: sortBy === s ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                                        color: sortBy === s ? '#00d4ff' : '#475569',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        {history.length > 0 && (
                            confirmClear ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs" style={{ color: '#ef4444' }}>Confirm?</span>
                                    <button onClick={handleClearAll} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}>Yes</button>
                                    <button onClick={() => setConfirmClear(false)} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>No</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmClear(true)}
                                    className="flex items-center gap-1 text-xs"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
                                >
                                    <Trash size={12} />
                                    Clear all
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <History size={36} className="mx-auto mb-3" style={{ color: '#1e293b' }} />
                            <p className="text-sm font-medium" style={{ color: '#334155' }}>
                                {history.length === 0 ? 'No scans yet' : 'No results match your filter'}
                            </p>
                            {history.length === 0 && (
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 text-xs px-4 py-2 rounded-xl"
                                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', cursor: 'pointer' }}
                                >
                                    Start a scan
                                </button>
                            )}
                        </div>
                    ) : (
                        filtered.map(entry => {
                            const isActive = selectedEntry?._id === entry._id;
                            const hasIssues = entry.assessment?.issues?.length > 0;
                            return (
                                <div
                                    key={entry._id}
                                    onClick={() => setSelectedEntry(isActive ? null : entry)}
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                                    style={{
                                        background: isActive ? 'rgba(0,212,255,0.06)' : 'transparent',
                                        borderLeft: isActive ? '2px solid #00d4ff' : '2px solid transparent',
                                        borderBottom: '1px solid rgba(0,212,255,0.05)',
                                    }}
                                >
                                    <GradeChip grade={entry.grade} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{entry.hostname}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs" style={{ color: '#334155' }}>
                                                {formatDateTime(entry.scannedAt)}
                                            </span>
                                            {hasIssues && (
                                                <span className="flex items-center gap-0.5 text-xs" style={{ color: '#ef4444' }}>
                                                    <AlertTriangle size={10} />
                                                    {entry.assessment.issues.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-xs font-bold" style={{ color: getScoreColor(entry.score || 0) }}>
                                            {entry.score}
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(entry._id, e)}
                                            className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Right panel: detail ── */}
            <div className="flex-1 overflow-y-auto">
                {selectedEntry ? (
                    <div className="px-6 py-6">
                        {/* Panel header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-bold mono" style={{ color: '#e2e8f0' }}>{selectedEntry.hostname}</h2>
                                <p className="text-xs" style={{ color: '#334155' }}>{formatDateTime(selectedEntry.scannedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/', { state: { domain: selectedEntry.hostname } })}
                                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
                                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', cursor: 'pointer' }}
                                >
                                    <ExternalLink size={12} />
                                    Re-scan
                                </button>
                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', cursor: 'pointer' }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        <ResultsDisplay
                            result={selectedEntry}
                            scanTime={formatDateTime(selectedEntry.scannedAt)}
                            compact={true}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center px-10 py-16">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}
                        >
                            <BarChart2 size={36} style={{ color: '#1e3a4f' }} />
                        </div>
                        <p className="text-base font-semibold mb-2" style={{ color: '#334155' }}>Select a scan to view details</p>
                        <p className="text-sm" style={{ color: '#1e293b' }}>
                            Click any entry on the left to see the full security report
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
