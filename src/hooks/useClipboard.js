import { useState } from 'react';

export const useClipboard = () => {
  const [copyAlert, setCopyAlert] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const copyToClipboard = async (message, text = null) => {
    try {
      // If text is provided separately, use it; otherwise use message as both message and text
      const textToCopy = text !== null ? text : message;
      
      // Check if clipboard API is available and document is focused
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }
      
      // Try to focus the document first
      if (document.hasFocus && !document.hasFocus()) {
        window.focus();
        // Small delay to allow focus to take effect
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await navigator.clipboard.writeText(textToCopy);
      setCopyMessage(message);
      setCopyAlert(true);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Fallback: try using the older execCommand method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text !== null ? text : message;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopyMessage(message);
          setCopyAlert(true);
          return true;
        }
      } catch (fallbackError) {
        console.error('Fallback copy method also failed:', fallbackError);
      }
      
      // If all methods fail, show a user-friendly message
      setCopyMessage('Copy failed - please try again');
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