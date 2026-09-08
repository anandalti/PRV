import { MemoryRouter as Router, BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import './App.css';
import Auth0ProviderComponent from './providers/Auth0ProviderComponent';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import useAutoTokenRefresh from './hooks/useAutoTokenRefresh';

function App() {
  const { platform } = useSelector(state => state.auth);
  
  // ✅ Monitor token expiry and auto-refresh before it expires
  useAutoTokenRefresh();
  
  return (
    <>
      <Helmet>
        <title>PRV Sizing & Selection</title>
      </Helmet>
      {
        process.env?.VITE_AUTH0_FLAG && platform === 'sizingcore' ?
          <Auth0ProviderComponent>
            <Router>
              <AppRoutes />
            </Router>
          </Auth0ProviderComponent>
          :
          <Router>
            <AppRoutes />
          </Router>
      }
    </>
  )
}

export default App
