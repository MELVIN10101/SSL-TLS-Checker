import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Clock, Lock, AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const App = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState('');

  const exampleDomains = [
    { name: 'google.com', label: null },
    { name: 'github.com', label: null },
    { name: 'expired.badssl.com', label: '(test expired cert)' }
  ];

  // Timer effect
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const stripDomain = (input) => {
    return input
      .replace(/^https?:\/\//i, '')
      .replace(/\/$/, '')
      .trim();
  };

  const pollSSLStatus = useCallback(async (cleanDomain) => {
    const statusMessages = [
      'DNS lookup in progress...',
      'Analyzing TLS handshake...',
      'Performing cryptographic assessment...',
      'Grading security configuration...',
      'Finalizing report...'
    ];

    let attempt = 0;
    const maxAttempts = 60; // 10 minutes max

    const poll = async () => {
      if (attempt >= maxAttempts) {
        throw new Error('Analysis timeout - taking too long');
      }

      const messageIndex = Math.min(attempt, statusMessages.length - 1);
      setStatusMessage(statusMessages[messageIndex]);

      try {
        const response = await fetch(
          `/api/ssl?host=${encodeURIComponent(cleanDomain)}&all=done`
        );
        
        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();

        if (data.status === 'READY') {
          return data;
        }

        if (data.status === 'ERROR') {
          throw new Error(data.statusDetails || 'Analysis failed');
        }

        // Continue polling
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        return poll();
      } catch (err) {
        throw err;
      }
    };

    return poll();
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    
    const cleanDomain = stripDomain(domain);
    
    if (!cleanDomain) {
      setError('Please enter a domain');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setElapsedTime(0);
    setStatusMessage('Starting analysis...');

    try {
      const data = await pollSSLStatus(cleanDomain);
      
      if (data.endpoints && data.endpoints.length > 0) {
        setResult(data);
        setStatusMessage('');
      } else {
        throw new Error('No endpoint data found');
      }
    } catch (err) {
      setError(err.message || 'Failed to scan domain. Please check the domain name and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleDomain) => {
    setDomain(exampleDomain);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-600';
    if (grade === 'A+' || grade === 'A') return 'bg-green-500';
    if (grade === 'B') return 'bg-yellow-500';
    if (grade === 'C') return 'bg-orange-500';
    if (grade === 'D' || grade === 'F') return 'bg-red-600';
    if (grade === 'T') return 'bg-red-600';
    return 'bg-gray-600';
  };

  const getTLSVersionColor = (version) => {
    if (version.includes('1.3')) return 'text-green-400';
    if (version.includes('1.2')) return 'text-yellow-400';
    if (version.includes('1.0') || version.includes('1.1')) return 'text-red-500';
    return 'text-gray-300';
  };

  const getTLSVersionStatus = (version) => {
    if (version.includes('1.3')) return { label: 'SECURE', color: 'text-green-400', bg: 'bg-green-900/20' };
    if (version.includes('1.2')) return { label: 'OK', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    if (version.includes('1.0') || version.includes('1.1')) return { label: 'INSECURE', color: 'text-red-500', bg: 'bg-red-900/20' };
    return { label: 'UNKNOWN', color: 'text-gray-300', bg: 'bg-gray-900/20' };
  };

  const getCipherStrength = (score) => {
    if (score >= 80) return { label: 'Strong', color: 'text-green-400' };
    if (score >= 60) return { label: 'Good', color: 'text-yellow-400' };
    if (score >= 40) return { label: 'Fair', color: 'text-orange-400' };
    return { label: 'Weak', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen scanline" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Header Section */}
      <div className="border-b border-cyan-500/20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-cyan-400">SSL/TLS Checker</h1>
          </div>
          <p className="text-gray-400 text-sm">Analyze SSL/TLS security configuration</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Input Section */}
        <form onSubmit={handleScan} className="mb-8">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter domain (e.g., example.com)"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-cyan-900/10 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Scanning...
                </>
              ) : (
                <>
                  Scan
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Example Domains */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 self-center">Examples:</span>
            {exampleDomains.map(({ name, label }) => (
              <button
                key={name}
                type="button"
                onClick={() => handleExampleClick(name)}
                disabled={loading}
                className="text-xs px-3 py-1 bg-cyan-900/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {name} {label && <span className="text-gray-500 ml-1">{label}</span>}
              </button>
            ))}
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="animated-scanning mb-8 p-8 bg-cyan-900/10 border border-cyan-500/30 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
            <p className="text-cyan-400 font-mono text-sm mb-2">{statusMessage}</p>
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Scanning... {elapsedTime}s
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold">Scan Failed</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Grade Badge */}
            <div className="text-center mb-8">
              <div className={`inline-block ${getGradeColor(result.grade)} rounded-full w-40 h-40 flex items-center justify-center shadow-2xl mb-4`}>
                <div className="text-center">
                  <Shield className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-white text-6xl font-bold">{result.grade || 'N/A'}</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg">{result.protocol || 'HTTPS'}</p>
            </div>

            {/* Certificate Info */}
            {result.endpoints && result.endpoints[0] && result.endpoints[0].details && (
              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: '#111118', borderColor: 'rgba(0, 255, 159, 0.2)' }}
              >
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Certificate Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {result.endpoints[0].details.certChain && result.endpoints[0].details.certChain.certs && result.endpoints[0].details.certChain.certs.length > 0 && (
                    <>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Subject</p>
                        <p className="text-white font-mono text-xs">{result.endpoints[0].details.certChain.certs[0].subject || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Issuer</p>
                        <p className="text-white font-mono text-xs">{result.endpoints[0].details.certChain.certs[0].issuerLabel || result.endpoints[0].details.certChain.certs[0].issuer || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Expires</p>
                        <p className="text-white font-mono text-xs">
                          {result.endpoints[0].details.certChain.certs[0].notAfter
                            ? new Date(result.endpoints[0].details.certChain.certs[0].notAfter).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Days Remaining</p>
                        <p className="text-white font-mono text-xs">
                          {result.endpoints[0].details.certChain.certs[0].notAfter
                            ? Math.ceil((new Date(result.endpoints[0].details.certChain.certs[0].notAfter) - new Date()) / (1000 * 60 * 60 * 24))
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Wildcard</p>
                        <p className="text-white font-mono text-xs">{result.endpoints[0].details.certChain.certs[0].altNames && result.endpoints[0].details.certChain.certs[0].altNames.some(name => name.startsWith('*')) ? 'Yes' : 'No'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TLS Versions */}
            {result.endpoints && result.endpoints[0] && result.endpoints[0].details && result.endpoints[0].details.protocols && (
              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: '#111118', borderColor: 'rgba(0, 255, 159, 0.2)' }}
              >
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  TLS Versions Supported
                </h2>
                <div className="space-y-2">
                  {result.endpoints[0].details.protocols.map((protocol, idx) => {
                    const status = getTLSVersionStatus(protocol.name);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-cyan-900/10 rounded border border-cyan-500/10">
                        <span className="text-white font-mono">{protocol.name}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cipher Suites */}
            {result.endpoints && result.endpoints[0] && result.endpoints[0].details && result.endpoints[0].details.suites && (
              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: '#111118', borderColor: 'rgba(0, 255, 159, 0.2)' }}
              >
                <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Top Cipher Suites
                </h2>
                <div className="space-y-2">
                  {result.endpoints[0].details.suites[0]?.suites?.slice(0, 8).map((cipher, idx) => {
                    const strength = getCipherStrength(cipher.strength || 0);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-cyan-900/10 rounded border border-cyan-500/10">
                        <span className="text-white font-mono text-xs">{cipher.name}</span>
                        <span className={`text-xs font-semibold ${strength.color}`}>
                          {strength.label}
                        </span>
                      </div>
                    );
                  }) || <p className="text-gray-400">No cipher suite data available</p>}
                </div>
              </div>
            )}

            {/* Key Issues */}
            {result.endpoints && result.endpoints[0] && result.endpoints[0].details && result.endpoints[0].details.issues && result.endpoints[0].details.issues.length > 0 && (
              <div
                className="p-6 rounded-lg border"
                style={{ backgroundColor: '#111118', borderColor: 'rgba(255, 107, 107, 0.3)' }}
              >
                <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Key Issues & Warnings
                </h2>
                <div className="space-y-2">
                  {result.endpoints[0].details.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-red-900/10 rounded border border-red-500/10">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scan Again Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => {
                  setResult(null);
                  setDomain('');
                  setError('');
                  setElapsedTime(0);
                }}
                className="px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-semibold rounded-lg transition"
              >
                Scan Another Domain
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !result && !error && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
            <p className="text-gray-400">Enter a domain to analyze its SSL/TLS configuration</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
