// Utility to check if we're running in Electron environment
export const isElectron = () => {
  return (
    typeof window !== 'undefined' &&
    window.electronAPI &&
    typeof window.electronAPI === 'object'
  );
};

// Safe process access for renderer
export const getProcessInfo = () => {
  if (typeof process !== 'undefined' && process.versions) {
    return {
      electron: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome
    };
  }
  return {
    electron: 'Unknown',
    node: 'Unknown',
    chrome: 'Unknown'
  };
};

// Check if we're in development mode
export const isDevelopment = () => {
  return (
    !isElectron() ||
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'development')
  );
};