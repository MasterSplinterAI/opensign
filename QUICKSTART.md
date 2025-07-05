# Quick Start Guide

## Option 1: Full Setup (Recommended)

1. **Install Node.js** from https://nodejs.org/
2. **Run the setup script:**
   ```bash
   ./setup.sh
   ```
3. **Start the app:**
   ```bash
   npm start
   ```

## Option 2: Quick Test (if you have Node.js installed)

```bash
# Install dependencies
npm install

# Start the app
npm start
```

The app will open at `http://localhost:3000`

## What You'll See

1. **Upload Screen**: Drag and drop a PDF or click to select one
2. **PDF Viewer**: Your PDF will display with click-to-sign functionality
3. **Signature Modal**: Click anywhere on the PDF to draw your signature
4. **Download**: Once signed, download your completed document

## Features

- ✅ **No login required** - start signing immediately
- ✅ **Local processing** - your files never leave your computer
- ✅ **Drag & drop** - easy file upload
- ✅ **Click to sign** - place signatures anywhere
- ✅ **Repositionable** - drag signatures to move them
- ✅ **Instant download** - get your signed PDF right away

## Browser Support

Works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

**Node.js not found?**
- Install from https://nodejs.org/
- Or use the setup script: `./setup.sh`

**PDF won't load?**
- Make sure it's a valid PDF file
- Try a different PDF

**Can't draw signature?**
- Make sure you're drawing inside the signature box
- Try clearing and redrawing

**Download doesn't work?**
- Add at least one signature first
- Check browser download settings 