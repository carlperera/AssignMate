"use client";

import { useRouter } from 'next/navigation';
import supabase from '../../supabase/supabaseClient';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const defaultTheme = createTheme();

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    if (!email) {
      setMessage({ type: 'error', content: 'Please enter your email address.' });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage({ type: 'error', content: error.message });
      } else {
        setMessage({ type: 'success', content: 'Password reset email sent. Please check your inbox.' });
        setEmail('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage({ type: 'error', content: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <IconButton
              onClick={() => router.push('/')}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <ArrowBackIcon />
            </IconButton>

          
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontFamily: 'Rounded Mplus 1c, sans-serif',
                textAlign: 'left',
                color: 'purple',
                width: '100%',
                mb: 4,
              }}
            >
              Forgot Password
            </Typography>

            {message.content && (
              <Alert severity={message.type as 'error' | 'success'} sx={{ width: '100%', mb: 2 }}>
                {message.content}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, height: 56 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Send Reset Email'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => router.push('/')}
                sx={{ mt: 1 }}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url("/static/images/templates/templates-images/sign-in-side-bg.png")',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'left',
          }}
        />
      </Grid>
    </ThemeProvider>
  );
}