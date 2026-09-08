import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import Home from './containers/Home';
import { login, setUnAuthorized, validateSession } from './store/slices/authSlice';
import './styles/index.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthorized, isLoading, error } = useSelector(state => state.auth);

  useEffect(() => {
    // 1. Prioritise a one-time launch token in the URL query string.
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Exchange the OTP for HttpOnly accessToken / refreshToken cookies.
      console.log('Token found in URL, dispatching login...');
      dispatch(login({ token }));
      // Clean the token from the URL so it cannot be bookmarked or shared.
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // 2. No URL token — ask the server whether the HttpOnly accessToken
      //    cookie is still valid.  document.cookie cannot read httpOnly cookies,
      //    so a server-side validate call is the only correct approach.
      console.log('No URL token. Validating existing session via server...');
      dispatch(validateSession()).unwrap()
        .catch(() => {
          // Cookie absent or expired — user must re-enter via a valid link.
          console.log('Session validation failed. Setting unauthorized.');
          dispatch(setUnAuthorized());
        });
    }
  }, [dispatch]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <p>Validating access...</p>
      </div>
    );
  }

  // Unauthorized access UI
  if (error || !isAuthorized) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        background: '#f8fafc'
      }}>
        <h1 style={{ color: '#e11d48', fontSize: '24px', marginBottom: '10px' }}>Unauthorized access</h1>
        <p style={{ color: '#64748b' }}>Please use a valid link to access the PRV Import Tool.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>PRV Import Tool</title>
      </Helmet>
      
      <Home />
    </>
  );
}


export default App