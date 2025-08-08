import { createKindeClient } from '@kinde-oss/kinde-auth-react';

export const kinde = createKindeClient({
  clientId: import.meta.env.VITE_KINDE_CLIENT_ID,
  domain: import.meta.env.VITE_KINDE_DOMAIN,
  redirectUri: window.location.origin,
  logoutUri: window.location.origin,
});

export const {
  useKindeAuth,
  KindeProvider,
} = kinde;