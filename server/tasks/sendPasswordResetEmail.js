const sendEmail = require("./sendEmail");

const minDurationBetweenEmails = 60 * 30; // 30 minutes

module.exports = async ({ id }, { withPgClient }) => {
  const { ROOT_URL } = process.env;
  if (!ROOT_URL) {
    throw new Error("Missing required environment variable: ROOT_URL");
  }
  return withPgClient(async pgClient => {
    const result = await pgClient.query(
      `
      SELECT
        ue.user_id as uid,
        ue.email as email,
        us.reset_password_token as token,
        ues.password_reset_email_sent_at as sent_at
      FROM app_public.user_emails AS ue
        JOIN app_private.user_email_secrets AS ues
        ON ue.id = ues.user_email_id
        JOIN app_private.user_secrets AS us
        ON us.user_id = ue.user_id
      WHERE ue.id = $1
      `,
      [id],
    );
    if (result.rowCount === 0) {
      throw new Error(`Could not find user_email ${id}`);
    }

    const {
      uid, email, token, sent_at: sentAt,
    } = result.rows[0];
    if (sentAt && new Date() - sentAt < minDurationBetweenEmails) {
      // We're sending emails too quickly.
      // It would be semantically correct to throw an error here,
      // but if we do that, this task will be rescheduled for a future time,
      // which is not what we want. Instead, we will just return a value,
      // which will mark this task as successfully executed.
      return "Error: sending emails too quickly";
    }

    await sendEmail({
      to: email,
      subject: "You requested a password reset",
      text: `${ROOT_URL}/reset-password/${uid}/${token}`,
    });
    await pgClient.query(
      `
      UPDATE app_private.user_email_secrets AS ues
      SET password_reset_email_sent_at = now()
      WHERE ues.user_email_id = $1
      `,
      [id],
    );
    return null;
  });
};
