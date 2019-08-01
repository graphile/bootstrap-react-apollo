const sgMail = require('@sendgrid/mail')

module.exports = async ({
  from, to, subject, text, html,
}) => {
  const { SENDGRID_API_KEY, EMAIL_DEFAULT_FROM } = process.env
  if (!SENDGRID_API_KEY) {
    throw new Error('Missing required environment variable: SENDGRID_API_KEY')
  }
  sgMail.setApiKey(SENDGRID_API_KEY)

  return sgMail
    .send({
      from: from || EMAIL_DEFAULT_FROM, to, subject, text, html,
    })
    .catch(err => console.error(err))
}
