import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocationCity
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { authService } from '../../services/auth.service';
import { setCredentials } from '../../redux/slices/authSlice';

import cityLogo from '../../assets/photo_2026-04-23_23-37-01.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    if (!email) {
      setError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
const response = await authService.login({ email, password });

if (response.success) {
  dispatch(
    setCredentials({
      user: response.data.admin,
      token: response.data.token, 
    })
  );

  toast.success(response.message);
  navigate("/dashboard");
} else {
        setError(response.message || 'Invalid email or password.');
        toast.error(response.message || 'Login failed.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'An error occurred during login. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        py: 4,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(15,23,42,.06)',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              gap: 1.5
            }}
          >
            <Box
              component="img"
              src={cityLogo}
              alt="CityConnect Logo"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '10px',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            />
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                color: '#1E293B',
                letterSpacing: '-0.5px'
              }}
            >
              CityConnect Admin
            </Typography>
          </Box>

          <Box sx={{ width: '100%', mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                color: '#1E293B',
                mb: 1
              }}
            >
              Welcome back
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                color: '#64748B'
              }}
            >
              Enter your credentials to access the administration panel.
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                mb: 3,
                borderRadius: '8px',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ width: '100%' }}
          >
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
              disabled={loading}
              slotProps={{
                inputLabel: {
                  style: { fontFamily: 'Poppins, sans-serif' }
                },
                htmlInput: {
                  style: { fontFamily: 'Poppins, sans-serif' }
                }
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: 'Poppins, sans-serif'
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              slotProps={{
                inputLabel: {
                  style: { fontFamily: 'Poppins, sans-serif' }
                },
                htmlInput: {
                  style: { fontFamily: 'Poppins, sans-serif' }
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: 'Poppins, sans-serif'
                }
              }}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    disabled={loading}
                    sx={{
                      color: '#E5E7EB',
                      '&.Mui-checked': {
                        color: '#2563EB'
                      }
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      color: '#64748B',
                      userSelect: 'none'
                    }}
                  >
                    Remember Me
                  </Typography>
                }
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                textTransform: 'none',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1D4ED8',
                  boxShadow: 'none'
                },
                '&.Mui-disabled': {
                  backgroundColor: '#E5E7EB',
                  color: '#64748B'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#64748B' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
