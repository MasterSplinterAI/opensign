import React, { useState, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PdfViewer from './components/PdfViewer';
import SignatureModal from './components/SignatureModal';
import FileUpload from './components/FileUpload';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import './App.css';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [currentSignPosition, setCurrentSignPosition] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPage, setSelectedPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    // console.log('File upload started:', file);
    if (file && file.type === 'application/pdf') {
      try {
        // console.log('Loading PDF...');
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPdfDoc(pdfDoc);
        setPdfFile(file);
        setSignatures([]);
        setNumPages(pdfDoc.getPageCount());
        setSelectedPage(1);
        // console.log('PDF loaded successfully');
      } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF file. Please try again.');
      }
    } else {
      console.log('Invalid file type:', file?.type);
      alert('Please upload a valid PDF file.');
    }
  };

  const handleAddElement = () => {
    // Place new elements at a default position in the center of the selected page
    const isMobile = window.innerWidth <= 768;
    const defaultPosition = {
      x: isMobile ? 50 : 200, // Smaller offset for mobile
      y: isMobile ? 100 : 150,
      pageNumber: selectedPage
    };
    setCurrentSignPosition(defaultPosition);
    setIsSignatureModalOpen(true);
  };

  const handlePageSelect = (pageNumber) => {
    setSelectedPage(pageNumber);
  };

  const handlePdfLoad = (pdfInfo) => {
    setNumPages(pdfInfo.numPages);
  };

  const handleSignatureSave = (signatureDataUrl) => {
    if (currentSignPosition) {
      // Create a temporary image to get actual dimensions
      const img = new Image();
      img.onload = () => {
        // Calculate appropriate size based on screen size
        const isMobile = window.innerWidth <= 768;
        const maxWidth = isMobile ? 200 : 300;
        const maxHeight = isMobile ? 100 : 150;
        
        let width = img.width;
        let height = img.height;
        
        // Scale down if too large
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = width * scale;
          height = height * scale;
        }
        
        // Ensure minimum size
        width = Math.max(width, 80);
        height = Math.max(height, 40);
        
        const newSignature = {
          id: Date.now(),
          dataUrl: signatureDataUrl,
          x: currentSignPosition.x,
          y: currentSignPosition.y,
          pageNumber: currentSignPosition.pageNumber,
          width: width,
          height: height
        };
        setSignatures([...signatures, newSignature]);
        setIsSignatureModalOpen(false);
        setCurrentSignPosition(null);
      };
      img.src = signatureDataUrl;
    }
  };

  const handleSignatureDelete = (signatureId) => {
    setSignatures(signatures.filter(sig => sig.id !== signatureId));
  };

  const handleSignatureMove = (signatureId, newPosition) => {
    setSignatures(signatures.map(sig => 
      sig.id === signatureId 
        ? { ...sig, x: newPosition.x, y: newPosition.y }
        : sig
    ));
  };

  const handleSignatureResize = (signatureId, newPosition, newSize) => {
    setSignatures(signatures.map(sig => 
      sig.id === signatureId 
        ? { 
            ...sig, 
            x: newPosition.x, 
            y: newPosition.y,
            width: newSize.width,
            height: newSize.height
          }
        : sig
    ));
  };

  const handleDownload = async () => {
    if (!pdfDoc || signatures.length === 0) {
      alert('Please add at least one signature before downloading.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDocCopy = await PDFDocument.load(await pdfDoc.save());
      
      for (const signature of signatures) {
        const page = pdfDocCopy.getPages()[signature.pageNumber - 1];
        if (page) {
          // Convert data URL to image
          const imageBytes = await fetch(signature.dataUrl).then(res => res.arrayBuffer());
          const image = await pdfDocCopy.embedPng(imageBytes);
          
          // Get actual page dimensions
          const { width: pageWidth, height: pageHeight } = page.getSize();
          
          // Get the displayed page dimensions from the DOM
          const displayedPage = document.querySelector('.pdf-page canvas');
          if (displayedPage) {
            const displayedWidth = displayedPage.offsetWidth;
            const displayedHeight = displayedPage.offsetHeight;
            
            // Calculate scaling factors
            const scaleX = pageWidth / displayedWidth;
            const scaleY = pageHeight / displayedHeight;
            
            // Scale the signature position and size
            const scaledX = signature.x * scaleX;
            const scaledY = signature.y * scaleY;
            const scaledWidth = signature.width * scaleX;
            const scaledHeight = signature.height * scaleY;
            
            // Calculate signature position (PDF coordinates start from bottom-left)
            const pdfY = pageHeight - scaledY - scaledHeight;
            
            page.drawImage(image, {
              x: scaledX,
              y: pdfY,
              width: scaledWidth,
              height: scaledHeight,
            });
          } else {
            // Fallback to original method if DOM element not found
            const pdfY = pageHeight - signature.y - signature.height;
            page.drawImage(image, {
              x: signature.x,
              y: pdfY,
              width: signature.width,
              height: signature.height,
            });
          }
        }
      }

      const signedPdfBytes = await pdfDocCopy.save();
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
      const fileName = pdfFile.name.replace('.pdf', '_signed.pdf');
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error signing PDF:', error);
      alert('Error signing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setSignatures([]);
    setIsSignatureModalOpen(false);
    setCurrentSignPosition(null);
    setSelectedPage(1);
    setNumPages(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <header className="App-header">
          <h1>Simple PDF Signer</h1>
          <p>Drop your PDF, add signatures, and download - no login required!</p>
        </header>

        <main className="App-main">
          {!pdfFile ? (
            <FileUpload onFileUpload={handleFileUpload} />
          ) : (
            <div className="pdf-editor">
              <div className="editor-toolbar">
                <button onClick={handleReset} className="btn btn-secondary">
                  Upload New PDF
                </button>
                
                <div className="page-selector">
                  <span>Page:</span>
                  <select 
                    value={selectedPage} 
                    onChange={(e) => handlePageSelect(Number(e.target.value))}
                    className="page-select"
                  >
                    {numPages && Array.from({ length: numPages }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button onClick={handleAddElement} className="btn btn-primary">
                  ➕ Add to Page {selectedPage}
                </button>
                
                <button 
                  onClick={handleDownload} 
                  className="btn btn-primary"
                  disabled={signatures.length === 0 || isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Download Signed PDF (${signatures.length} elements)`}
                </button>
              </div>

              <PdfViewer
                pdfFile={pdfFile}
                signatures={signatures}
                onSignatureDelete={handleSignatureDelete}
                onSignatureMove={handleSignatureMove}
                onSignatureResize={handleSignatureResize}
                selectedPage={selectedPage}
                onPageSelect={handlePageSelect}
                onPdfLoad={handlePdfLoad}
              />

              {/* Floating Action Button */}
              <div className="floating-action-button">
                <button 
                  onClick={handleAddElement} 
                  className="btn btn-primary fab-btn"
                  title={`Add to Page ${selectedPage}`}
                >
                  ➕
                </button>
                <div className="fab-label">Add to Page {selectedPage}</div>
              </div>
            </div>
          )}

        </main>

        {isSignatureModalOpen && (
          <SignatureModal
            onSave={handleSignatureSave}
            onClose={() => setIsSignatureModalOpen(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App; 