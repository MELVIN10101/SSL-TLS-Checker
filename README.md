# SSL/TLS Checker

A powerful, modern web application for analyzing SSL/TLS certificate configurations using the SSL Labs API. Built with React, Tailwind CSS, and Vite.

## Features

- **Domain Analysis**: Scan any domain's SSL/TLS configuration
- **Security Grade Badge**: Large, centered grade display with color-coded security levels
- **Certificate Details**: View subject, issuer, expiry date, and days remaining
- **TLS Version Support**: See which TLS versions are supported with security indicators
  - TLS 1.3: Green (Secure)
  - TLS 1.2: Yellow (OK)
  - TLS 1.0/1.1: Red (Insecure)
- **Cipher Suites**: Display top 8 cipher suites with strength indicators
- **Security Issues**: Show key warnings and vulnerabilities
- **Real-time Polling**: Monitor analysis progress with animated scanning effects
- **Elapsed Time Counter**: Track scan duration
- **Example Domains**: Quick-click examples (google.com, github.com, expired.badssl.com)
- **Fully Responsive**: Works seamlessly on mobile and desktop

## Grading Colors

- **A+ / A**: Green (#00ff9f) - Excellent security
- **B**: Yellow - Good security
- **C**: Orange - Acceptable security
- **D / F**: Red - Poor security
- **T (Untrusted)**: Red - Security issue
- **Error**: Gray - Analysis failed

## Technology Stack

- **React 18** - UI framework with hooks
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful SVG icon library
- **SSL Labs API** - Industry-standard SSL/TLS analysis

## Project Structure

```
src/
├── App.jsx          # Main application component (single file)
├── main.jsx         # React entry point
└── index.css        # Tailwind styles and animations
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open `http://localhost:5173/` in your browser

### Build for Production

```bash
npm run build
```

The optimized app will be in the `dist/` directory.

## How It Works

1. **Enter Domain**: Type in a domain name (with or without https://)
2. **Start Scan**: Click the "Scan" button
3. **Monitor Progress**: Watch real-time status updates as the SSL Labs API analyzes the domain
4. **View Results**: Once analysis is complete, see detailed security information
5. **Scan Again**: Click "Scan Another Domain" to start a new analysis

## API Integration

The app uses the [SSL Labs API](https://github.com/ssllabs/ssllabs-scan/blob/master/README.md):

- Endpoint: `https://api.ssllabs.com/api/v3/analyze`
- Polling: Every 10 seconds until `status === "READY"`
- Proxy: Uses `/api/ssl` proxy configured in vite.config.js

## Design Features

- **Dark Cybersecurity Theme**: Background #0a0a0f, cards #111118
- **Cyan/Green Accent**: Primary color #00ff9f
- **Monospace Typography**: Data values in monospace font
- **Grid Background**: Subtle scanline pattern for cyber aesthetic
- **Animated Scanning**: Loading states with animated scan line effect
- **Card-Based Layout**: Organized sections for different data types

## Features Detailed

### Domain Input
- Automatically strips `https://` prefix and trailing slashes
- Example chips for quick testing (google.com, github.com, expired.badssl.com)
- Input disabled during scanning

### Progress Indicator
- Real-time status messages ("DNS lookup...", "Analyzing TLS handshake...", etc.)
- Animated spinner with pulse effect
- Elapsed time counter

### Results Display
- **Security Grade**: Large, centered badge with icon
- **Certificate Info**: Subject, issuer, expiry date, days remaining, wildcard status
- **TLS Versions Table**: Shows supported versions with security color coding
- **Cipher Suites**: Top 8 suites with strength indicators
- **Key Issues**: Warnings and vulnerabilities from API

### Error Handling
- Domain validation and normalization
- User-friendly error messages
- API failure handling with timeout detection (60 attempts = 10 minutes max)
- Graceful degradation for missing data fields

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Fast initial load with Vite
- Efficient polling with 10-second intervals
- Optimized re-renders with React hooks
- Minimal bundle size with tree-shaking
- CSS-optimized Tailwind output

## Future Enhancements

- Historical scan results storage
- Export results as PDF
- Batch domain scanning
- Dark/Light theme toggle
- Advanced filtering options
- Scan notifications and alerts

## License

MIT

## Support

For issues or questions, please refer to the [SSL Labs documentation](https://github.com/ssllabs/ssllabs-scan).
