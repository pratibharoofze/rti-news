import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ToastContext = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ message, type });
    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, 2600);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View style={[styles.overlay, toast.type === 'success' ? styles.overlayBottom : styles.overlayTop]}>
          <View style={[styles.toast, styles[toast.type] || styles.info]}>
            <Text style={styles.title}>
              {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Notice'}
            </Text>
            <Text style={styles.message}>{toast.message}</Text>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayTop: {
    top: 18,
  },
  overlayBottom: {
    bottom: 110,
  },
  toast: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    boxShadow: '0px 10px 16px rgba(2, 6, 23, 0.16)',
    elevation: 8,
  },
  info: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  success: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  message: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
});


