import supabase from '../supabase/supabaseClient';
import React from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

export default function AuthPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiInputBase-root': {
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  inset: 0,
                  background: '#f0f0f0',
                  zIndex: -1,
                  transition: 'background 0.3s ease',
                  borderRadius: '4px',
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiInputBase-root': {
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  inset: 0,
                  background: '#f0f0f0',
                  zIndex: -1,
                  transition: 'background 0.3s ease',
                  borderRadius: '4px',
                },
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

