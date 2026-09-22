import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import Layout from "./components/Layout";
import AuthLogin from './containers/auth/AuthLogin';
import AuthRegister from './containers/auth/AuthRegister';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { layoutActions } from './store/layoutSlice';
import { checkLogin } from './store/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const [path, setPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to) => {
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== to) {
      window.history.pushState({}, '', to);
      setPath(window.location.pathname || '/');
    }
  };

  // useEffect(() => {
  //   dispatch(checkLogin());
  // }, [dispatch]);

  useEffect(() => {
    const urlParams = new URLSearchParams(document.location.search);
    const sizingId = urlParams.get("UniqueId");
    const configId = urlParams.get("ConfigId") === "" ? null : urlParams.get("ConfigId");
    dispatch(layoutActions.saveUrlParams({ sizingId, configId }));
  }, [dispatch]);

  useEffect(() => {
    const currentSearch = window.location.search || '';

    if (!isLoggedIn && !['/', '/login', '/register'].includes(path)) {
      navigate(`/${currentSearch}`);
    }
    if (isLoggedIn && ['/', '/login'].includes(path)) {
      navigate(`/${currentSearch}`);
    }
  }, [isLoggedIn, path]);

  const renderPage = () => {
    if (!isLoggedIn) {
      if (path === '/register') {
        return <AuthRegister navigate={navigate} />;
      }
      return <AuthLogin navigate={navigate} />;
    }
    return <Layout />;
  };

  return <>
    {renderPage()}
    <ToastContainer />
  </>;
}

export default App;
