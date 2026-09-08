import { Auth0Provider } from '@auth0/auth0-react';

const Auth0ProviderComponent = ({children}) => {
  return (
    
        <Auth0Provider
          domain={process.env?.VITE_AUTH0_DOMAIN}
          clientId={process.env?.VITE_AUTH0_CLIENT_ID}
          authorizationParams={{redirect_uri:`${window.location.origin}/CommonProductAdvisorDisplayView`}}
          // authorizationParams={{redirect_uri:`${window.location.origin}`}}
        >
          {children}
        </Auth0Provider>
      
  )
}

export default Auth0ProviderComponent