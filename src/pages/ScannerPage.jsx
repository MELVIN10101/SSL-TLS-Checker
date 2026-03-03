import React, { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Search, ChevronRight, Clock, Shield, Activity, Lock,
    Key, Server, Award, Printer, ShieldCheck, Zap
} from 'lucide-react';
import ResultsDisplay from '../components/ResultsDisplay';
import { stripDomain, formatDateTime, saveToHistory } from '../utils/helpers';

const EXAMPLE_DOMAINS = [
    { name: 'google.com' },
    { name: 'github.com' },
    { name: 'cloudflare.com' },
    { name: 'expired.badssl.com', label: 'expired' },
];

const STATUS_MSGS = [
    'Connecting to server…',
    'Performing TLS handshake…',
    'Extracting certificate chain…',
    'Probing protocol versions…',
    'Checking security headers…',
    'Computing security grade…',
    'Finalizing report…',
];

export default function ScannerPage() {
    const { setShowPrint } = useOutletContext();

    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [statusMsg, setStatusMsg] = useState('');
    const [scanTime, setScanTime] = useState('');

    // Elapsed timer
    useEffect(() => {
        let t;
        if (loading) t = setInterval(() => setElapsed(p => p + 1), 1000);
        return () => clearInterval(t);
    }, [loading]);

    // Rotating status messages
    useEffect(() => {
        if (!loading) return;
        let i = 0;
        setStatusMsg(STATUS_MSGS[0]);
        const iv = setInterval(() => {
            i = (i + 1) % STATUS_MSGS.length;
            setStatusMsg(STATUS_MSGS[i]);
        }, 2000);
        return () => clearInterval(iv);
    }, [loading]);

    // Sync show-print to topbar
    useEffect(() => {
        setShowPrint(!!result && !loading);
    }, [result, loading, setShowPrint]);

    const handleScan = useCallback(async (e, forceDomain) => {
        if (e) e.preventDefault();
        const raw = forceDomain ?? domain;
        const clean = stripDomain(raw);
        if (!clean) { setError('Please enter a domain name'); return; }

        setLoading(true);
        setError('');
        setResult(null);
        setElapsed(0);

        try {
            const res = await fetch(`/api/analyze?host=${encodeURIComponent(clean)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || data.error || 'Analysis failed');

            const now = formatDateTime();
            setScanTime(now);
            // Attach a unique ID and timestamp for history
            const enriched = { ...data, _id: `${clean}-${Date.now()}`, scannedAt: data.scannedAt || new Date().toISOString() };
            saveToHistory(enriched);
            setResult(enriched);
        } catch (err) {
            setError(err.message || 'Failed to analyze domain.');
        } finally {
            setLoading(false);
        }
    }, [domain]);

    const handleReset = () => {
        setResult(null);
        setDomain('');
        setError('');
        setShowPrint(false);
    };

    return (
        <div className="px-6 py-8 max-w-6xl mx-auto">

            {/* ── Hero + Search (shown when no result) ── */}
            {!result && (
                <div className="animate-fade-in">
                    {/* Hero */}
                    <div className="text-center mb-10">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
                            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}
                        >
                            <Activity size={12} />
                            Real-time SSL/TLS Analysis Engine
                        </div>
                        <h2
                            className="font-black mb-4"
                            style={{
                                fontSize: 'clamp(28px, 5vw, 52px)',
                                background: 'linear-gradient(135deg, #e2e8f0 30%, #64748b)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Inspect Any Domain's{' '}
                            <span className="text-gradient-cyan">Security Posture</span>
                        </h2>
                        <p className="text-base max-w-xl mx-auto" style={{ color: '#64748b' }}>
                            Deep-dive TLS handshake analysis — certificates, protocols, cipher suites,
                            security headers, all in one structured report.
                        </p>
                    </div>

                    {/* Search box */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <form onSubmit={handleScan}>
                            <div
                                className="flex gap-0 rounded-2xl overflow-hidden"
                                style={{ background: 'rgba(13,13,26,0.8)', border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 0 30px rgba(0,212,255,0.06)' }}
                            >
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
                                    <input
                                        type="text"
                                        value={domain}
                                        onChange={e => setDomain(e.target.value)}
                                        placeholder="example.com or https://example.com"
                                        disabled={loading}
                                        autoFocus
                                        className="domain-input rounded-none border-none"
                                        style={{ paddingLeft: '44px', background: 'transparent', borderRadius: 0 }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="scan-btn rounded-none"
                                    style={{ borderRadius: 0, minWidth: '120px' }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Scanning
                                        </>
                                    ) : (
                                        <>
                                            Analyze
                                            <ChevronRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Example chips */}
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <span className="text-xs" style={{ color: '#334155' }}>Try:</span>
                            {EXAMPLE_DOMAINS.map(({ name, label }) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => { setDomain(name); }}
                                    disabled={loading}
                                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                                    style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', cursor: 'pointer' }}
                                >
                                    {name}
                                    {label && <span className="ml-1.5 badge-danger px-1.5 py-0.5 rounded-full">{label}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feature cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
                        {[
                            { icon: Lock, title: 'Certificate Analysis', desc: 'Full chain, SANs, expiry, fingerprint' },
                            { icon: Shield, title: 'Protocol Check', desc: 'TLS 1.0–1.3 support matrix' },
                            { icon: Key, title: 'Cipher Suite Eval', desc: 'Strength classification & scoring' },
                            { icon: Server, title: 'Security Headers', desc: 'HSTS, CSP, X-Frame-Options & more' },
                            { icon: Award, title: 'Security Grading', desc: 'A+ to F composite grade' },
                            { icon: Printer, title: 'PDF Export', desc: 'Download a complete report' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="glass-hover rounded-xl p-4"
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon size={15} style={{ color: '#00d4ff' }} />
                                    <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>{title}</p>
                                </div>
                                <p className="text-xs" style={{ color: '#475569' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Loading ── */}
            {loading && (
                <div
                    className="scan-container glass rounded-2xl p-12 text-center animate-fade-in max-w-md mx-auto"
                >
                    <div className="flex justify-center mb-6">
                        <div className="relative w-20 h-20">
                            <div
                                className="w-20 h-20 rounded-full border-4 animate-spin"
                                style={{ borderColor: 'rgba(0,212,255,0.1)', borderTopColor: '#00d4ff' }}
                            />
                            <Shield size={28} className="absolute inset-0 m-auto" style={{ color: '#00d4ff' }} />
                        </div>
                    </div>
                    <p className="text-base font-semibold mb-1" style={{ color: '#00d4ff' }}>{statusMsg}</p>
                    <p className="text-sm mb-4" style={{ color: '#334155' }}>{domain}</p>
                    <div className="flex items-center justify-center gap-1.5 mb-5" style={{ color: '#475569' }}>
                        <Clock size={12} />
                        <span className="text-xs">{elapsed}s elapsed</span>
                    </div>
                    <div className="progress-bar" style={{ maxWidth: '200px', margin: '0 auto' }}>
                        <div
                            className="progress-fill"
                            style={{
                                background: 'linear-gradient(90deg, #00d4ff, #00ff9f)',
                                width: `${Math.min(100, (elapsed / 20) * 100)}%`,
                                transition: 'width 1s linear',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ── Error ── */}
            {error && !loading && (
                <div
                    className="p-5 rounded-2xl animate-fade-in max-w-2xl mx-auto"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                    <div className="flex items-start gap-3">
                        <Shield size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
                        <div>
                            <p className="font-bold" style={{ color: '#ef4444' }}>Analysis Failed</p>
                            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="text-xs mt-3 underline"
                                style={{ color: '#64748b', cursor: 'pointer', background: 'none', border: 'none' }}
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Results ── */}
            {result && !loading && (
                <ResultsDisplay
                    result={result}
                    scanTime={scanTime}
                    onReset={handleReset}
                />
            )}
        </div>
    );
}
