#!/bin/bash

echo "🚀 Simple PDF Signer Setup Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed on your system"
    echo ""
    echo "Please install Node.js first:"
    echo ""
    
    # Check OS and provide appropriate installation instructions
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "On macOS:"
        echo "1. Install Homebrew if you don't have it:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo "2. Install Node.js:"
        echo "   brew install node"
        echo ""
        echo "Or download from: https://nodejs.org/"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "On Linux:"
        echo "Ubuntu/Debian: sudo apt update && sudo apt install nodejs npm"
        echo "CentOS/RHEL: sudo yum install nodejs npm"
        echo ""
        echo "Or download from: https://nodejs.org/"
    else
        echo "Please download Node.js from: https://nodejs.org/"
    fi
    
    echo ""
    echo "After installing Node.js, run this script again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js found: $NODE_VERSION"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    echo "Please reinstall Node.js from https://nodejs.org/"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm found: $NPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "To start the application:"
    echo "  npm start"
    echo ""
    echo "The application will open in your browser at http://localhost:3000"
else
    echo "❌ Failed to install dependencies"
    echo "Please check the error messages above and try again"
    exit 1
fi 