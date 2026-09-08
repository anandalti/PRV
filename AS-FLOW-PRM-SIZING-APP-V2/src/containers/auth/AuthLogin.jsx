'use strict';

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    Box, Typography, TextField, Button, Alert,
    CircularProgress, InputAdornment, IconButton, Divider,
} from '@mui/material';
import Visibility        from '@mui/icons-material/Visibility';
import VisibilityOff     from '@mui/icons-material/VisibilityOff';
import ValveAnimation   from '../../components/ValveAnimation';
import { login } from '../../store/slices/authSlice';

// ─── Constants ───────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_DOMAIN = '@emerson.com';

// ─── Component ───────────────────────────────────────────────────────────────

const AuthLogin = (baseRoute) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Form state
    const [form, setForm] = useState({ Email: '', Password: '' });
    // Collected error messages returned from client-side validation or the API
    const [errors, setErrors]       = useState([]);
    const [loading, setLoading]     = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Clear errors as soon as the user starts correcting the form
        if (errors.length) setErrors([]);
    };

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    // Client-side validation before hitting the API
    const validate = () => {
        const errs = [];
        const emailTrimmed = form.Email.trim().toLowerCase();
        if (!form.Email || !EMAIL_REGEX.test(emailTrimmed)) {
            errs.push('A valid email address is required');
        } else if (!emailTrimmed.endsWith(ALLOWED_DOMAIN)) {
            errs.push(`Only ${ALLOWED_DOMAIN} email addresses are allowed`);
        }
        if (!form.Password) {
            errs.push('Password is required');
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (validationErrors.length) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            // Dispatch the Redux login thunk with email and password
            // This automatically routes to GraphQL or REST based on VITE_API_GATEWAY_ENABLED
            const result = await dispatch(login({
                email: form.Email.trim().toLowerCase(),
                password: form.Password,
                AppType:baseRoute?.callingProject
            })).unwrap();

            // console.log('✅ Login successful:', result);

            // On success redirect to the main application
            // console.log('✅ Login  >>>>>>>>>. ', baseRoute?.callingProject);
            if(baseRoute?.callingProject==="CA"){
                // console.log('✅ Login successful for CA:', result);
                navigate('/check-availability/search');
            }else{
                navigate('/Sizing');
            }
            
        } catch (err) {
            console.error('❌ Login error:', err);
            
            // Normalise API error shapes:
            // { status:'error', messages: string[] }  — validation errors
            // { status:'error', message: string }     — single error
            const data = err.response?.data || err.data || err;
            if (data?.messages?.length) {
                setErrors(data.messages);
            } else if (data?.message) {
                setErrors([data.message]);
            } else if (typeof data === 'string') {
                setErrors([data]);
            } else {
                setErrors(['Login failed. Please try again.']);
            }
        } finally {
            setLoading(false);
        }
    };

    const hasError = errors.length > 0;

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

            {/* ── Left brand panel ──────────────────────────────────────── */}
            <Box sx={{
                flex: '0 0 44%',
                background: 'linear-gradient(150deg, #00aa7e 0%, #00795a 55%, #004d38 100%)',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 7,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative blurred circles */}
                <Box sx={{ position: 'absolute', top: -90, left: -90, width: 320, height: 320, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
                <Box sx={{ position: 'absolute', bottom: -110, right: -70, width: 420, height: 420, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
                <Box sx={{ position: 'absolute', top: '40%', right: -40, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 360 }}>
                    {/* Animated valve illustration */}
                    <ValveAnimation />

                    <Typography variant="overline" sx={{
                        display: 'block', color: 'rgba(255,255,255,0.90)',
                        fontWeight: 700, letterSpacing: 4, mt: 1, mb: 3,
                        fontSize: '0.72rem',
                    }}>
                        PRVPA · Valve Sizing Platform
                    </Typography>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.22)', mb: 3 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.85 }}>
                        Industry-leading relief valve sizing and engineering tools for
                        safety-critical process applications.
                    </Typography>
                </Box>
            </Box>

            {/* ── Right form panel ──────────────────────────────────────── */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: '#f0f4f8',
                p: { xs: 3, sm: 5 },
            }}>
                <Box sx={{
                    width: '100%',
                    maxWidth: 420,
                    bgcolor: '#fff',
                    borderRadius: 3,
                    p: { xs: 3, sm: 4.5 },
                    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.75 }}>
                        Welcome back
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5 }}>
                        Sign in to continue to your workspace
                    </Typography>

                    <form onSubmit={handleSubmit} noValidate>

                        {/* ── Email ─────────────────────────────────────── */}
                        <TextField
                            fullWidth
                            label="Email address"
                            type="email"
                            name="Email"
                            autoComplete="email"
                            value={form.Email}
                            onChange={handleChange}
                            error={hasError}
                            size="small"
                            sx={{ mb: 2.5 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />

                        {/* ── Password ──────────────────────────────────── */}
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            name="Password"
                            autoComplete="current-password"
                            value={form.Password}
                            onChange={handleChange}
                            error={hasError}
                            size="small"
                            sx={{ mb: 2.5 }}
                            InputProps={{
                                sx: { borderRadius: 2 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={togglePasswordVisibility}
                                            edge="end"
                                            size="small"
                                            tabIndex={-1}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* ── Error banner ──────────────────────────────── */}
                        {hasError && (
                            <Alert
                                severity="error"
                                sx={{ mb: 2.5, borderRadius: 2, border: '1px solid #d31245', '& .MuiAlert-icon': { color: '#d31245' } }}
                            >
                                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                    {errors.map((msg, i) => <li key={i}>{msg}</li>)}
                                </ul>
                            </Alert>
                        )}

                        {/* ── Submit ────────────────────────────────────── */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                height: 44, borderRadius: 2, fontWeight: 600,
                                fontSize: '0.95rem', textTransform: 'none',
                                bgcolor: '#00aa7e', boxShadow: 'none', mb: 2.5,
                                '&:hover': { bgcolor: '#00896a', boxShadow: '0 4px 12px rgba(0,170,126,0.35)' },
                                '&.Mui-disabled': { bgcolor: '#b2dfdb', color: '#fff' },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
                        </Button>

                        {/* ── Register link ─────────────────────────────── */}
                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            Don&apos;t have an account?{' '}
                            <Link to="/register" style={{ color: '#00aa7e', fontWeight: 600, textDecoration: 'none' }}>
                                Create one
                            </Link>
                        </Typography>
                    </form>
                </Box>

                {/* Footer note */}
                <Typography variant="caption" sx={{ mt: 4, color: 'text.disabled', textAlign: 'center' }}>
                    © {new Date().getFullYear()} PRVPA Online. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default AuthLogin;
