# SSL/TLS Checker - API Integration Guide

## SSL Labs API Integration

### Overview
The SSL/TLS Checker uses the **SSL Labs API** to analyze SSL/TLS security configurations. The API is industry-standard and widely used for security assessments.

### API Endpoint
```
https://api.ssllabs.com/api/v3/analyze
```

### Proxy Configuration
To bypass CORS restrictions during development, Vite is configured with a proxy:

**Local Path:** `/api/ssl`
**Target:** `https://api.ssllabs.com`
**Rewrite:** `/api/v3/analyze`

**Vite Configuration** (vite.config.js):
```javascript
server: {
  proxy: {
    '/api/ssl': {
      target: 'https://api.ssllabs.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/ssl/, '/api/v3/analyze'),
      secure: false,
    }
  }
}
```

### Request Flow

1. **Frontend Request**
   ```javascript
   fetch('/api/ssl?host=example.com&all=done')
   ```

2. **Proxy Rewrite**
   ```
   /api/ssl?host=example.com&all=done
   →
   https://api.ssllabs.com/api/v3/analyze?host=example.com&all=done
   ```

3. **API Response**
   ```json
   {
     "host": "example.com",
     "port": 443,
     "protocol": "https",
     "grade": "A",
     "status": "READY",
     "endpoints": [...]
   }
   ```

## API Parameters

### Required Parameters
- `host` (string): Domain to analyze (e.g., "example.com")
- `all` (string): Set to "done" to get full results when ready

### Query String Example
```
/api/ssl?host=example.com&all=done
```

### URL Encoding
Domain names are URL-encoded using `encodeURIComponent()`:
```javascript
const encodedDomain = encodeURIComponent('example.com');
const url = `/api/ssl?host=${encodedDomain}&all=done`;
```

## Polling Strategy

### Implementation
The app uses continuous polling to check analysis status:

```javascript
const poll = async () => {
  // Make request
  const response = await fetch(`/api/ssl?host=${domain}&all=done`);
  const data = await response.json();
  
  // Check status
  if (data.status === 'READY') {
    return data; // Analysis complete
  }
  
  if (data.status === 'ERROR') {
    throw new Error(data.statusDetails);
  }
  
  // Continue polling
  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
  return poll();
};
```

### Polling Parameters
- **Interval:** 10 seconds
- **Max Attempts:** 60 (10 minutes total)
- **Timeout Error:** "Analysis timeout - taking too long"

### Status Values
| Status | Meaning | Action |
|--------|---------|--------|
| DNS | DNS lookup in progress | Continue polling |
| IN_PROGRESS | Analysis in progress | Continue polling |
| READY | Analysis complete | Display results |
| ERROR | Analysis failed | Show error message |

## API Response Structure

### Top-Level Properties
```javascript
{
  host: "example.com",
  port: 443,
  protocol: "https",
  isExceptional: false,
  grade: "A+",
  status: "READY",
  statusDetails: "Ready",
  endpoints: [...],
  cert: {...},
  certs: [...],
  certificateChain: {...},
  certificateChainScore: 100,
  hasWarnings: false,
  isExceptionalSub: false,
  noSslv2: true,
  ssllabs: {...}
}
```

### Endpoints Array
Each endpoint contains:
```javascript
{
  ipAddress: "93.184.216.34",
  port: 443,
  serverName: "example.com",
  grade: "A+",
  details: {
    protocols: [...],
    suites: [...],
    certChain: {...},
    issues: [...],
    ...
  }
}
```

### Certificate Information
From `endpoints[0].details.certChain.certs[0]`:
```javascript
{
  subject: "CN=example.com",
  issuer: "CN=Let's Encrypt Authority X3",
  issuerLabel: "Let's Encrypt",
  notBefore: 1234567890,
  notAfter: 1234567890,
  altNames: ["example.com", "www.example.com"],
  keyAlg: "RSA",
  keySize: 2048,
  ...
}
```

### TLS Protocols
From `endpoints[0].details.protocols`:
```javascript
[
  {
    name: "TLS 1.3",
    version: "0x0303"
  },
  {
    name: "TLS 1.2",
    version: "0x0303"
  },
  ...
]
```

### Cipher Suites
From `endpoints[0].details.suites[0].suites`:
```javascript
[
  {
    name: "TLS_AES_256_GCM_SHA384",
    id: 0x1302,
    strength: 256,
    cipherStrength: 256,
    ...
  },
  ...
]
```

### Issues/Warnings
From `endpoints[0].details.issues`:
```javascript
[
  "Weak certificate signature",
  "RC4 cipher suites",
  "Expiration date in the future",
  ...
]
```

## Rate Limiting

### Limits
- **Public API:** Limited requests per domain
- **Free API:** Delays between analyses
- **Behavior:** Reuses cached results when available

### Best Practices
1. Cache results locally
2. Respect the 10-second polling interval
3. Don't make multiple concurrent requests
4. Display the cache age to users

## Error Handling

### Common Errors
```javascript
// API request failed
if (!response.ok) {
  throw new Error('API request failed');
}

// Domain not found
if (data.statusDetails.includes('Unable to resolve')) {
  throw new Error('Domain not found');
}

// Analysis timeout
if (attempt >= maxAttempts) {
  throw new Error('Analysis timeout - taking too long');
}
```

### User-Friendly Messages
- "Domain not found - please check the domain name"
- "Analysis failed - please try again later"
- "Connection error - please check your internet"
- "Domain blocked - server not responding"

## Data Processing

### Domain Normalization
```javascript
const stripDomain = (input) => {
  return input
    .replace(/^https?:\/\//i, '')    // Remove protocol
    .replace(/\/$/, '')               // Remove trailing slash
    .trim();                          // Remove whitespace
};
```

### Date Conversion
```javascript
// From timestamp to readable date
const expiryDate = new Date(cert.notAfter).toLocaleDateString();

// Calculate days remaining
const daysRemaining = Math.ceil(
  (new Date(cert.notAfter) - new Date()) / (1000 * 60 * 60 * 24)
);
```

### Wildcard Detection
```javascript
const isWildcard = cert.altNames?.some(name => name.startsWith('*'));
```

## API Documentation Links

- [SSL Labs API Docs](https://github.com/ssllabs/ssllabs-scan/blob/master/README.md)
- [User Agreement](https://www.ssllabs.com/terms.html)
- [Rate Limiting Info](https://github.com/ssllabs/ssllabs-scan#rate-limiting)

## Example Requests

### Simple Domain Analysis
```
GET /api/ssl?host=google.com&all=done
```

### With Full Details
```
GET /api/ssl?host=example.com&all=done
```

### URL-Encoded Domain
```
GET /api/ssl?host=sub%2Edomain%2Ecom&all=done
```

## Response Times

| Scenario | Time |
|----------|------|
| Cached result | 10-30s |
| First analysis | 30-60s |
| Complex chain | 60-120s |
| Slow server | 120-180s |

## Integration in React

### Full Implementation
```javascript
const pollSSLStatus = useCallback(async (cleanDomain) => {
  const statusMessages = [
    'DNS lookup in progress...',
    'Analyzing TLS handshake...',
    'Performing cryptographic assessment...',
    'Grading security configuration...',
    'Finalizing report...'
  ];

  let attempt = 0;
  const maxAttempts = 60;

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

      attempt++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      return poll();
    } catch (err) {
      throw err;
    }
  };

  return poll();
}, []);
```

## Troubleshooting

### Proxy Not Working
- Check `vite.config.js` configuration
- Verify dev server is running
- Check browser console for CORS errors

### Analysis Taking Too Long
- Domain might be slow to respond
- Might be on rate limit
- Check SSL Labs website status

### Missing Data Fields
- Some domains don't provide all data
- Graceful degradation handles this
- Shows "N/A" for missing fields

### SSL Labs API Down
- Check [SSL Labs status](https://www.ssllabs.com/)
- Wait and retry later
- Show error message to user

---

*Last Updated: March 3, 2026*
