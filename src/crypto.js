import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Add Buffer polyfill for browser compatibility
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Configure otplib for browser environment
authenticator.options = {
  window: 1, // Time window for validation
  step: 30,  // Time step in seconds
};

// Use browser crypto instead of Node.js crypto
if (typeof window !== 'undefined') {
  // Browser environment - use Web Crypto API
  authenticator.generateSecret = function() {
    const array = new Uint8Array(20);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };
}

export async function deriveKey(password) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey({
    name: 'PBKDF2',
    salt: encoder.encode('fixed-salt'),
    iterations: 100000,
    hash: 'SHA-256'
  }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptVault(data, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return { iv: Array.from(iv), ciphertext: Array.from(new Uint8Array(ciphertext)) };
}

export async function decryptVault({ iv, ciphertext }, key) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

export function generatePassword({ length = 16, symbols = true, numbers = true, uppercase = true, lowercase = true } = {}) {
  const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  const numberChars = '0123456789';
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  let chars = '';
  if (symbols) chars += symbolChars;
  if (numbers) chars += numberChars;
  if (uppercase) chars += upperChars;
  if (lowercase) chars += lowerChars;
  if (!chars) chars = lowerChars; // fallback
  let password = '';
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

export function checkPasswordStrength(password) {
  if (!password) return { score: 0, strength: 'Empty', color: 'error' };
  
  let score = 0;
  const feedback = [];
  
  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Bonus for longer passwords with good variety
  if (password.length >= 12 && score >= 4) score += 1;
  
  // Determine strength level
  let strength, color;
  if (score <= 2) {
    strength = 'Weak';
    color = 'error';
  } else if (score <= 4) {
    strength = 'Fair';
    color = 'warning';
  } else if (score <= 6) {
    strength = 'Good';
    color = 'info';
  } else {
    strength = 'Strong';
    color = 'success';
  }
  
  return { score, strength, color, maxScore: 7 };
}

// Custom TOTP implementation for browser compatibility
function base32Decode(encoded) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = [];
  
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded.charAt(i).toUpperCase();
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    
    value = (value << 5) | index;
    bits += 5;
    
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  
  return new Uint8Array(output);
}

async function hmacSHA1(key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  return new Uint8Array(signature);
}

function generateTOTPCode(secret, time) {
  const key = base32Decode(secret);
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setBigUint64(0, BigInt(Math.floor(time / 30)), false);
  
  return hmacSHA1(key, timeBuffer).then(hash => {
    const offset = hash[hash.length - 1] & 0xf;
    const code = ((hash[offset] & 0x7f) << 24) |
                 ((hash[offset + 1] & 0xff) << 16) |
                 ((hash[offset + 2] & 0xff) << 8) |
                 (hash[offset + 3] & 0xff);
    return code % 1000000;
  });
}

// 2FA Functions
export function generateTOTPSecret() {
  // Generate a base32-encoded secret (32 characters)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const array = new Uint8Array(20);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < 20; i++) {
    secret += chars[array[i] % chars.length];
  }
  return secret;
}

export function generateTOTPQRCode(secret, email = 'user') {
  // Use a simpler, more compatible format
  const otpauth = `otpauth://totp/PasswordManager:${email}?secret=${secret}&issuer=PasswordManager`;
  
  return QRCode.toDataURL(otpauth, {
    errorCorrectionLevel: 'L',
    type: 'image/png',
    quality: 1,
    margin: 2,
    width: 200
  });
}

export async function verifyTOTP(token, secret) {
  try {
    console.log('TOTP Verification details:');
    console.log('- Token:', token);
    console.log('- Secret:', secret);
    console.log('- Current time:', new Date().toISOString());
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expectedCode = await generateTOTPCode(secret, currentTime);
    
    // Check current time window and adjacent windows
    const code1 = await generateTOTPCode(secret, currentTime - 30);
    const code2 = await generateTOTPCode(secret, currentTime);
    const code3 = await generateTOTPCode(secret, currentTime + 30);
    
    const tokenNum = parseInt(token);
    const isValid = tokenNum === code1 || tokenNum === code2 || tokenNum === code3;
    
    console.log('- Expected codes:', [code1, code2, code3]);
    console.log('- Verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

export function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}

export function verifyBackupCode(code, backupCodes) {
  const index = backupCodes.indexOf(code);
  if (index !== -1) {
    backupCodes.splice(index, 1); // Remove used code
    return true;
  }
  return false;
}

export async function generateCurrentTOTP(secret) {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const code = await generateTOTPCode(secret, currentTime);
    return code.toString().padStart(6, '0');
  } catch (error) {
    console.error('Error generating current TOTP:', error);
    return null;
  }
}

// Password breach checking functions
export async function checkPasswordBreach(password) {
  try {
    // Create SHA-1 hash of the password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Use k-anonymity: only send first 5 characters of hash
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);
    
    // Fetch from HaveIBeenPwned API
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error('Failed to fetch breach data');
    }
    
    const text = await response.text();
    const hashes = text.split('\r\n');
    
    // Check if our hash suffix is in the response
    const found = hashes.find(line => line.startsWith(suffix));
    if (found) {
      const count = parseInt(found.split(':')[1]);
      return { breached: true, count };
    }
    
    return { breached: false, count: 0 };
  } catch (error) {
    console.error('Error checking password breach:', error);
    return { breached: false, count: 0, error: error.message };
  }
}

export async function checkMultiplePasswords(passwords) {
  const results = {};
  
  for (const [id, password] of Object.entries(passwords)) {
    if (password) {
      results[id] = await checkPasswordBreach(password);
      // Add small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}