import { text } from "express";
import { Resend as MainResend } from "resend";

class Resend {
  resend;
  apikKey = process.env.RESEND_API_KEY;

  constructor() {
    this.resend = new MainResend(this.apikKey);
  }

  async sendEmail({ to, subject, html, from, attachments, text = null }) {
    return new Promise((resolve, reject) => {
      this.resend.emails
        .send({
          from: from || "Untolg.Ng <hi@emails.untold.ng>",
          to,
          subject,
          html,
          text: text,
          attachments,
        })
        .then(({ data, error }) => {
          if (error) {
            return reject(error);
          }

          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }
}

export default Resend;
