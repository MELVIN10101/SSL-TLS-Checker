import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Shield, Search, History, ChevronLeft, ChevronRight,
    Globe, Zap, Settings, Menu
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/', icon: Search, label: 'Scanner', exact: true },
    { path: '/history', icon: History, label: 'History' },
];

export default function Sidebar({ collapsed, onToggle }) {
    const location = useLocation();

    return (
        <aside
            className="sidebar flex flex-col h-full transition-all duration-300 ease-in-out relative"
            style={{
                width: collapsed ? '72px' : '240px',
                background: 'rgba(8, 8, 20, 0.95)',
                borderRight: '1px solid rgba(0,212,255,0.1)',
                backdropFilter: 'blur(20px)',
                flexShrink: 0,
            }}
        >
            {/* Logo */}
            <div
                className="flex items-center gap-3 px-4 py-5 border-b"
                style={{ borderColor: 'rgba(0,212,255,0.08)', minHeight: '72px' }}
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,159,0.1))',
                        border: '1px solid rgba(0,212,255,0.35)',
                    }}
                >
                    <Shield size={20} style={{ color: '#00d4ff' }} />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gradient-cyan glow-text-cyan whitespace-nowrap">SSL/TLS</p>
                        <p className="text-xs whitespace-nowrap" style={{ color: '#334155' }}>Security Analyzer</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {!collapsed && (
                    <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: '#1e3a5f' }}>
                        Navigation
                    </p>
                )}
                {NAV_ITEMS.map(({ path, icon: Icon, label, exact }) => {
                    const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
                    return (
                        <NavLink
                            key={path}
                            to={path}
                            end={exact}
                            className="flex items-center gap-3 rounded-xl transition-all duration-200 group no-underline"
                            style={({ isActive }) => ({
                                padding: collapsed ? '10px 0' : '10px 14px',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                                border: isActive ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
                                color: isActive ? '#00d4ff' : '#475569',
                                marginBottom: '2px',
                                textDecoration: 'none',
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className="relative flex-shrink-0">
                                        <Icon
                                            size={18}
                                            style={{
                                                color: isActive ? '#00d4ff' : '#475569',
                                                filter: isActive ? 'drop-shadow(0 0 6px rgba(0,212,255,0.5))' : 'none',
                                                transition: 'all 0.2s',
                                            }}
                                        />
                                        {isActive && (
                                            <span
                                                className="absolute -right-0.5 -top-0.5 w-1.5 h-1.5 rounded-full"
                                                style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }}
                                            />
                                        )}
                                    </span>
                                    {!collapsed && (
                                        <span className="text-sm font-semibold whitespace-nowrap" style={{ color: isActive ? '#00d4ff' : '#64748b' }}>
                                            {label}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="px-2 pb-4 border-t" style={{ borderColor: 'rgba(0,212,255,0.08)', paddingTop: '12px' }}>
                {/* Status dot */}
                {!collapsed && (
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2"
                        style={{ background: 'rgba(0,255,159,0.05)', border: '1px solid rgba(0,255,159,0.12)' }}
                    >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00ff9f', boxShadow: '0 0 6px #00ff9f' }} />
                        <span className="text-xs" style={{ color: '#00ff9f' }}>API Online</span>
                    </div>
                )}
                {collapsed && (
                    <div className="flex justify-center mb-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#00ff9f', boxShadow: '0 0 6px #00ff9f' }} />
                    </div>
                )}
            </div>

            {/* Collapse toggle */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-20 no-print"
                style={{
                    background: '#0a0a1e',
                    border: '1px solid rgba(0,212,255,0.3)',
                    color: '#00d4ff',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(0,212,255,0.2)',
                }}
                aria-label="Toggle sidebar"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </aside>
    );
}
