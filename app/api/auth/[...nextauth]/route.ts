// NextAuth (Auth.js v5) route handler — exposes /api/auth/* (sign-in, callback,
// session, sign-out). Kept at the conventional root location so the public
// OAuth callback URL is the clean https://admin.nehoraihadad.com/api/auth/callback/google
// (the proxy passes /api/auth/* straight through on every host).
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
