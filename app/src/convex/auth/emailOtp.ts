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
    // Yayında kod kendi sağlayıcınızdan gönderilir: RESEND_API_KEY tanımlıysa
    // Resend kullanılır. Tanımlı değilse (ör. geliştirme önizlemesi) aşağıdaki
    // varsayılan yol korunur, böylece davranış geriye dönük olarak değişmez.
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const from =
        process.env.AUTH_EMAIL_FROM ||
        "Makine Nabzı <bildirim@makinenabzi.com>";
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
      } catch (error) {
        throw new Error(JSON.stringify(error));
      }
      return;
    }

    try {
      await axios.post(
        "https://auth.freebuff.app/send_otp",
        {
          to: email,
          otp: token,
          appName: process.env.VLY_APP_NAME || "Makine Nabzı",
        },
        {
          headers: {
            "x-api-key": "fb_email_2crN1hqIArZP2bEfvjp5Qik4",
          },
        },
      );
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
