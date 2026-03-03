import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [showPrint, setShowPrint] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handlePrint = () => window.print();

    return (
        <div
            className="flex h-screen overflow-hidden relative"
            style={{ background: 'var(--bg-primary)' }}
        >
            {/* Background decorations */}
            <div className="bg-grid" />
            <div
                className="bg-glow"
                style={{ width: 700, height: 700, top: -200, left: -150, background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)' }}
            />
            <div
                className="bg-glow"
                style={{ width: 400, height: 400, bottom: 0, right: 0, background: 'radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)' }}
            />

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 md:hidden"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`relative z-40 flex-shrink-0 ${mobileOpen ? 'fixed md:relative inset-y-0 left-0' : 'hidden md:flex'}`}
                style={{ height: '100%' }}
            >
                <Sidebar
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <TopBar
                    onMenuToggle={() => setMobileOpen(!mobileOpen)}
                    onPrint={handlePrint}
                    showPrint={showPrint}
                />
                <main className="flex-1 overflow-y-auto">
                    <Outlet context={{ setShowPrint }} />
                </main>
            </div>
        </div>
    );
}
