/**
 * API Configuration and Routing Logic
 * Determines whether to use REST (Axios) or GraphQL (Apollo) based on feature flag
 */

// DEBUG: Check environment variables at module load time
// if (typeof window !== 'undefined') {
//   console.log('🔍 DEBUG apiConfig.js - Environment Variables:');
//   console.log('  VITE_API_URL:', import.meta.env.VITE_API_URL);
//   console.log('  VITE_GRAPHQL_ENDPOINT:', import.meta.env.VITE_GRAPHQL_ENDPOINT);
//   console.log('  VITE_API_GATEWAY_ENABLED:', import.meta.env.VITE_API_GATEWAY_ENABLED);
// }

export const USE_GRAPHQL = import.meta.env.VITE_API_GATEWAY_ENABLED === 'true';

// DEBUG: Log the resolved mode
// if (typeof window !== 'undefined') {
//   console.log('🔍 DEBUG apiConfig.js - USE_GRAPHQL resolved to:', USE_GRAPHQL);
// }

export const REST_API_BASE = `${import.meta.env.VITE_API_URL}/v2/api`;

export const GRAPHQL_ENDPOINT = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_GRAPHQL_ENDPOINT}`;

/**
 * Get the appropriate API endpoint based on the feature flag
 * @returns {string} API endpoint URL
 */
export const getApiEndpoint = () => {
  if (USE_GRAPHQL) {
    return GRAPHQL_ENDPOINT;
  }
  return REST_API_BASE;
};

/**
 * Log current API mode for debugging
 */
export const logApiMode = () => {
  if (typeof window !== 'undefined') {
    console.log(`🔗 API Mode: ${USE_GRAPHQL ? 'GraphQL (/gql)' : 'REST (/v2/api)'}`);
    console.log(`   Endpoint: ${getApiEndpoint()}`);
  }
};

/**
 * Endpoints that support both REST and GraphQL
 * When USE_GRAPHQL=true, these use Apollo Client with GraphQL mutations/queries
 * When USE_GRAPHQL=false, these use Axios with /v2/api REST paths
 * 
 * Phase 1 (Auth Endpoints): All 5 auth endpoints
 * Phase 2 (Workflow Endpoints): Core sizing and workflow endpoints
 * Phase 3 (Remaining): All other V2 API endpoints use REST only
 */
export const GRAPHQL_ENABLED_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
    updatePassword: '/auth/updatePassword',
  },
  // Phase 2 endpoints will be added here in next iteration
  core: {
    errorGrid: '/genericdata/errorsgrid',
    fluids: '/genericdata/fluids',
    uomDetails: '/uom/uomDetails',
    workflowData: '/GetWorkflowData',
    preferencesLayout: '/layoutData/preferences',
    workflowLayout: '/layoutData/workflow',
    // More to be added in Phase 2
  },
};

/**
 * Helper: Check if endpoint is GraphQL-enabled
 * @param {string} endpoint - Endpoint path (e.g., '/auth/login')
 * @returns {boolean} True if endpoint supports GraphQL
 */
export const isGraphQLEndpoint = (endpoint) => {
  return Object.values(GRAPHQL_ENABLED_ENDPOINTS).some((category) =>
    Object.values(category).includes(endpoint)
  );
};

// Log on load
if (typeof window !== 'undefined') {
  logApiMode();
}
