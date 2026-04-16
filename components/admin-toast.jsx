'use client';

import { Toaster, toast } from 'react-hot-toast';

const AdminToast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: 'var(--surface-container-high)',
          color: 'var(--on-surface)',
          border: '1px solid var(--outline-variant)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 500,
          fontFamily: 'Inter, system-ui, sans-serif',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        },
        // Success toast
        success: {
          iconTheme: {
            primary: 'var(--success)',
            secondary: 'white',
          },
          style: {
            background: 'var(--surface-container-high)',
            color: 'var(--on-surface)',
            borderLeft: '4px solid var(--success)',
          },
        },
        // Error toast
        error: {
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'white',
          },
          style: {
            background: 'var(--surface-container-high)',
            color: 'var(--on-surface)',
            borderLeft: '4px solid var(--error)',
          },
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: 'var(--primary)',
            secondary: 'white',
          },
          style: {
            background: 'var(--surface-container-high)',
            color: 'var(--on-surface)',
            borderLeft: '4px solid var(--primary)',
          },
        },
      }}
    />
  );
};

export { AdminToast, toast };
