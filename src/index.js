import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker - specific fix for version 4.8.69
console.log('PDF.js version:', pdfjs.version);

// Try multiple worker URLs in order of preference
const workerUrls = [
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`,
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`,
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
];

let workerSet = false;
for (const url of workerUrls) {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = url;
    console.log('Trying PDF.js worker URL:', url);
    workerSet = true;
    break;
  } catch (error) {
    console.warn('Failed worker URL:', url, error);
  }
}

if (!workerSet) {
  console.error('All PDF.js worker URLs failed');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); 