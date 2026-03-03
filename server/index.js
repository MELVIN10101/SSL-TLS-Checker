import express from 'express';
import cors from 'cors';
import tls from 'tls';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── Utility Functions ───────────────────────────────────────────────────────

function parseCertificate(cert) {
  if (!cert) return null;

  const now = new Date();
  const notAfter = cert.valid_to ? new Date(cert.valid_to) : null;
  const notBefore = cert.valid_from ? new Date(cert.valid_from) : null;
  const daysRemaining = notAfter ? Math.ceil((notAfter - now) / (1000 * 60 * 60 * 24)) : null;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;
  const expiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;

  // Parse Subject
  const subject = cert.subject ? Object.entries(cert.subject).map(([k, v]) => `${k}=${v}`).join(', ') : 'N/A';
  const subjectCN = cert.subject?.CN || 'N/A';
  const issuer = cert.issuer ? Object.entries(cert.issuer).map(([k, v]) => `${k}=${v}`).join(', ') : 'N/A';
  const issuerCN = cert.issuer?.CN || cert.issuer?.O || 'N/A';
  const issuerO = cert.issuer?.O || 'N/A';

  // SANs
  const altNames = cert.subjectaltname
    ? cert.subjectaltname.split(', ').map(s => s.replace(/^DNS:|^IP:/i, '').trim())
    : [];

  const isWildcard = altNames.some(n => n.startsWith('*'));

  // Fingerprint
  const fingerprint = cert.fingerprint256 || cert.fingerprint || 'N/A';

  // Serial number
  const serialNumber = cert.serialNumber || 'N/A';

  return {
    subject,
    subjectCN,
    issuer,
    issuerCN,
    issuerO,
    notBefore: notBefore?.toISOString() || null,
    notAfter: notAfter?.toISOString() || null,
    daysRemaining,
    isExpired,
    expiringSoon,
    isWildcard,
    altNames,
    fingerprint,
    serialNumber,
    keyType: cert.bits ? `RSA ${cert.bits}-bit` : (cert.asn1Curve ? `EC ${cert.asn1Curve}` : 'Unknown'),
    bits: cert.bits || null,
    asn1Curve: cert.asn1Curve || null,
  };
}

function classifyTLSProtocol(protocol) {
  if (!protocol) return { name: 'Unknown', status: 'unknown', color: 'gray', secure: false };
  const clean = protocol.toUpperCase();
  if (clean === 'TLSV1.3' || clean === 'TLS1.3') return { name: 'TLS 1.3', status: 'Secure', color: 'green', secure: true };
  if (clean === 'TLSV1.2' || clean === 'TLS1.2') return { name: 'TLS 1.2', status: 'Acceptable', color: 'yellow', secure: true };
  if (clean === 'TLSV1.1' || clean === 'TLS1.1') return { name: 'TLS 1.1', status: 'Deprecated', color: 'orange', secure: false };
  if (clean === 'TLSV1' || clean === 'TLS1.0') return { name: 'TLS 1.0', status: 'Insecure', color: 'red', secure: false };
  if (clean.includes('SSL')) return { name: protocol, status: 'Critical', color: 'red', secure: false };
  return { name: protocol, status: 'Unknown', color: 'gray', secure: false };
}

function classifyCipherSuite(cipherName) {
  if (!cipherName) return { strength: 'Unknown', color: 'gray', bits: null };

  const upper = cipherName.toUpperCase();

  // Check for insecure ciphers
  if (upper.includes('NULL') || upper.includes('ANON') || upper.includes('EXP')) {
    return { strength: 'Critical', color: 'red', bits: 0 };
  }
  if (upper.includes('RC4') || upper.includes('DES') || upper.includes('MD5')) {
    return { strength: 'Weak', color: 'orange', bits: 56 };
  }
  if (upper.includes('3DES') || upper.includes('IDEA')) {
    return { strength: 'Fair', color: 'yellow', bits: 112 };
  }
  if (upper.includes('CHACHA20') || upper.includes('AES_256_GCM') || upper.includes('AES-256-GCM')) {
    return { strength: 'Excellent', color: 'green', bits: 256 };
  }
  if (upper.includes('AES_128_GCM') || upper.includes('AES-128-GCM') || upper.includes('AES256') || upper.includes('AES-256')) {
    return { strength: 'Strong', color: 'cyan', bits: 256 };
  }
  if (upper.includes('AES128') || upper.includes('AES-128')) {
    return { strength: 'Good', color: 'teal', bits: 128 };
  }
  return { strength: 'Unknown', color: 'gray', bits: null };
}

function computeGrade(certData, tlsProtocol, cipherName, headersData) {
  let score = 100;
  const issues = [];
  const warnings = [];
  const positives = [];

  // Certificate checks
  if (certData) {
    if (certData.isExpired) {
      score -= 50;
      issues.push('Certificate has EXPIRED');
    } else if (certData.expiringSoon) {
      score -= 10;
      warnings.push(`Certificate expires in ${certData.daysRemaining} days`);
    } else {
      positives.push(`Certificate valid for ${certData.daysRemaining} more days`);
    }

    // Only apply RSA minimum key size check — EC keys use different size metrics
    if (certData.asn1Curve) {
      // EC key
      if (certData.asn1Curve === 'prime256v1' || certData.asn1Curve === 'secp256r1') {
        positives.push('ECDSA P-256 (secp256r1) — efficient and secure');
      } else if (certData.asn1Curve === 'secp384r1') {
        positives.push('ECDSA P-384 — high-strength EC key');
      } else if (certData.asn1Curve === 'secp521r1') {
        positives.push('ECDSA P-521 — very high-strength EC key');
      } else {
        positives.push(`EC key: ${certData.asn1Curve}`);
      }
    } else if (certData.bits) {
      // RSA key
      if (certData.bits < 2048) {
        score -= 30;
        issues.push(`Weak RSA key size: ${certData.bits} bits (minimum 2048 recommended)`);
      } else if (certData.bits >= 4096) {
        positives.push('Strong RSA key (4096-bit)');
      } else if (certData.bits >= 2048) {
        positives.push('Adequate RSA key (2048-bit)');
      }
    }
  }

  // TLS Protocol checks
  const proto = classifyTLSProtocol(tlsProtocol);
  if (proto.name === 'TLS 1.3') {
    positives.push('TLS 1.3 in use (best available protocol)');
  } else if (proto.name === 'TLS 1.2') {
    score -= 5;
    warnings.push('TLS 1.2 in use (TLS 1.3 preferred)');
  } else if (proto.name === 'TLS 1.1') {
    score -= 25;
    issues.push('TLS 1.1 is deprecated and insecure');
  } else if (proto.name === 'TLS 1.0') {
    score -= 35;
    issues.push('TLS 1.0 is deprecated and vulnerable');
  } else if (proto.status === 'Critical') {
    score -= 50;
    issues.push(`SSLv3/SSLv2 is critically insecure: ${proto.name}`);
  }

  // Cipher suite checks
  const cipher = classifyCipherSuite(cipherName);
  if (cipher.strength === 'Critical') {
    score -= 40;
    issues.push(`Critical cipher in use: ${cipherName}`);
  } else if (cipher.strength === 'Weak') {
    score -= 25;
    issues.push(`Weak cipher in use: ${cipherName}`);
  } else if (cipher.strength === 'Fair') {
    score -= 10;
    warnings.push(`Fair cipher in use: ${cipherName}`);
  } else if (cipher.strength === 'Excellent' || cipher.strength === 'Strong') {
    positives.push(`Strong cipher suite: ${cipherName}`);
  }

  // HSTS check
  if (headersData) {
    if (headersData.hsts) {
      positives.push('HSTS header present (forces HTTPS)');
      score += 5;
    } else {
      warnings.push('HSTS header missing (Strict-Transport-Security)');
      score -= 5;
    }

    if (headersData.xContentTypeOptions) {
      positives.push('X-Content-Type-Options header present');
    } else {
      warnings.push('X-Content-Type-Options header missing');
    }

    if (headersData.xFrameOptions) {
      positives.push('X-Frame-Options header present');
    } else {
      warnings.push('X-Frame-Options header missing');
    }

    if (headersData.xssProtection) {
      positives.push('X-XSS-Protection header present');
    }

    if (headersData.csp) {
      positives.push('Content-Security-Policy header present');
    } else {
      warnings.push('Content-Security-Policy header missing');
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let grade;
  if (issues.some(i => i.includes('EXPIRED'))) {
    grade = 'T';
  } else if (score >= 90) {
    grade = 'A+';
  } else if (score >= 80) {
    grade = 'A';
  } else if (score >= 70) {
    grade = 'B';
  } else if (score >= 60) {
    grade = 'C';
  } else if (score >= 50) {
    grade = 'D';
  } else {
    grade = 'F';
  }

  return { grade, score, issues, warnings, positives };
}

async function checkHTTPSRedirect(hostname) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve({ redirects: false, redirectsTo: null }), 5000);
    try {
      const req = http.request({ hostname, port: 80, path: '/', method: 'HEAD', timeout: 4000 }, (res) => {
        clearTimeout(timeout);
        const location = res.headers?.location || null;
        const redirects = res.statusCode >= 300 && res.statusCode < 400 && location && location.startsWith('https');
        resolve({ redirects, redirectsTo: location, statusCode: res.statusCode });
      });
      req.on('error', () => { clearTimeout(timeout); resolve({ redirects: false, redirectsTo: null }); });
      req.on('timeout', () => { clearTimeout(timeout); req.destroy(); resolve({ redirects: false, redirectsTo: null }); });
      req.end();
    } catch {
      clearTimeout(timeout);
      resolve({ redirects: false, redirectsTo: null });
    }
  });
}

async function checkSecurityHeaders(hostname) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 8000);
    try {
      const req = https.request({
        hostname,
        port: 443,
        path: '/',
        method: 'HEAD',
        timeout: 7000,
        rejectUnauthorized: false,
      }, (res) => {
        clearTimeout(timeout);
        const h = res.headers || {};
        resolve({
          hsts: h['strict-transport-security'] || null,
          xContentTypeOptions: h['x-content-type-options'] || null,
          xFrameOptions: h['x-frame-options'] || null,
          xssProtection: h['x-xss-protection'] || null,
          csp: h['content-security-policy'] || null,
          referrerPolicy: h['referrer-policy'] || null,
          permissionsPolicy: h['permissions-policy'] || null,
          server: h['server'] || null,
          via: h['via'] || null,
          all: Object.fromEntries(
            Object.entries(h).filter(([k]) => k.toLowerCase().includes('security') || [
              'strict-transport-security',
              'x-content-type-options',
              'x-frame-options',
              'x-xss-protection',
              'content-security-policy',
              'referrer-policy',
              'permissions-policy',
              'server',
              'via',
            ].includes(k.toLowerCase()))
          )
        });
      });
      req.on('error', () => { clearTimeout(timeout); resolve(null); });
      req.on('timeout', () => { clearTimeout(timeout); req.destroy(); resolve(null); });
      req.end();
    } catch {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

async function performTLSAnalysis(hostname) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('TLS connection timeout (10s)')), 12000);

    const socket = tls.connect({
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 10000,
    }, () => {
      clearTimeout(timeout);
      try {
        const cert = socket.getPeerCertificate(true);
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();
        const ephemeralKey = socket.getEphemeralKeyInfo ? socket.getEphemeralKeyInfo() : null;
        const authorized = socket.authorized;
        const authError = socket.authorizationError || null;

        socket.destroy();

        resolve({
          cert,
          protocol,
          cipher,
          ephemeralKey,
          authorized,
          authError,
        });
      } catch (err) {
        socket.destroy();
        reject(err);
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    socket.on('timeout', () => {
      clearTimeout(timeout);
      socket.destroy();
      reject(new Error('TLS socket timeout'));
    });
  });
}

async function checkTLSVersionSupport(hostname) {
  const versions = ['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'];
  const results = {};

  for (const version of versions) {
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        results[version] = { supported: false, reason: 'timeout' };
        resolve();
      }, 5000);

      const socket = tls.connect({
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: false,
        minVersion: version,
        maxVersion: version,
        timeout: 4000,
      }, () => {
        clearTimeout(timeout);
        results[version] = { supported: true, negotiated: socket.getProtocol() };
        socket.destroy();
        resolve();
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        results[version] = { supported: false, reason: 'rejected' };
        resolve();
      });

      socket.on('timeout', () => {
        clearTimeout(timeout);
        socket.destroy();
        results[version] = { supported: false, reason: 'timeout' };
        resolve();
      });
    });
  }

  return results;
}

// ─── Main Analysis Endpoint ───────────────────────────────────────────────────

app.get('/api/analyze', async (req, res) => {
  const { host } = req.query;

  if (!host) {
    return res.status(400).json({ error: 'Missing host parameter' });
  }

  let hostname = host.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();

  if (!hostname) {
    return res.status(400).json({ error: 'Invalid hostname' });
  }

  try {
    // Run parallel checks
    const [tlsResult, redirectResult, headersResult, tlsVersionsResult] = await Promise.allSettled([
      performTLSAnalysis(hostname),
      checkHTTPSRedirect(hostname),
      checkSecurityHeaders(hostname),
      checkTLSVersionSupport(hostname),
    ]);

    if (tlsResult.status === 'rejected') {
      return res.status(500).json({
        error: 'Failed to connect',
        message: tlsResult.reason?.message || 'Could not establish TLS connection',
        hostname,
      });
    }

    const { cert, protocol, cipher, ephemeralKey, authorized, authError } = tlsResult.value;
    const certData = parseCertificate(cert);
    const headersData = headersResult.status === 'fulfilled' ? headersResult.value : null;
    const redirectData = redirectResult.status === 'fulfilled' ? redirectResult.value : null;
    const tlsVersions = tlsVersionsResult.status === 'fulfilled' ? tlsVersionsResult.value : {};

    // Grade computation
    const { grade, score, issues, warnings, positives } = computeGrade(certData, protocol, cipher?.name, headersData);

    // Build protocol support list
    const protocolSupport = Object.entries(tlsVersions).map(([version, data]) => {
      const protocolInfo = classifyTLSProtocol(version);
      return {
        version,
        displayName: protocolInfo.name,
        supported: data.supported,
        status: protocolInfo.status,
        color: protocolInfo.color,
        secure: protocolInfo.secure,
      };
    });

    const cipherInfo = cipher ? classifyCipherSuite(cipher.name) : null;

    const response = {
      hostname,
      scannedAt: new Date().toISOString(),
      grade,
      score,
      authorized,
      authError,

      certificate: certData,

      connection: {
        protocol: protocol || 'Unknown',
        protocolInfo: classifyTLSProtocol(protocol),
        cipher: cipher ? {
          name: cipher.name,
          version: cipher.version,
          strength: cipherInfo,
        } : null,
        ephemeralKey: ephemeralKey || null,
      },

      protocolSupport,

      securityHeaders: headersData ? {
        hsts: !!headersData.hsts,
        hstsValue: headersData.hsts,
        xContentTypeOptions: !!headersData.xContentTypeOptions,
        xContentTypeOptionsValue: headersData.xContentTypeOptions,
        xFrameOptions: !!headersData.xFrameOptions,
        xFrameOptionsValue: headersData.xFrameOptions,
        xssProtection: !!headersData.xssProtection,
        xssProtectionValue: headersData.xssProtection,
        csp: !!headersData.csp,
        cspValue: headersData.csp,
        referrerPolicy: !!headersData.referrerPolicy,
        referrerPolicyValue: headersData.referrerPolicy,
        permissionsPolicy: !!headersData.permissionsPolicy,
        permissionsPolicyValue: headersData.permissionsPolicy,
        server: headersData.server || null,
        score: computeHeaderScore(headersData),
      } : null,

      httpsRedirect: redirectData || { redirects: null, redirectsTo: null },

      assessment: { issues, warnings, positives },
    };

    return res.json(response);
  } catch (err) {
    return res.status(500).json({
      error: 'Analysis failed',
      message: err.message,
      hostname,
    });
  }
});

function computeHeaderScore(headersData) {
  if (!headersData) return 0;
  let score = 0;
  if (headersData.hsts) score += 30;
  if (headersData.csp) score += 25;
  if (headersData.xContentTypeOptions) score += 15;
  if (headersData.xFrameOptions) score += 15;
  if (headersData.referrerPolicy) score += 10;
  if (headersData.permissionsPolicy) score += 5;
  return score;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`🔐 SSL/TLS Checker API running on http://localhost:${PORT}`);
});
