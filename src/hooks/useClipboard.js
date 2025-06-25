import { useState } from 'react';

export const useClipboard = () => {
  const [copyAlert, setCopyAlert] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const copyToClipboard = async (text, message = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(message);
      setCopyAlert(true);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyMessage('Failed to copy to clipboard');
      setCopyAlert(true);
      return false;
    }
  };

  const closeCopyAlert = () => {
    setCopyAlert(false);
  };

  return {
    copyToClipboard,
    copyAlert,
    copyMessage,
    closeCopyAlert
  };
}; 