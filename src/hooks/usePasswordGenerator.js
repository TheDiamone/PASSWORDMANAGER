import { useState } from 'react';
import { generatePassword as cryptoGeneratePassword } from '../services/crypto';

export const usePasswordGenerator = () => {
  const [genOptions, setGenOptions] = useState({
    length: 16,
    symbols: true,
    numbers: true,
    uppercase: true,
    lowercase: true,
  });

  const generatePassword = (options = genOptions) => {
    return cryptoGeneratePassword(options);
  };

  const updateOption = (key, value) => {
    setGenOptions(prev => ({ ...prev, [key]: value }));
  };

  const resetOptions = () => {
    setGenOptions({
      length: 16,
      symbols: true,
      numbers: true,
      uppercase: true,
      lowercase: true,
    });
  };

  return {
    genOptions,
    setGenOptions,
    generatePassword,
    updateOption,
    resetOptions,
  };
}; 