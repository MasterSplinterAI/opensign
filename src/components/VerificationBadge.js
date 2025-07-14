import React, { useState } from 'react';
import './VerificationBadge.css';

const VerificationBadge = ({ verification, isVisible = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!verification || !isVisible) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`verification-badge ${isExpanded ? 'expanded' : ''}`}>
      <div className="verification-header" onClick={toggleExpanded}>
        <span className="verification-icon">✓</span>
        <span className="verification-text">
          {verification.verifiedBy} Verified
        </span>
        <span className="verification-toggle">
          {isExpanded ? '−' : '+'}
        </span>
      </div>
      
      {isExpanded && (
        <div className="verification-details">
          <div className="verification-item">
            <span className="label">Date/Time:</span>
            <span className="value">{verification.formatted}</span>
          </div>
          <div className="verification-item">
            <span className="label">Timezone:</span>
            <span className="value">{verification.timezone}</span>
          </div>
          <div className="verification-item">
            <span className="label">Hash:</span>
            <span className="value hash">{verification.hash}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationBadge; 