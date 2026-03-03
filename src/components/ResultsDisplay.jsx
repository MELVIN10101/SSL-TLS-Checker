import React, { useState } from 'react';
import {
    Lock, Globe, AlertTriangle, CheckCircle, XCircle, Wifi,
    FileText, Activity, Award, Key, Server, ShieldCheck,
    ShieldAlert, ShieldX, Info, RefreshCw, Printer
} from 'lucide-react';
import {
    Card, SectionHeader, InfoRow, CheckRow, ScoreGauge, GradeBadge, StatCard
} from './UI';
import {
    formatDate, getDaysColor, getScoreColor, getProtocolBadge, getCipherBadge
} from '../utils/helpers';

const TABS = ['Overview', 'Certificate', 'Protocols', 'Security Headers', 'Assessment'];

export default function ResultsDisplay({ result, scanTime, onReset, compact = false }) {
    const [activeTab, setActiveTab] = useState('Overview');

    if (!result) return null;

    const handlePrint = () => window.print();

    return (
        <div className="animate-fade-in">

            {/* ── Actions bar ── */}
            {!compact && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 no-print">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <Globe size={14} style={{ color: '#64748b' }} />
                            <span className="mono text-sm font-semibold" style={{ color: '#94a3b8' }}>{result.hostname}</span>
                        </div>
                        {scanTime && <p className="text-xs" style={{ color: '#334155' }}>Scanned: {scanTime}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                        >
                            <Printer size={14} />
                            Export PDF
                        </button>
                        {onReset && (
                            <button
                                onClick={onReset}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', cursor: 'pointer' }}
                            >
                                <RefreshCw size={14} />
                                New Scan
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Hero: Grade + Score + Stats ── */}
            <div
                className="glass rounded-2xl p-6 mb-5 animate-fade-in"
                style={{ background: 'linear-gradient(135deg, rgba(12,12,28,0.95), rgba(18,18,40,0.9))' }}
            >
                {/* Print header */}
                <div className="print-only mb-4" style={{ display: 'none' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>SSL/TLS Security Report</h2>
                    <p style={{ color: '#555', fontSize: '13px' }}>Domain: {result.hostname} | Scanned: {scanTime}</p>
                    <hr style={{ marginTop: '12px' }} />
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Grade */}
                    <GradeBadge grade={result.grade} />

                    {/* Score gauge */}
                    <ScoreGauge score={result.score || 0} />

                    {/* Quick Stats grid */}
                    <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                        <StatCard
                            label="Certificate"
                            value={result.certificate?.isExpired ? 'Expired' : result.certificate?.expiringSoon ? 'Expiring Soon' : 'Valid'}
                            icon={result.certificate?.isExpired ? ShieldX : ShieldCheck}
                            status={result.certificate?.isExpired ? 'danger' : result.certificate?.expiringSoon ? 'warning' : 'safe'}
                        />
                        <StatCard
                            label="Protocol"
                            value={result.connection?.protocol || 'Unknown'}
                            icon={Wifi}
                            status={result.connection?.protocolInfo?.secure ? 'safe' : 'danger'}
                        />
                        <StatCard
                            label="HTTPS Redirect"
                            value={result.httpsRedirect?.redirects ? 'Enabled' : result.httpsRedirect?.redirects === null ? 'Unknown' : 'Missing'}
                            icon={Lock}
                            status={result.httpsRedirect?.redirects ? 'safe' : result.httpsRedirect?.redirects === null ? 'gray' : 'warning'}
                        />
                        <StatCard
                            label="HSTS"
                            value={result.securityHeaders?.hsts ? 'Enabled' : 'Missing'}
                            icon={ShieldCheck}
                            status={result.securityHeaders?.hsts ? 'safe' : 'warning'}
                        />
                    </div>

                    {/* Issues/Warnings mini panel */}
                    {(result.assessment?.issues?.length > 0 || result.assessment?.warnings?.length > 0) && (
                        <div className="lg:w-52 w-full space-y-3">
                            {result.assessment.issues.length > 0 && (
                                <div
                                    className="rounded-xl p-3"
                                    style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}
                                >
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <AlertTriangle size={12} style={{ color: '#ef4444' }} />
                                        <span className="text-xs font-bold" style={{ color: '#ef4444' }}>
                                            {result.assessment.issues.length} Issue{result.assessment.issues.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    {result.assessment.issues.slice(0, 2).map((iss, i) => (
                                        <p key={i} className="text-xs leading-snug" style={{ color: '#94a3b8' }}>• {iss}</p>
                                    ))}
                                    {result.assessment.issues.length > 2 && (
                                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>+{result.assessment.issues.length - 2} more</p>
                                    )}
                                </div>
                            )}
                            {result.assessment.warnings.length > 0 && (
                                <div
                                    className="rounded-xl p-3"
                                    style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}
                                >
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Info size={12} style={{ color: '#fbbf24' }} />
                                        <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>
                                            {result.assessment.warnings.length} Warning{result.assessment.warnings.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    {result.assessment.warnings.slice(0, 2).map((w, i) => (
                                        <p key={i} className="text-xs leading-snug" style={{ color: '#94a3b8' }}>• {w}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 mb-5 overflow-x-auto no-print" style={{ borderBottom: '1px solid rgba(0,212,255,0.1)', paddingBottom: '2px' }}>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}

            {/* OVERVIEW */}
            {activeTab === 'Overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Card>
                        <SectionHeader icon={Wifi} title="Connection Details" color="#00d4ff" />
                        <InfoRow label="Protocol" value={result.connection?.protocol} />
                        <InfoRow label="Cipher Suite" value={result.connection?.cipher?.name} mono />
                        <InfoRow
                            label="Cipher Strength"
                            value={result.connection?.cipher?.strength?.strength}
                            badge={result.connection?.cipher ? getCipherBadge(result.connection.cipher.strength?.strength) : undefined}
                        />
                        {result.connection?.ephemeralKey && (
                            <InfoRow label="Key Exchange" value={`${result.connection.ephemeralKey.type} ${result.connection.ephemeralKey.size || ''}`.trim()} />
                        )}
                        <InfoRow
                            label="Authorized"
                            value={result.authorized ? 'Trusted certificate' : `Untrusted — ${result.authError || 'Unknown error'}`}
                            badge={result.authorized ? 'badge-safe' : 'badge-danger'}
                        />
                        <InfoRow
                            label="HTTPS Redirect"
                            value={result.httpsRedirect?.redirects ? `Yes → ${result.httpsRedirect.redirectsTo || ''}` : result.httpsRedirect?.redirects === null ? 'Could not check' : 'Not configured'}
                            badge={result.httpsRedirect?.redirects ? 'badge-safe' : 'badge-warning'}
                        />
                    </Card>

                    <Card>
                        <SectionHeader icon={FileText} title="Certificate Summary" color="#00ff9f" />
                        {result.certificate ? (
                            <>
                                <InfoRow label="Common Name" value={result.certificate.subjectCN} mono />
                                <InfoRow label="Issued By" value={result.certificate.issuerCN} />
                                <InfoRow label="Organization" value={result.certificate.issuerO} />
                                <InfoRow label="Key Type" value={result.certificate.keyType} />
                                <InfoRow
                                    label="Validity"
                                    value={result.certificate.isExpired ? 'EXPIRED' : `${result.certificate.daysRemaining} days remaining`}
                                    badge={getDaysColor(result.certificate.daysRemaining)}
                                />
                                <InfoRow label="Wildcard" value={result.certificate.isWildcard ? 'Yes' : 'No'} badge={result.certificate.isWildcard ? 'badge-info' : 'badge-gray'} />
                            </>
                        ) : (
                            <p className="text-sm" style={{ color: '#64748b' }}>No certificate data</p>
                        )}
                    </Card>

                    {result.assessment?.positives?.length > 0 && (
                        <Card className="lg:col-span-2">
                            <SectionHeader icon={ShieldCheck} title="Security Positives" color="#00ff9f" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {result.assessment.positives.map((pos, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-2 p-3 rounded-xl"
                                        style={{ background: 'rgba(0,255,159,0.04)', border: '1px solid rgba(0,255,159,0.12)' }}
                                    >
                                        <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#00ff9f' }} />
                                        <p className="text-sm" style={{ color: '#94a3b8' }}>{pos}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* CERTIFICATE */}
            {activeTab === 'Certificate' && (
                <div className="space-y-5">
                    <Card>
                        <SectionHeader icon={Lock} title="Certificate Details" color="#00d4ff" />
                        {result.certificate ? (
                            <>
                                <InfoRow label="Subject" value={result.certificate.subject} mono />
                                <InfoRow label="Common Name" value={result.certificate.subjectCN} mono />
                                <InfoRow label="Issuer" value={result.certificate.issuer} mono />
                                <InfoRow label="Issuer CN" value={result.certificate.issuerCN} />
                                <InfoRow label="Organization" value={result.certificate.issuerO} />
                                <InfoRow label="Valid From" value={formatDate(result.certificate.notBefore)} />
                                <InfoRow label="Expires" value={formatDate(result.certificate.notAfter)} />
                                <InfoRow
                                    label="Days Remaining"
                                    value={result.certificate.daysRemaining !== null ? String(result.certificate.daysRemaining) : 'N/A'}
                                    badge={getDaysColor(result.certificate.daysRemaining)}
                                />
                                <InfoRow label="Key Type" value={result.certificate.keyType} />
                                <InfoRow label="Serial Number" value={result.certificate.serialNumber} mono />
                                <InfoRow label="Fingerprint SHA-256" value={result.certificate.fingerprint} mono />
                                <InfoRow label="Wildcard" value={result.certificate.isWildcard ? 'Yes' : 'No'} badge={result.certificate.isWildcard ? 'badge-info' : 'badge-gray'} />
                                <InfoRow
                                    label="Trusted"
                                    value={result.authorized ? 'Yes' : `No — ${result.authError || 'Untrusted certificate'}`}
                                    badge={result.authorized ? 'badge-safe' : 'badge-danger'}
                                />
                            </>
                        ) : (
                            <p style={{ color: '#64748b' }}>Certificate data unavailable</p>
                        )}
                    </Card>

                    {result.certificate?.altNames?.length > 0 && (
                        <Card>
                            <SectionHeader icon={Globe} title={`Subject Alternative Names (${result.certificate.altNames.length})`} color="#a855f7" />
                            <div className="flex flex-wrap gap-2">
                                {result.certificate.altNames.map((san, i) => (
                                    <span
                                        key={i}
                                        className="mono text-xs px-3 py-1.5 rounded-lg"
                                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}
                                    >
                                        {san}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* PROTOCOLS */}
            {activeTab === 'Protocols' && (
                <div className="space-y-5">
                    <Card>
                        <SectionHeader icon={Wifi} title="Negotiated Connection" color="#00d4ff" />
                        <div
                            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm"
                            style={{
                                background: result.connection?.protocolInfo?.secure ? 'rgba(0,255,159,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${result.connection?.protocolInfo?.secure ? 'rgba(0,255,159,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                color: result.connection?.protocolInfo?.secure ? '#00ff9f' : '#ef4444',
                            }}
                        >
                            <Lock size={16} />
                            {result.connection?.protocol || 'Unknown'} — {result.connection?.protocolInfo?.status || ''}
                        </div>
                    </Card>

                    {result.protocolSupport?.length > 0 && (
                        <Card>
                            <SectionHeader icon={Activity} title="Protocol Version Support Matrix" color="#a855f7" />
                            <div className="space-y-3">
                                {result.protocolSupport.map((proto, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-4 rounded-xl"
                                        style={{
                                            background: proto.supported && !proto.secure ? 'rgba(239,68,68,0.05)' : proto.supported ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.2)',
                                            border: proto.supported && !proto.secure ? '1px solid rgba(239,68,68,0.2)' : proto.supported ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.03)',
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            {proto.supported && proto.secure ? <CheckCircle size={16} style={{ color: '#00ff9f' }} /> :
                                                proto.supported && !proto.secure ? <AlertTriangle size={16} style={{ color: '#ef4444' }} /> :
                                                    <XCircle size={16} style={{ color: '#334155' }} />}
                                            <span className="font-semibold mono text-sm" style={{ color: proto.supported ? '#e2e8f0' : '#475569' }}>
                                                {proto.displayName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getProtocolBadge(proto.color)}`}>
                                                {proto.status}
                                            </span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${proto.supported ? 'badge-info' : 'badge-gray'}`}>
                                                {proto.supported ? 'SUPPORTED' : 'NOT SUPPORTED'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card>
                        <SectionHeader icon={Key} title="Active Cipher Suite" color="#00d4ff" />
                        {result.connection?.cipher ? (
                            <>
                                <div
                                    className="p-4 rounded-xl mb-4 mono text-sm"
                                    style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', color: '#00d4ff' }}
                                >
                                    {result.connection.cipher.name}
                                </div>
                                <div className="grid grid-cols-2 gap-0">
                                    <InfoRow label="Cipher Version" value={result.connection.cipher.version} />
                                    <InfoRow label="Strength" value={result.connection.cipher.strength?.strength} badge={getCipherBadge(result.connection.cipher.strength?.strength)} />
                                    {result.connection.cipher.strength?.bits && (
                                        <InfoRow label="Key Length" value={`${result.connection.cipher.strength.bits}-bit`} />
                                    )}
                                </div>
                            </>
                        ) : <p style={{ color: '#64748b' }}>Cipher data unavailable</p>}
                    </Card>
                </div>
            )}

            {/* SECURITY HEADERS */}
            {activeTab === 'Security Headers' && (
                <div className="space-y-5">
                    {result.securityHeaders ? (
                        <>
                            <Card>
                                <SectionHeader icon={Award} title="Security Header Score" color="#00d4ff" />
                                <div className="mb-3 flex justify-between">
                                    <span className="text-sm" style={{ color: '#64748b' }}>Coverage</span>
                                    <span className="text-sm font-bold" style={{ color: getScoreColor(result.securityHeaders.score) }}>
                                        {result.securityHeaders.score}/100
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${result.securityHeaders.score}%`,
                                            background: `linear-gradient(90deg, ${getScoreColor(result.securityHeaders.score)}, ${getScoreColor(result.securityHeaders.score)}88)`,
                                        }}
                                    />
                                </div>
                            </Card>

                            <Card>
                                <SectionHeader icon={Server} title="HTTP Security Headers" color="#a855f7" />
                                <CheckRow label="Strict-Transport-Security (HSTS)" present={result.securityHeaders.hsts} value={result.securityHeaders.hstsValue} description="Forces HTTPS and prevents SSL stripping attacks" />
                                <CheckRow label="Content-Security-Policy (CSP)" present={result.securityHeaders.csp} value={result.securityHeaders.cspValue} description="Controls resource loading, prevents XSS" />
                                <CheckRow label="X-Content-Type-Options" present={result.securityHeaders.xContentTypeOptions} value={result.securityHeaders.xContentTypeOptionsValue} description="Prevents MIME type sniffing" />
                                <CheckRow label="X-Frame-Options" present={result.securityHeaders.xFrameOptions} value={result.securityHeaders.xFrameOptionsValue} description="Prevents clickjacking via iframes" />
                                <CheckRow label="X-XSS-Protection" present={result.securityHeaders.xssProtection} value={result.securityHeaders.xssProtectionValue} description="Browser built-in XSS filter" />
                                <CheckRow label="Referrer-Policy" present={result.securityHeaders.referrerPolicy} value={result.securityHeaders.referrerPolicyValue} description="Controls referrer info sharing" />
                                <CheckRow label="Permissions-Policy" present={result.securityHeaders.permissionsPolicy} value={result.securityHeaders.permissionsPolicyValue} description="Controls browser API access" />
                            </Card>

                            {result.securityHeaders.server && (
                                <Card>
                                    <SectionHeader icon={Info} title="Server Banner Disclosure" color="#fbbf24" />
                                    <div className="p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}>
                                        <p className="text-xs mb-1" style={{ color: '#fbbf24' }}>⚠ Server header reveals software info (consider removing)</p>
                                        <p className="mono text-sm" style={{ color: '#94a3b8' }}>{result.securityHeaders.server}</p>
                                    </div>
                                </Card>
                            )}
                        </>
                    ) : (
                        <Card>
                            <p style={{ color: '#64748b' }}>Security headers data unavailable</p>
                        </Card>
                    )}
                </div>
            )}

            {/* ASSESSMENT */}
            {activeTab === 'Assessment' && (
                <div className="space-y-5">
                    {result.assessment?.issues?.length > 0 && (
                        <Card>
                            <SectionHeader icon={ShieldX} title="Critical Issues" color="#ef4444" />
                            <div className="space-y-2">
                                {result.assessment.issues.map((issue, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <XCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                                        <p className="text-sm" style={{ color: '#fca5a5' }}>{issue}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                    {result.assessment?.warnings?.length > 0 && (
                        <Card>
                            <SectionHeader icon={AlertTriangle} title="Warnings & Recommendations" color="#fbbf24" />
                            <div className="space-y-2">
                                {result.assessment.warnings.map((w, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                                        <p className="text-sm" style={{ color: '#fde68a' }}>{w}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                    {result.assessment?.positives?.length > 0 && (
                        <Card>
                            <SectionHeader icon={ShieldCheck} title="What's Working Well" color="#00ff9f" />
                            <div className="space-y-2">
                                {result.assessment.positives.map((pos, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(0,255,159,0.04)', border: '1px solid rgba(0,255,159,0.15)' }}>
                                        <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#00ff9f' }} />
                                        <p className="text-sm" style={{ color: '#a7f3d0' }}>{pos}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                    {!result.assessment?.issues?.length && !result.assessment?.warnings?.length && (
                        <Card>
                            <div className="text-center py-10">
                                <ShieldCheck size={52} className="mx-auto mb-4" style={{ color: '#00ff9f' }} />
                                <p className="text-xl font-bold" style={{ color: '#00ff9f' }}>No Issues Found!</p>
                                <p className="text-sm mt-2" style={{ color: '#64748b' }}>This domain passed all security checks.</p>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
