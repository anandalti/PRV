const axios = require("axios");

let cachedServiceToken = null;
let cachedServiceTokenExpiry = 0;

const oktaServiceToken = async (clientId, clientSecret) => {
  const now = Date.now();
  if (cachedServiceToken && now < cachedServiceTokenExpiry - 30000) {
    return cachedServiceToken;
  }

  const issuer = process.env.OKTA_ISSUER;
  const tokenUrl = process.env.OKTA_TOKEN_URL || (issuer ? `${issuer.replace(/\/$/, "")}/v1/token` : "");
  clientId = clientId || process.env.ADS_CLIENT_ID;
  clientSecret = clientSecret || process.env.ADS_CLIENT_SECRET;
  const audience = process.env.API_AUDIENCE || "api://default";
  const scope = process.env.OKTA_TOKEN_SCOPE || "access_token";

  if (!tokenUrl || !clientId || !clientSecret) {
    throw new Error("Missing Okta config. Required: OKTA_TOKEN_URL/OKTA_ISSUER, ADS_CLIENT_ID, ADS_CLIENT_SECRET");
  }

  const payload = new URLSearchParams();
  payload.append("grant_type", "client_credentials");
  if (audience) payload.append("audience", audience);
  if (scope) payload.append("scope", scope);

  const tokenResponse = await axios({
    method: "POST",
    url: tokenUrl,
    data: payload.toString(),
    timeout: 15000,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    auth: {
      username: clientId,
      password: clientSecret
    }
  });

  const accessToken = tokenResponse?.data?.access_token;
  const expiresIn = Number(tokenResponse?.data?.expires_in || 3600);
  if (!accessToken) {
    throw new Error("Okta token response missing access_token");
  }

  cachedServiceToken = accessToken;
  cachedServiceTokenExpiry = Date.now() + (expiresIn * 1000);
  // console.log('Using Service Token:', accessToken);
  return accessToken;
};

module.exports = {
    oktaServiceToken
}