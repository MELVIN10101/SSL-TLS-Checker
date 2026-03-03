import React from 'react';

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', style = {} }) => (
    <div className={`glass rounded-2xl p-6 glass-hover animate-fade-in ${className}`} style={style}>
        {children}
    </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
export const SectionHeader = ({ icon: Icon, title, color = '#00d4ff', badge, className = '' }) => (
    <div className={`flex items-center justify-between mb-5 ${className}`}>
        <div className="flex items-center gap-3">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18`, border: `1px solid ${color}40` }}
            >
                <Icon size={18} style={{ color }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color }}>{title}</h2>
        </div>
        {badge && <div className="text-xs font-semibold">{badge}</div>}
    </div>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────
export const InfoRow = ({ label, value, mono = false, badge = null }) => (
    <div className="flex items-start justify-between py-2.5 border-b" style={{ borderColor: 'rgba(0,212,255,0.06)' }}>
        <span className="text-xs font-medium uppercase tracking-wider flex-shrink-0 mr-4" style={{ color: '#64748b', minWidth: '150px' }}>
            {label}
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-end">
            {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge}`} />}
            <span className={`text-sm text-right break-all ${mono ? 'mono' : ''}`} style={{ color: '#cbd5e1' }}>
                {value || 'N/A'}
            </span>
        </div>
    </div>
);

// ─── Check Row ────────────────────────────────────────────────────────────────
import { CheckCircle, XCircle } from 'lucide-react';

export const CheckRow = ({ label, present, value, description }) => (
    <div
        className="flex items-start justify-between p-3 rounded-xl mb-2"
        style={{
            background: present ? 'rgba(0,255,159,0.04)' : 'rgba(239,68,68,0.04)',
            border: `1px solid ${present ? 'rgba(0,255,159,0.15)' : 'rgba(239,68,68,0.15)'}`,
        }}
    >
        <div className="flex items-start gap-3">
            {present
                ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#00ff9f' }} />
                : <XCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            }
            <div>
                <p className="text-sm font-semibold" style={{ color: present ? '#00ff9f' : '#f87171' }}>{label}</p>
                {description && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{description}</p>}
                {present && value && value !== 'true' && (
                    <p className="text-xs mono mt-1 break-all" style={{ color: '#94a3b8', maxWidth: '380px' }}>
                        {String(value).slice(0, 100)}{String(value).length > 100 ? '…' : ''}
                    </p>
                )}
            </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 ml-2 ${present ? 'badge-safe' : 'badge-danger'}`}>
            {present ? 'PRESENT' : 'MISSING'}
        </span>
    </div>
);

// ─── Score Gauge ─────────────────────────────────────────────────────────────
import { getScoreColor } from '../utils/helpers';

export const ScoreGauge = ({ score }) => {
    const color = getScoreColor(score);
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <svg width="128" height="128" viewBox="0 0 128 128">
                <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={color + '88'} />
                    </linearGradient>
                </defs>
                <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeDashoffset={circumference / 4}
                    style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: 'stroke-dasharray 1.2s ease' }}
                />
                <text x="64" y="59" textAnchor="middle" fill={color} fontSize="26" fontWeight="800" fontFamily="Inter">{score}</text>
                <text x="64" y="76" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="Inter">/ 100</text>
            </svg>
            <p className="text-xs font-semibold mt-1" style={{ color: '#64748b' }}>Security Score</p>
        </div>
    );
};

// ─── Grade Badge ─────────────────────────────────────────────────────────────
import { Shield } from 'lucide-react';
import { getGradeClass, getGradeTextColor } from '../utils/helpers';

export const GradeBadge = ({ grade, size = 'lg' }) => {
    const isLg = size === 'lg';
    return (
        <div className="flex flex-col items-center">
            <div
                className={`${getGradeClass(grade)} rounded-2xl flex flex-col items-center justify-center grade-badge`}
                style={{ width: isLg ? 128 : 64, height: isLg ? 128 : 64 }}
            >
                <Shield size={isLg ? 24 : 14} style={{ color: getGradeTextColor(grade), marginBottom: isLg ? 4 : 2 }} />
                <span
                    className="font-black leading-none"
                    style={{ fontSize: isLg ? 46 : 22, color: getGradeTextColor(grade) }}
                >
                    {grade || '?'}
                </span>
            </div>
            <p className="text-xs font-medium mt-2" style={{ color: '#64748b' }}>Security Grade</p>
        </div>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, status }) => {
    const colors = {
        safe: { bg: 'rgba(0,255,159,0.07)', border: 'rgba(0,255,159,0.2)', text: '#00ff9f', icon: '#00ff9f' },
        warning: { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)', text: '#fbbf24', icon: '#fbbf24' },
        danger: { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)', text: '#ef4444', icon: '#ef4444' },
        gray: { bg: 'rgba(100,116,139,0.07)', border: 'rgba(100,116,139,0.2)', text: '#94a3b8', icon: '#64748b' },
    }[status] || {};

    return (
        <div className="rounded-xl p-4" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon size={13} style={{ color: colors.icon }} />}
                <span className="text-xs" style={{ color: '#64748b' }}>{label}</span>
            </div>
            <p className="text-sm font-bold" style={{ color: colors.text }}>{value}</p>
        </div>
    );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ className, children }) => (
    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${className}`}>{children}</span>
);
