import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { ToastProvider } from './components/ui/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <AppNavigator />
    </ToastProvider>
  );
}
