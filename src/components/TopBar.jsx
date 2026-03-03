import React from 'react';
import { useLocation } from 'react-router-dom';
import { Printer, Bell, Menu } from 'lucide-react';

const PAGE_TITLES = {
    '/': { title: 'SSL/TLS Scanner', subtitle: 'Analyze any domain\'s security configuration' },
    '/history': { title: 'Scan History', subtitle: 'View and manage past security scans' },
};

export default function TopBar({ onMenuToggle, onPrint, showPrint = false }) {
    const location = useLocation();
    const page = PAGE_TITLES[location.pathname] || { title: 'SSL/TLS Checker', subtitle: '' };

    return (
        <header
            className="flex items-center justify-between px-6 no-print"
            style={{
                height: '72px',
                background: 'rgba(8, 8, 20, 0.85)',
                borderBottom: '1px solid rgba(0,212,255,0.1)',
                backdropFilter: 'blur(20px)',
                flexShrink: 0,
            }}
        >
            {/* Left: mobile menu + page title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: '#64748b', cursor: 'pointer' }}
                >
                    <Menu size={18} />
                </button>
                <div>
                    <h1 className="text-base font-bold" style={{ color: '#e2e8f0' }}>{page.title}</h1>
                    <p className="text-xs" style={{ color: '#334155' }}>{page.subtitle}</p>
                </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
                {/* Live indicator */}
                <div
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)' }}
                >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }} />
                    <span className="text-xs font-medium" style={{ color: '#334155' }}>Live Analysis</span>
                </div>

                {/* Print button (only shown when results exist) */}
                {showPrint && (
                    <button
                        onClick={onPrint}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <Printer size={14} />
                        <span className="hidden sm:block">Export PDF</span>
                    </button>
                )}
            </div>
        </header>
    );
}
