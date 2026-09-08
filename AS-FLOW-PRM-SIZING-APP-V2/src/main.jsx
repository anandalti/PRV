import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { injectStore } from './utils/interceptor.js';
import { logoutUser } from './store/slices/authSlice.js';
import { injectStoreToGraphqlClient } from './utils/graphqlClient.js';
import { store as importToolStore } from './importTool/store/store.js';
import { store as checkAvailabilityStore } from './checkAvailability/store/store.js';
import ImportToolApp from './importTool/App.jsx';
import CheckAvailabilityWrapper from './checkAvailability/CheckAvailabilityWrapper.jsx';

// Break interceptor circular dependency — inject store after it is fully initialized
injectStore(store, logoutUser);
// Inject Redux store into Apollo Client so authLink reads the JWT accessToken from Redux
injectStoreToGraphqlClient(store);
 
if (process.env.VITE_IMPORT_TOOL_ACTIVE === 'true' && window.location.pathname.startsWith('/import-tool')) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={importToolStore}>
        <ImportToolApp />
      </Provider>
    </React.StrictMode>
    ,
  );
} else if (process.env.VITE_CHECK_AVAILABILITY_ACTIVE === "true" && window.location.pathname.startsWith('/check-availability')) {
  ReactDOM.createRoot(document.getElementById('root')).render(
      <Provider store={checkAvailabilityStore}>
        <CheckAvailabilityWrapper />
      </Provider>
  );
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}
 
 