import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Lazy store reference — injected from main.jsx after store is initialized
// Avoids circular dependency; authLink reads from it on every request
let _store = null;
export const injectStoreToGraphqlClient = (store) => { _store = store; };

/**
 * GraphQL Apollo Client Configuration
 * Used for GraphQL queries and mutations when VITE_API_GATEWAY_ENABLED is true
 */
export const createGraphqlClient = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const gqlPath = import.meta.env.VITE_GRAPHQL_ENDPOINT;

  if (!apiUrl || !gqlPath) {
    console.warn('[graphqlClient] Missing VITE_API_URL or VITE_GRAPHQL_ENDPOINT. Set these in .env when VITE_API_GATEWAY_ENABLED=true.');
  }

  const graphqlEndpoint = `${apiUrl || ''}${gqlPath || ''}`;
  
  console.log('🔍 DEBUG graphqlClient - Creating Apollo Client with URI:', graphqlEndpoint);

  const httpLink = new HttpLink({
    uri: graphqlEndpoint,
    credentials: 'include', // ✅ Send cookies (refreshToken, accessToken) with ALL requests
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ✅ Context link: Conditionally add Authorization header EXCEPT for refreshToken mutation
  const authLink = setContext((operation, { headers }) => {
    if (operation.operationName === 'RefreshToken') {
      return { headers: { ...headers } };
    }

    // Read accessToken from Redux store (updated on login + token refresh)
    // Falls back to sessionStorage.authToken for legacy GOS platform compatibility
    const token = _store?.getState()?.auth?.accessToken || sessionStorage.getItem('authToken');

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: authLink.concat(httpLink), // ✅ Chain: authLink → httpLink
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
    },
  });
};

export const graphqlClient = createGraphqlClient();
