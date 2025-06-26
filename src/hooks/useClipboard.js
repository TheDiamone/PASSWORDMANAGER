import { useState } from 'react';

export const useClipboard = () => {
  const [copyAlert, setCopyAlert] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const copyToClipboard = async (message, text = null) => {
    try {
      // If text is provided separately, use it; otherwise use message as both message and text
      const textToCopy = text !== null ? text : message;
      
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }
      
      // Enhanced focus handling - try multiple approaches
      const ensureFocus = async () => {
        // First, try to focus the window
        if (window.focus) {
          window.focus();
        }
        
        // Try to focus the document
        if (document.hasFocus && !document.hasFocus()) {
          // Create a temporary focusable element and focus it
          const tempInput = document.createElement('input');
          tempInput.style.position = 'fixed';
          tempInput.style.opacity = '0';
          tempInput.style.pointerEvents = 'none';
          tempInput.style.left = '-9999px';
          document.body.appendChild(tempInput);
          tempInput.focus();
          document.body.removeChild(tempInput);
          
          // Wait a bit for focus to take effect
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      };
      
      await ensureFocus();
      await navigator.clipboard.writeText(textToCopy);
      setCopyMessage(message);
      setCopyAlert(true);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Enhanced fallback: try using the older execCommand method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text !== null ? text : message;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '1px';
        textArea.style.height = '1px';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        
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
      
      // If all methods fail, show a user-friendly message but don't fail silently
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