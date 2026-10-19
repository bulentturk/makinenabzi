// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { emailOtp } from "./auth/emailOtp";
import { grantFounderRole } from "./lib/founder";


export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  // Google girişi: AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET değerlerini @auth/core
  // kendisi okur. E-posta kodu ve misafir girişi yedek yol olarak kalır.
  providers: [Google, emailOtp, Anonymous],
  callbacks: {
    // Kurulum gerektirmesin: ilk doğrulanmış hesap editör olur.
    afterUserCreatedOrUpdated: grantFounderRole,
  },
});