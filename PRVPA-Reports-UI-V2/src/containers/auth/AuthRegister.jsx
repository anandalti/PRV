'use strict';

import PropTypes from 'prop-types';
import { useState } from 'react';
import axios from 'axios';
import {
    Box, Typography, TextField, Button, Alert,
    CircularProgress, InputAdornment, IconButton,
    Divider, LinearProgress,
} from '@mui/material';
import Visibility           from '@mui/icons-material/Visibility';
import VisibilityOff        from '@mui/icons-material/VisibilityOff';
import ValveAnimation        from '../../components/ValveAnimation';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

// ─── Constants ───────────────────────────────────────────────────────────────

const API_BASE       = process.env.VITE_API_URL;
const REGISTER_URL   = `${API_BASE}/auth/register`;
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_DOMAIN = '@emerson.com';

// Password rules must mirror the server-side checks in AuthController.js
const PASSWORD_RULES = [
    { test: (p) => p.length >= 10,           msg: 'At least 10 characters'             },
    { test: (p) => /[A-Z]/.test(p),          msg: 'At least 1 uppercase letter'        },
    { test: (p) => /[a-z]/.test(p),          msg: 'At least 1 lowercase letter'        },
    { test: (p) => /\d/.test(p),             msg: 'At least 1 digit'                   },
    { test: (p) => /[^A-Za-z0-9]/.test(p),  msg: 'At least 1 special character'       },
];

// ─── Component ───────────────────────────────────────────────────────────────

const AuthRegister = ({ navigate }) => {
    const onNavigate = (to) => {
        if (navigate) {
            navigate(to);
        } else {
            window.location.href = to;
        }
    };

    // Form state
    const [form, setForm] = useState({ Name: '', Email: '', Password: '' });
    // Collected error messages returned from client-side validation or the API
    const [errors, setErrors]         = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading]       = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // Track which password rules have already been checked (show hints once user
    // starts typing in the password field)
    const [passwordDirty, setPasswordDirty] = useState(false);

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Clear errors as soon as the user starts correcting the form
        if (errors.length)  setErrors([]);
        if (successMsg)     setSuccessMsg('');
        if (name === 'Password') setPasswordDirty(true);
    };

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    // Client-side validation — returns an array of error strings
    const validate = () => {
        const errs = [];

        if (!form.Name || !form.Name.trim()) {
            errs.push('Full name is required');
        }

        if (!form.Email || !EMAIL_REGEX.test(form.Email.trim())) {
            errs.push('A valid email address is required');
        } else if (!form.Email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN)) {
            errs.push(`Only ${ALLOWED_DOMAIN} email addresses are allowed`);
        }

        if (!form.Password) {
            errs.push('Password is required');
        } else {
            PASSWORD_RULES.forEach(({ test, msg }) => {
                if (!test(form.Password)) errs.push(`Password must contain: ${msg}`);
            });
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
            // Use plain axios (not the custom interceptor) because the interceptor
            // only resolves on HTTP 200; register returns HTTP 201.
            // withCredentials allows the server to set httpOnly cookies if applicable.
            await axios.post(
                REGISTER_URL,
                {
                    Name:     form.Name.trim(),
                    Email:    form.Email.trim().toLowerCase(),
                    Password: form.Password,
                },
                { withCredentials: true }
            );

            setSuccessMsg('Account created successfully! Redirecting to login…');
            setTimeout(() => onNavigate('/'), 2000);
        } catch (err) {
            // Normalise API error shapes:
            // { status:'error', messages: string[] }  — validation / conflict errors
            // { status:'error', message: string }     — single error
            const data = err.response?.data;
            if (data?.messages?.length) {
                setErrors(data.messages);
            } else if (data?.message) {
                setErrors([data.message]);
            } else {
                setErrors(['Registration failed. Please try again.']);
            }
        } finally {
            setLoading(false);
        }
    };

    const hasError   = errors.length > 0;
    const hasSuccess = Boolean(successMsg);

    // Password strength derived from how many rules pass
    const passwordChecks   = PASSWORD_RULES.map(({ test, msg }) => ({ passed: test(form.Password), msg }));
    const passedCount      = passwordChecks.filter(c => c.passed).length;
    const strengthPercent  = (passedCount / PASSWORD_RULES.length) * 100;
    const strengthColor    = passedCount <= 1 ? '#d31245' : passedCount <= 3 ? '#f59e0b' : '#00aa7e';
    const strengthLabel    = passedCount === 0 ? '' : passedCount <= 1 ? 'Weak' : passedCount <= 3 ? 'Fair' : passedCount <= 4 ? 'Good' : 'Strong';
    const showPasswordHints = passwordDirty && form.Password.length > 0;

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
                <Box sx={{ position: 'absolute', top: -90, left: -90, width: 320, height: 320, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
                <Box sx={{ position: 'absolute', bottom: -110, right: -70, width: 420, height: 420, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
                <Box sx={{ position: 'absolute', top: '35%', right: -40, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

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
                        Create your account to access industry-leading valve sizing
                        tools and engineering workflows.
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
                    maxWidth: 440,
                    bgcolor: '#fff',
                    borderRadius: 3,
                    p: { xs: 3, sm: 4.5 },
                    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.75 }}>
                        Create account
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5 }}>
                        Fill in the details below to get started
                    </Typography>

                    <form onSubmit={handleSubmit} noValidate>

                        {/* ── Full Name ─────────────────────────────────── */}
                        <TextField
                            fullWidth
                            label="Full name"
                            type="text"
                            name="Name"
                            autoComplete="name"
                            value={form.Name}
                            onChange={handleChange}
                            error={hasError}
                            size="small"
                            sx={{ mb: 2.5 }}
                            slotProps={{ input: { sx: { borderRadius: 2 } } }}
                        />

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
                            slotProps={{ input: { sx: { borderRadius: 2 } } }}
                        />

                        {/* ── Password ──────────────────────────────────── */}
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            name="Password"
                            autoComplete="new-password"
                            value={form.Password}
                            onChange={handleChange}
                            error={hasError}
                            size="small"
                            sx={{ mb: showPasswordHints ? 1 : 2.5 }}
                            slotProps={{
                                input: {
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
                                },
                            }}
                        />

                        {/* ── Password strength meter ───────────────────── */}
                        {showPasswordHints && (
                            <Box sx={{ mb: 2 }}>
                                {/* Strength bar */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={strengthPercent}
                                        sx={{
                                            flex: 1, height: 6, borderRadius: 3,
                                            bgcolor: '#e8edf2',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: strengthColor,
                                                borderRadius: 3,
                                                transition: 'width 0.4s ease, background-color 0.4s ease',
                                            },
                                        }}
                                    />
                                    {strengthLabel && (
                                        <Typography variant="caption" sx={{ color: strengthColor, fontWeight: 600, minWidth: 40 }}>
                                            {strengthLabel}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Rule checklist */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {passwordChecks.map(({ passed, msg }, i) => (
                                        <Box key={i} sx={{
                                            display: 'flex', alignItems: 'center', gap: 0.4,
                                            width: '48%', minWidth: 160,
                                        }}>
                                            {passed
                                                ? <CheckCircleOutlineIcon sx={{ fontSize: 13, color: '#00aa7e' }} />
                                                : <RadioButtonUncheckedIcon sx={{ fontSize: 13, color: '#9e9e9e' }} />
                                            }
                                            <Typography variant="caption" sx={{ color: passed ? '#00aa7e' : '#9e9e9e', fontSize: '0.72rem' }}>
                                                {msg}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

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

                        {/* ── Success banner ────────────────────────────── */}
                        {hasSuccess && (
                            <Alert
                                severity="success"
                                sx={{ mb: 2.5, borderRadius: 2, border: '1px solid #00aa7e', '& .MuiAlert-icon': { color: '#00aa7e' } }}
                            >
                                {successMsg}
                            </Alert>
                        )}

                        {/* ── Submit ────────────────────────────────────── */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading || hasSuccess}
                            sx={{
                                height: 44, borderRadius: 2, fontWeight: 600,
                                fontSize: '0.95rem', textTransform: 'none',
                                bgcolor: '#00aa7e', boxShadow: 'none', mb: 2.5,
                                '&:hover': { bgcolor: '#00896a', boxShadow: '0 4px 12px rgba(0,170,126,0.35)' },
                                '&.Mui-disabled': { bgcolor: '#b2dfdb', color: '#fff' },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                        </Button>

                        {/* ── Login link ────────────────────────────────── */}
                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            Already have an account?{' '}
                            <a
                                href="/"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate('/');
                                }}
                                style={{ color: '#00aa7e', fontWeight: 600, textDecoration: 'none' }}
                            >
                                Sign in
                            </a>
                        </Typography>
                    </form>
                </Box>

                <Typography variant="caption" sx={{ mt: 4, color: 'text.disabled', textAlign: 'center' }}>
                    © {new Date().getFullYear()} PRVPA Online. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

AuthRegister.propTypes = {
    navigate: PropTypes.func,
};

export default AuthRegister;
