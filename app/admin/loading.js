import { Box, Skeleton } from '@mui/material';

export default function AdminLoading() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" width={200} height={100} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    </Box>
  );
}
