# Simple PDF Signer

A simplified PDF signing application built from the OpenSign project. This version removes all the complexity of user management, server-side storage, and multi-signature workflows to provide a clean, simple interface for signing PDFs locally.

## Features

- **No Login Required**: Jump straight into signing documents
- **Local Processing**: All PDF processing happens in your browser - no data is sent to servers
- **Drag & Drop**: Easy file upload with drag and drop support
- **Click to Sign**: Click anywhere on the PDF to place your signature
- **Signature Drawing**: Draw your signature with mouse or touch
- **Moveable Signatures**: Drag signatures to reposition them after placing
- **Instant Download**: Download your signed PDF immediately

## What's Different from OpenSign?

This simplified version removes:
- User authentication and login system
- Server-side file storage
- Multi-signature workflows
- Complex user management
- Database requirements
- Email notifications
- Template systems

## Prerequisites

You'll need Node.js installed on your system to run this application.

### Install Node.js

**On macOS:**
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

**On Windows:**
- Download from https://nodejs.org/

**On Linux:**
```bash
# Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm

# Using yum (CentOS/RHEL)
sudo yum install nodejs npm
```

## Installation

1. Clone this repository or download the files
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. The application will automatically open in your default browser

## Usage

1. **Upload PDF**: Drag and drop a PDF file or click to select one
2. **Place Signatures**: Click anywhere on the PDF where you want to add a signature
3. **Draw Signature**: Use the signature modal to draw your signature
4. **Move Signatures**: Drag signatures to reposition them
5. **Download**: Click "Download Signed PDF" to save your signed document

## Building for Production

To create a production build:

```bash
npm run build
```

This will create a `build` folder with optimized files that you can serve with any web server.

## Browser Compatibility

This application works in all modern browsers that support:
- HTML5 Canvas
- File API
- PDF.js

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Privacy & Security

- **No Server Communication**: All processing happens locally in your browser
- **No Data Storage**: Files are not saved or transmitted anywhere
- **No Analytics**: No tracking or analytics are included
- **Client-Side Only**: The application runs entirely in your browser

## Troubleshooting

**PDF Won't Load:**
- Ensure the file is a valid PDF
- Try a different PDF file
- Check browser console for errors

**Signature Won't Save:**
- Make sure you've drawn something in the signature box
- Try clearing and redrawing the signature

**Download Doesn't Work:**
- Ensure you have at least one signature placed
- Check if your browser is blocking downloads
- Try right-clicking the download button and selecting "Save As"

## Technical Details

Built with:
- React 18
- PDF-lib for PDF manipulation
- React-PDF for PDF rendering
- React-Signature-Canvas for signature capture
- HTML5 Canvas for drawing
- File API for local file handling

## License

This simplified version maintains the same license as the original OpenSign project.

## Contributing

This is a simplified version for specific use cases. For the full-featured OpenSign project, visit: https://github.com/opensignlabs/opensign 