'use client';

import { useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error('Admin Error:', error);
  }, [error]);

  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom color="error">
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {error?.message || 'An unexpected error occurred in the admin panel.'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={reset}
          >
            Try Again
          </Button>
          <Link href="/admin/dashboard" passHref>
            <Button variant="outlined" startIcon={<ArrowBack />}>
              Back to Dashboard
            </Button>
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
