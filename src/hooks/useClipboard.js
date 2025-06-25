import { useState } from 'react';

export const useClipboard = () => {
  const [copyAlert, setCopyAlert] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const copyToClipboard = async (message, text = null) => {
    try {
      // If text is provided separately, use it; otherwise use message as both message and text
      const textToCopy = text !== null ? text : message;
      await navigator.clipboard.writeText(textToCopy);
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