require("dotenv").config();

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.sendEmail = async function ({ to, cc, subject, text, html }) {
  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    cc,
    subject,
    text,
    html
  }

  return sgMail.send(msg)
}


