# Password Manager - Modular Architecture

A secure, feature-rich password manager built with Electron, React, and Material-UI, now organized in a clean, modular architecture.

## Project Structure

```
password-manager/
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite build configuration
├── index.html                # HTML entry point (Vite standard location)
├── electron/                 # Electron main process files
│   ├── main.js              # Electron main process
│   └── preload.js           # Secure bridge between Electron and browser context
├── public/                   # Static assets (images, icons, etc.)
├── src/                      # Source code
│   ├── assets/              # Images, icons, etc.
│   ├── components/          # Reusable UI components
│   │   ├── PasswordField.jsx
│   │   ├── PasswordStrengthIndicator.jsx
│   │   ├── VaultList.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── PasswordGenerator.jsx
│   │   ├── AddPasswordDialog.jsx
│   │   ├── ImportExportDialogs.jsx
│   │   ├── AutoLockSettings.jsx
│   │   ├── SecurityStatus.jsx
│   │   ├── TwoFactorSetupDialog.jsx
│   │   ├── TwoFactorVerificationDialog.jsx
│   │   ├── BiometricSetupDialog.jsx
│   │   └── AutoLockWarningDialog.jsx
│   ├── containers/          # Screens/pages like Vault, Settings, Login
│   │   ├── LoginScreen.jsx
│   │   └── VaultScreen.jsx
│   ├── context/             # React context for state management
│   │   ├── AuthContext.jsx  # Authentication, 2FA, biometrics, auto-lock
│   │   └── VaultContext.jsx # Vault data, categories, breach checking
│   ├── hooks/               # Custom React hooks
│   │   ├── useClipboard.js  # Clipboard operations with feedback
│   │   ├── usePasswordGenerator.js # Password generation logic
│   │   └── useAutoLock.js   # Auto-lock functionality and activity detection
│   ├── services/            # Core business logic
│   │   └── crypto.js        # Encryption, TOTP, password strength, breach checking
│   ├── utils/               # Helper functions
│   │   └── importExport.js  # Import/export utilities for various formats
│   ├── App.jsx              # Main app component with providers
│   ├── main.jsx             # React entry point
│   └── theme.js             # Material-UI theme configuration
└── dist/                    # Compiled output (generated)
```

## Architecture Benefits

### 🏗️ **Modular Design**
- Clear separation of concerns
- Reusable components and hooks
- Easy to maintain and extend
- Better code organization

### 🔧 **Context-Based State Management**
- `AuthContext`: Manages authentication, 2FA, biometrics, and auto-lock
- `VaultContext`: Handles vault data, categories, and security features
- Centralized state with proper React patterns

### 🎣 **Custom Hooks**
- `useClipboard`: Clipboard operations with user feedback
- `usePasswordGenerator`: Password generation with strength checking
- `useAutoLock`: Activity detection and auto-lock functionality

### 🧩 **Component Structure**
- **Components**: Small, reusable UI pieces
- **Containers**: Full pages/screens that compose components
- **Services**: Core business logic and external integrations
- **Utils**: Helper functions and utilities

## Key Features

- **🔐 Secure Encryption**: AES-GCM with PBKDF2 key derivation
- **📱 Two-Factor Authentication**: TOTP support with QR codes and backup codes
- **👆 Biometric Authentication**: Touch ID/Face ID support (macOS)
- **⏰ Auto-lock**: Configurable timeout with activity detection
- **🔍 Password Breach Checking**: Integration with HaveIBeenPwned API
- **📊 Password Strength Analysis**: Real-time strength indicators
- **🏷️ Categories and Tags**: Organize passwords with custom categories
- **📥📤 Import/Export**: Support for 1Password, LastPass, Keeper, and CSV formats
- **🔧 Password Generator**: Customizable password generation

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start Electron app
npm run electron
```

## File Responsibilities

### Context Providers
- **AuthContext**: User authentication, master password, 2FA, biometrics, auto-lock
- **VaultContext**: Password entries, categories, search/filter, breach status

### Key Components
- **LoginScreen**: Master password entry, 2FA verification, biometric setup
- **VaultScreen**: Main password management interface
- **PasswordField**: Reusable password input with visibility toggle and strength indicator
- **VaultList**: Password entry display with editing capabilities

### Services
- **crypto.js**: All cryptographic operations, TOTP, password utilities
- **importExport.js**: Data import/export in various formats

This modular architecture makes the password manager much more maintainable, testable, and extensible while preserving all the original functionality. 