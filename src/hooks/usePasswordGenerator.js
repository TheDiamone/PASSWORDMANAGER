import { useState } from 'react';
import { generatePassword, checkPasswordStrength } from '../services/crypto';

export const usePasswordGenerator = (defaultOptions = {}) => {
  const [genOptions, setGenOptions] = useState({
    length: 16,
    symbols: true,
    numbers: true,
    uppercase: true,
    lowercase: true,
    ...defaultOptions
  });
  const [generated, setGenerated] = useState('');

  const handleGenerate = () => {
    const newPassword = generatePassword(genOptions);
    setGenerated(newPassword);
    return newPassword;
  };

  const updateOptions = (newOptions) => {
    setGenOptions(prev => ({ ...prev, ...newOptions }));
  };

  const getStrength = (password = generated) => {
    return checkPasswordStrength(password);
  };

  return {
    genOptions,
    setGenOptions: updateOptions,
    generated,
    setGenerated,
    handleGenerate,
    getStrength
  };
}; 