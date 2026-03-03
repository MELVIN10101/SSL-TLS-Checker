#!/bin/bash

# SSL/TLS Checker - Quick Start Guide
# This script helps you get started with the SSL/TLS Checker application

echo "🔒 SSL/TLS Checker - Quick Start Guide"
echo "====================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to project directory
cd /home/redwing/ssd/Projects/ssl-tls-checker

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Starting development server..."
echo "The application will be available at: http://localhost:5173/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
