"use client"; // Add this directive at the top
import React from 'react';

import { useRouter } from 'next/router'; // Import useRouter
import supabase from './supabase/supabaseClient';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography, {TypographyProps} from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';


function Copyright(props: TypographyProps) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        AssignMate
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function AuthPage() {
  
  const HandleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const router = useRouter(); // Initialize the router
    event.preventDefault(); // Prevent form from submitting normally

    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error.message);
        // Handle the error, e.g., show a message to the user
        
        return;
      }

      const { user, session } = signInData;

      console.log('User signed in:', user);
      console.log('Session:', session);

      // Handle successful sign-in
      router.push('/auth/sign-up/')

    } catch (err) {
      console.error('Unexpected error:', err);
      // Handle unexpected errors
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
            {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar> */}
            <Typography
              component="h1"
              variant="h2"
              sx={{
                fontFamily: 'Rounded Mplus 1c, sans-serif', // Set the font family
                textAlign: 'left', // Align text to the left
                color: 'purple',
                width: '100%'
              }}
            >
              AssignMate
            </Typography>
            <Typography
              component="h1"
              variant="subtitle1"
              sx={{
                fontFamily: 'Rounded Mplus 1c, sans-serif', // Set the font family
                textAlign: 'left', // Align text to the left
                color: 'grey',
                width: '100%'
              }}
            >
              A collaborative task management application for university students in group assessments backed and developed by university students
            </Typography>

            <Typography
              component="h1"
              variant="subtitle2"
              sx={{
                fontFamily: 'Rounded Mplus 1c, sans-serif', // Set the font family
                textAlign: 'left', // Align text to the left
                color: 'grey',
                width: '100%'
              }}
            >
              If you’re an existing user, welcome back.
              If you’re new here, please sign up!
            </Typography>
            
            <Box component="form" noValidate onSubmit={HandleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
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
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/auth/sign-up/" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <script src="https://accounts.google.com/gsi/client" async></script>

              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              'url("/static/images/templates/templates-images/sign-in-side-bg.png")',

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