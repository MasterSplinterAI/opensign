// Utility functions for signature verification

// Generate a random hash for verification (in a real app, this would be a cryptographic hash)
export const generateVerificationHash = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}`.substring(0, 16);
};

// Get current timestamp with timezone
export const getCurrentTimestamp = () => {
  const now = new Date();
  const timestamp = now.toISOString();
  // Get short timezone (e.g., EDT, PST)
  const formatted = now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
  // Extract short timezone (last word)
  const shortTz = formatted.split(' ').pop();
  return {
    timestamp,
    timezone: shortTz,
    formatted,
  };
};

// Generate complete verification data
export const generateVerificationData = () => {
  const timestampData = getCurrentTimestamp();
  const hash = generateVerificationHash();
  
  return {
    hash,
    timestamp: timestampData.timestamp,
    timezone: timestampData.timezone,
    formatted: timestampData.formatted,
    verifiedBy: 'JarPDF'
  };
}; 