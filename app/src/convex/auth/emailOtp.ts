import { Email } from "@convex-dev/auth/providers/Email";
import axios from "axios";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.AUTH_EMAIL_FROM;
    if (!resendKey || !from) {
      throw new Error("E-posta girişi için Resend ve doğrulanmış gönderen adresi ayarlanmalı.");
    }

    try {
      await axios.post(
        "https://api.resend.com/emails",
        {
          from,
          to: [email],
          subject: `${token} — Makine Nabzı giriş kodunuz`,
          text: `Giriş kodunuz: ${token}\n\nKod 15 dakika geçerlidir.\n\nmakinenabzi.com`,
        },
        { headers: { authorization: `Bearer ${resendKey}` } },
      );
    } catch {
      // Axios' error can contain request headers; do not expose the API key.
      throw new Error("Giriş kodu e-postası gönderilemedi.");
    }
  },
});
