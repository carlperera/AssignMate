"use client"; // acccess from server to host 
import { useRouter } from 'next/navigation' // app router 
import supabase from '../../supabase/supabaseClient';
import React, {useEffect} from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function AuthPage() {

  const router = useRouter(); 
  const HandleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form from submitting normally

    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string;
    console.log(`${window.location.origin}`)

    try {

      const { data: signInData, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`, 
      })
      

      if (error) {
        console.error('Error signing in:', error.message);
        // Handle the error, e.g., show a message to the user
        return;
      }
      // Handle successful sign-in, e.g., redirect the user or store the session
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
              variant="h3"
              sx={{
                fontFamily: 'Rounded Mplus 1c, sans-serif', // Set the font family
                textAlign: 'left', // Align text to the left
                color: 'purple',
                width: '100%'
              }}
            >
              Forgot Password
            </Typography>
            

            <Box component="form" noValidate onSubmit={HandleSubmit} sx={{ mt: 1 }}>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="test@gmail.com"
                autoFocus
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Send Reset Email
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