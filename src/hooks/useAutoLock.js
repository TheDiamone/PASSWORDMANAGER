import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAutoLock = () => {
  const {
    unlocked,
    autoLockTimeout,
    lastActivity,
    setLastActivity,
    setShowAutoLockWarning,
    autoLockTimer,
    setAutoLockTimer,
    warningTimer,
    setWarningTimer,
    handleAutoLock
  } = useAuth();

  // Auto-lock timer management
  useEffect(() => {
    if (!unlocked) {
      // Clear timers when locked
      if (autoLockTimer) {
        clearTimeout(autoLockTimer);
        setAutoLockTimer(null);
      }
      if (warningTimer) {
        clearTimeout(warningTimer);
        setWarningTimer(null);
      }
      setShowAutoLockWarning(false);
      return;
    }

    // Don't set timers if auto-lock is disabled
    if (autoLockTimeout === 0) {
      return;
    }

    // Set up auto-lock timer
    const warningTime = (autoLockTimeout - 1) * 60 * 1000; // 1 minute before lock
    const lockTime = autoLockTimeout * 60 * 1000;

    const warningTimerId = setTimeout(() => {
      setShowAutoLockWarning(true);
    }, warningTime);

    const lockTimerId = setTimeout(() => {
      handleAutoLock();
    }, lockTime);

    setWarningTimer(warningTimerId);
    setAutoLockTimer(lockTimerId);

    return () => {
      clearTimeout(warningTimerId);
      clearTimeout(lockTimerId);
    };
  }, [unlocked, lastActivity, autoLockTimeout]);

  // Activity detection
  useEffect(() => {
    if (!unlocked) return;

    const handleActivity = () => {
      setLastActivity(Date.now());
      setShowAutoLockWarning(false);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [unlocked]);
}; 