import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignatureModal = ({ onSave, onClose }) => {
  const sigCanvas = useRef(null);
  const textCanvasRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [activeTab, setActiveTab] = useState('draw'); // 'draw', 'type', 'text'
  const [typedSignature, setTypedSignature] = useState('');
  const [selectedFont, setSelectedFont] = useState('signature');
  const [textValue, setTextValue] = useState('');
  const [fontSize, setFontSize] = useState(24);

  const fonts = [
    { name: 'signature', label: 'Signature Style', style: 'Dancing Script, cursive' },
    { name: 'elegant', label: 'Elegant', style: 'Great Vibes, cursive' },
    { name: 'professional', label: 'Professional', style: 'Times New Roman, serif' },
    { name: 'modern', label: 'Modern', style: 'Arial, sans-serif' },
    { name: 'handwritten', label: 'Handwritten', style: 'Kalam, cursive' }
  ];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleClear = () => {
    if (activeTab === 'draw') {
      sigCanvas.current.clear();
      setIsEmpty(true);
    } else if (activeTab === 'type') {
      setTypedSignature('');
    } else if (activeTab === 'text') {
      setTextValue('');
    }
  };

  const generateTextSignature = (text, font, size = 24) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Get font family from fonts array
    const fontFamily = fonts.find(f => f.name === font)?.style || 'Arial, sans-serif';
    
    // Set font and measure text
    ctx.font = `${size}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    
    // Set canvas size with generous padding
    const padding = Math.max(20, size * 0.5);
    canvas.width = Math.max(metrics.width + padding * 2, 200);
    canvas.height = Math.max(size + padding * 2, 60);
    
    // Clear and set font again (canvas resize clears context)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${size}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add subtle shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = 'black';
    
    // Draw text in the center
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    let dataURL;
    
    if (activeTab === 'draw') {
      if (sigCanvas.current.isEmpty()) {
        alert('Please draw your signature first');
        return;
      }
      dataURL = sigCanvas.current.toDataURL('image/png');
    } else if (activeTab === 'type') {
      if (!typedSignature.trim()) {
        alert('Please enter your signature text');
        return;
      }
      dataURL = generateTextSignature(typedSignature, selectedFont, 36);
    } else if (activeTab === 'text') {
      if (!textValue.trim()) {
        alert('Please enter some text');
        return;
      }
      dataURL = generateTextSignature(textValue, 'professional', fontSize);
    }
    
    onSave(dataURL);
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="signature-modal" onClick={onClose}>
      <div className="signature-modal-content" onClick={handleModalClick}>
        <h3>Add Signature or Text</h3>
        
        {/* Tab Navigation */}
        <div className="signature-tabs">
          <button 
            className={`tab-btn ${activeTab === 'draw' ? 'active' : ''}`}
            onClick={() => setActiveTab('draw')}
          >
            ✍️ Draw
          </button>
          <button 
            className={`tab-btn ${activeTab === 'type' ? 'active' : ''}`}
            onClick={() => setActiveTab('type')}
          >
            ✏️ Type Signature
          </button>
          <button 
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            📝 Add Text
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'draw' && (
            <div>
              <p>Draw your signature below:</p>
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: window.innerWidth <= 768 ? 300 : 400,
                  height: window.innerWidth <= 768 ? 120 : 200,
                  className: 'signature-canvas'
                }}
                onBegin={handleBegin}
              />
            </div>
          )}

          {activeTab === 'type' && (
            <div>
              <p>Type your signature:</p>
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Enter your name"
                className="signature-input"
              />
              
              <div className="font-selector">
                <label>Choose Style:</label>
                {fonts.map(font => (
                  <div key={font.name} className="font-option">
                    <input
                      type="radio"
                      id={font.name}
                      name="font"
                      value={font.name}
                      checked={selectedFont === font.name}
                      onChange={(e) => setSelectedFont(e.target.value)}
                    />
                    <label 
                      htmlFor={font.name}
                      style={{ fontFamily: font.style, fontSize: '18px' }}
                    >
                      {typedSignature || font.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div>
              <p>Add text to document:</p>
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Enter text"
                className="signature-input"
              />
              
              <div className="text-options">
                <label>
                  Font Size:
                  <input
                    type="range"
                    min="16"
                    max="60"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                  <span>{fontSize}px</span>
                </label>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Preview is limited to 24px for display, but actual size will be {fontSize}px
                </small>
              </div>
              
              <div className="text-preview" style={{ 
                fontFamily: 'Arial, sans-serif', 
                fontSize: `${Math.min(fontSize, 24)}px`,
                border: '1px solid #ccc',
                padding: '10px',
                margin: '10px 0',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {textValue || 'Text preview'}
              </div>
            </div>
          )}
        </div>

        <div className="signature-modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleClear}
          >
            Clear
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
          >
            Add to Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal; 