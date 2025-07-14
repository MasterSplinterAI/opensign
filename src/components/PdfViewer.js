import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { Rnd } from 'react-rnd';
import VerificationBadge from './VerificationBadge';

const PdfViewer = ({ 
  pdfFile, 
  signatures, 
  onSignatureDelete, 
  onSignatureMove,
  onSignatureResize,
  selectedPage,
  onPageSelect,
  onPdfLoad,
  onPageWidthChange
}) => {
  // console.log('PdfViewer rendered with pdfFile:', pdfFile);
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(600);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const updatePageWidth = () => {
      const container = document.querySelector('.pdf-viewer');
      if (container) {
        const containerWidth = container.offsetWidth - 64; // account for padding
        const newPageWidth = Math.min(containerWidth, 800);
        setPageWidth(newPageWidth);
        // Notify parent component of page width change
        if (onPageWidthChange) {
          onPageWidthChange(newPageWidth);
        }
      }
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
    return () => window.removeEventListener('resize', updatePageWidth);
  }, [onPageWidthChange]);

  useEffect(() => {
    if (pdfFile) {
      // Don't set loading here - let Document component handle it
      setError(null);
      setNumPages(null);
      
      // Convert File to URL for react-pdf
      const url = URL.createObjectURL(pdfFile);
      setPdfUrl(url);
      // console.log('Created PDF URL:', url);
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
        console.log('Revoked PDF URL');
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfFile]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    // console.log('PDF Document loaded successfully, pages:', numPages);
    setNumPages(numPages);
    setError(null);
    onPdfLoad({ numPages });
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF in react-pdf:', error);
    setError(`Failed to load PDF document: ${error.message || 'Unknown error'}`);
  };

  // Remove click-anywhere functionality - will use toolbar button instead

  const handleSignatureMove = (signatureId, d) => {
    onSignatureMove(signatureId, { x: d.x, y: d.y });
  };

  const getSignaturesForPage = (pageNumber) => {
    return signatures.filter(sig => sig.pageNumber === pageNumber);
  };

  if (!pdfFile || !pdfUrl) {
    return (
      <div className="pdf-viewer">
        <div className="loading">No PDF file loaded</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        // onLoadStart={() => console.log('Document load started')}
        // onLoadProgress={(progress) => console.log('Document load progress:', progress)}
        // onRenderSuccess={() => console.log('Document render success')}
        loading={<div className="loading">Loading PDF document...</div>}
        error={<div className="error">Error loading PDF document</div>}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <div 
            key={`page_${index + 1}`} 
            className={`pdf-page ${selectedPage === index + 1 ? 'selected' : ''}`}
            onClick={(e) => {
              // Only select page if not clicking on a signature
              if (e.target.closest('.signature-overlay') === null) {
                onPageSelect(index + 1);
              }
            }}
          >
            <div className="page-header">
              <span className="page-number">Page {index + 1}</span>
              {selectedPage === index + 1 && <span className="selected-indicator">✓ Selected</span>}
            </div>
            <Page
              pageNumber={index + 1}
              width={pageWidth}
            />
            
            {/* Render signatures for this page */}
            {getSignaturesForPage(index + 1).map((signature) => (
              <Rnd
                key={signature.id}
                size={{ width: signature.width, height: signature.height }}
                position={{ x: signature.x, y: signature.y }}
                onDragStop={(e, d) => {
                  e.stopPropagation();
                  handleSignatureMove(signature.id, d);
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  e.stopPropagation();
                  const newSize = {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10)
                  };
                  onSignatureResize(signature.id, position, newSize);
                }}
                bounds="parent"
                className="signature-overlay"
                enableResizing={{
                  top: false,
                  right: true,
                  bottom: true,
                  left: false,
                  topRight: true,
                  bottomRight: true,
                  bottomLeft: false,
                  topLeft: false
                }}
                minWidth={50}
                minHeight={20}
                disableDragging={false}
                dragHandleClassName="signature-drag-handle"
                cancel=".signature-delete"
              >
                <div 
                  className="signature-drag-handle"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    position: 'relative',
                    pointerEvents: 'auto'
                  }}
                >
                  <img 
                    src={signature.dataUrl} 
                    alt="Signature"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                    draggable={false}
                  />
                  <button
                    className="signature-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onSignatureDelete(signature.id);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onSignatureDelete(signature.id);
                    }}
                    title="Delete"
                    type="button"
                  >
                    ×
                  </button>
                  
                  {/* Verification Badge */}
                  <VerificationBadge 
                    verification={signature.verification}
                    isVisible={true}
                  />
                </div>
              </Rnd>
            ))}
          </div>
        ))}
      </Document>
      
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
        <p>Select a page using the dropdown or click on any page</p>
        <p>Use "Add to Page X" button to add signatures/text to the selected page</p>
        <p>Drag placed elements to reposition them • Click ✕ to delete</p>
      </div>
    </div>
  );
};

export default PdfViewer; 