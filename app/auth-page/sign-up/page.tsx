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
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  getCurrentUserId,
  createUser,
  checkUserNameAvailable,
} from '../../supabase/backendFunctions';

const defaultTheme = createTheme();

export default function AuthPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'username') {
      if (value.length > 2) {
        const isAvailable = await checkUserNameAvailable(value);
        setUsernameAvailable(isAvailable);
      } else {
        setUsernameAvailable(null);
      }
    }
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!usernameAvailable) {
      setError('Username is not available');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        console.log('User signed up:', data.user);
        
        const userId = await getCurrentUserId();
        if (!userId) {
          setError("No user is currently logged in");
          return;
        }

        // Insert user data into the 'user' table
        const { error: insertError } = await createUser(
          userId, 
          formData.firstName,
          formData.lastName,
          formData.username
        );

        if (insertError) {
          console.error('Error inserting user data:', insertError);
          setError('User account created, but there was an error saving additional details. Please contact support.');
          return;
        }

        // If everything is successful, redirect to dashboard
        router.push('../dashboard-page/');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
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
                width: '100%'
              }}
            >
              Sign Up
            </Typography>

            {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                error={usernameAvailable === false}
                helperText={
                  usernameAvailable === false 
                    ? "Username is not available" 
                    : usernameAvailable === true 
                      ? "Username is available" 
                      : ""
                }
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!usernameAvailable}
              >
                Sign Up
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