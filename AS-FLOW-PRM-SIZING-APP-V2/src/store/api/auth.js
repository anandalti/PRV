import axios from "../../utils/interceptor";
import plainAxios from 'axios';
import { graphqlClient } from "../../utils/graphqlClient";
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  REFRESH_TOKEN_MUTATION,
  LOGOUT_MUTATION,
  UPDATE_PASSWORD_MUTATION,
} from "./graphql/queries";
import { USE_GRAPHQL, REST_API_BASE } from "./apiConfig";

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Check login status (health check)
 * REST: GET /v2/api/auth/check-login
 * GraphQL: Query to verify authentication
 */
export const checkLoginAPI = async () => {
  if (USE_GRAPHQL) {
    try {
      // Using a standard query to check if user is authenticated
      const response = await graphqlClient.query({
        query: LOGIN_MUTATION, // Fallback — GraphQL should have a HealthCheck or similar
      });
      return {
        ...response.data,
        status: 200,
      };
    } catch (error) {
      console.error('🔴 GraphQL check login error:', error.message);
      throw error;
    }
  } else {
    // REST: GET /v2/api/auth/check-login
    try {
      const response = await axios.get(`${REST_API_BASE}/auth/check-login`);
      return response;
    } catch (error) {
      console.error('🔴 REST check login error:', error.message);
      throw error;
    }
  }
};

/**
 * User login - POST /auth/login
 * REST: POST /v2/api/auth/login
 * GraphQL: mutation Login($input: LoginInput!)
 */
export const loginAPI = async (data) => {
//   console.log('🔍 DEBUG loginAPI called - USE_GRAPHQL:', USE_GRAPHQL);
//   console.log('🔍 DEBUG loginAPI - REST_API_BASE:', REST_API_BASE);
  
  if (USE_GRAPHQL && data?.AppType !=='CA') {
    try {
    //   console.log('🟢 GraphQL Mode: Executing LOGIN_MUTATION');
    //   console.log('🟢 GraphQL Endpoint:', `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_GRAPHQL_ENDPOINT}`);
      const response = await graphqlClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          input: {
            email: data.email,
            password: data.password,
          },
        },
      });
      // GraphQL response structure: { login: { success, accessToken, user, preferences, ... } }
      const normalizedResponse = {
        data: response.data.login,
        status: 200,
      };
    //   console.log('✅ GraphQL loginAPI - Normalized Response:', JSON.stringify(normalizedResponse, null, 2));
      return normalizedResponse;
    } catch (error) {
      console.error('🔴 GraphQL login error:', error.message);
      throw error;
    }
  } else {
    try {
      const fullUrl = `${REST_API_BASE}/auth/login`;
    //   console.log('🟢 REST Mode: POST request to:', fullUrl);
      const response = await axios.post(fullUrl, {
        email: data.email,
        password: data.password,
      });
      // REST response structure: { status, message, data: { user, preferences, accessToken, ... } }
      // Normalize to match GraphQL: { data: { success, accessToken, user, preferences, ... } }
      const restData = response.data.data || response.data;
      const normalizedResponse = {
        data: {
          success: response.data.status === 'success',
          message: response.data.message,
          accessToken: restData.accessToken,
          user: restData.user,
          preferences: restData.preferences,
          errors: restData.errors || [],
        },
        status: response.status,
      };
    //   console.log('✅ REST loginAPI - Normalized Response:', JSON.stringify(normalizedResponse, null, 2));
      return normalizedResponse;
    } catch (error) {
      console.error('🔴 REST login error:', error.message);
      throw error;
    }
  }
};

/**
 * User register - POST /auth/register
 * REST: POST /v2/api/auth/register
 * GraphQL: mutation Register($input: RegisterInput!)
 */
export const registerAPI = async (data) => {
  if (USE_GRAPHQL) {
    try {
      console.log('🟢 GraphQL Mode: Executing REGISTER_MUTATION');
      const response = await graphqlClient.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          input: {
            email: data.email,
            password: data.password,
            name: data.name || data.email.split('@')[0],
            AppType: data.AppType || 'PRVPA-ONLINE',
          },
        },
      });
      return {
        data: response.data.register,
        status: 200,
      };
    } catch (error) {
      console.error('🔴 GraphQL register error:', error.message);
      throw error;
    }
  } else {
    try {
      console.log('🟢 REST Mode: POST /v2/api/auth/register');
      const response = await axios.post(`${REST_API_BASE}/auth/register`, data);
      // Normalize REST response to match GraphQL format
      const restData = response.data.data || response.data;
      return {
        data: {
          success: response.data.status === 'success',
          message: response.data.message,
          accessToken: restData.accessToken,
          user: restData.user,
          preferences: restData.preferences,
          errors: restData.errors || [],
        },
        status: response.status,
      };
    } catch (error) {
      console.error('🔴 REST register error:', error.message);
      throw error;
    }
  }
};

/**
 * Refresh token - POST /auth/refresh-token
 * REST: POST /v2/api/auth/refresh-token
 * GraphQL: mutation RefreshToken
 *
 * ✅ METHOD 1 (Primary): Send refreshToken via HTTP-only cookie (credentials: 'include')
 * ✅ METHOD 2 (Fallback): Send refreshToken explicitly in mutation variables + X-Refresh-Token header
 * 
 * Note: Authorization header is SKIPPED for this mutation (see graphqlClient.js authLink)
 *       because refreshToken shouldn't require a valid accessToken
 */
export const refreshTokenAPI = async () => {
  if (USE_GRAPHQL) {
    try {
      console.log('🟢 [refreshTokenAPI] GraphQL Mode: Attempting cookie-based token refresh');
      console.log('   Apollo Client sends: credentials: include (HTTP-only cookies)');
      console.log('   Authorization header: SKIPPED (refreshToken doesn\'t need accessToken)');
      
      // ✅ METHOD 1: Let browser send refreshToken cookie automatically
      // The resolver will extract it from req.cookies.refreshToken
      const response = await graphqlClient.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { refreshToken: null },  // ← null signals resolver to use cookie
      });
      
      console.log('✅ [refreshTokenAPI] Cookie-based refresh succeeded');
      return {
        data: response.data.refreshToken,
        status: 200,
      };
    } catch (error) {
      console.error('🔴 [refreshTokenAPI] Cookie method failed:', error.message);
      
      // ✅ METHOD 2: Fallback - Try sending refreshToken via variable + header
      // This handles cases where cookies aren't being sent or are blocked
      try {
        // Try to get refreshToken from localStorage (if it was stored there by login)
        let refreshTokenValue = localStorage.getItem('refreshToken');
        
        // If not in localStorage, try sessionStorage
        if (!refreshTokenValue) {
          refreshTokenValue = sessionStorage.getItem('refreshToken');
        }
        
        if (refreshTokenValue) {
          console.log('⚠️  [refreshTokenAPI] Cookie method failed, attempting fallback with explicit token...');
          console.log('   Sending refreshToken as: variable + X-Refresh-Token header');
          
          const response = await graphqlClient.mutate({
            mutation: REFRESH_TOKEN_MUTATION,
            variables: {
              refreshToken: refreshTokenValue,  // ← Send as GraphQL variable
            },
            context: {
              headers: {
                'X-Refresh-Token': refreshTokenValue,  // ← Also send as header (belt-and-suspenders)
              },
            },
          });
          
          console.log('✅ [refreshTokenAPI] Header-based refresh with token parameter succeeded');
          return {
            data: response.data.refreshToken,
            status: 200,
          };
        } else {
          console.error('❌ [refreshTokenAPI] No refreshToken found in localStorage or sessionStorage');
          console.error('   Available storage keys:', {
            localStorage: Object.keys(localStorage),
            sessionStorage: Object.keys(sessionStorage),
          });
        }
      } catch (fallbackError) {
        console.error('🔴 [refreshTokenAPI] Header-based fallback also failed:', fallbackError.message);
      }
      
      throw error;
    }
  } else {
    try {
      console.log('🟢 [refreshTokenAPI] REST Mode: POST /v2/api/auth/refresh-token');
      const response = await plainAxios.post(
        `${API_BASE}/v2/api/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('🔴 [refreshTokenAPI] REST refresh token error:', error.message);
      throw error;
    }
  }
};

/**
 * Logout - POST /auth/logout
 * REST: POST /v2/api/auth/logout
 * GraphQL: mutation Logout
 * Note: Uses plain axios/Apollo to handle httpOnly cookies
 */
export const logoutAPI = async () => {
  if (USE_GRAPHQL) {
    try {
      console.log('🟢 GraphQL Mode: Executing LOGOUT_MUTATION');
      const response = await graphqlClient.mutate({
        mutation: LOGOUT_MUTATION,
      });
      return {
        data: response.data.logout,
        status: 200,
      };
    } catch (error) {
      console.error('🔴 GraphQL logout error:', error.message);
      // Don't throw — local session must be cleared regardless
      return { data: { success: true }, status: 200 };
    }
  } else {
    try {
      console.log('🟢 REST Mode: POST /v2/api/auth/logout');
      const response = await plainAxios.post(
        `${API_BASE}/v2/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('🔴 REST logout error:', error.message);
      // Don't throw — local session must be cleared regardless
      return { success: true };
    }
  }
};

/**
 * Update password - POST /auth/updatePassword
 * REST: POST /v2/api/auth/updatePassword
 * GraphQL: mutation UpdatePassword($input: UpdatePasswordInput!)
 */
export const updatePasswordAPI = async (data) => {
  if (USE_GRAPHQL) {
    try {
      console.log('🟢 GraphQL Mode: Executing UPDATE_PASSWORD_MUTATION');
      const response = await graphqlClient.mutate({
        mutation: UPDATE_PASSWORD_MUTATION,
        variables: {
          input: {
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
          },
        },
      });
      return {
        data: response.data.updatePassword,
        status: 200,
      };
    } catch (error) {
      console.error('🔴 GraphQL update password error:', error.message);
      throw error;
    }
  } else {
    try {
      console.log('🟢 REST Mode: POST /v2/api/auth/updatePassword');
      const response = await axios.post(
        `${REST_API_BASE}/auth/updatePassword`,
        data
      );
      // Normalize REST response to match GraphQL format
      const restData = response.data.data || response.data;
      return {
        data: {
          success: response.data.status === 'success',
          message: response.data.message,
          errors: restData.errors || [],
        },
        status: response.status,
      };
    } catch (error) {
      console.error('🔴 REST update password error:', error.message);
      throw error;
    }
  }
};