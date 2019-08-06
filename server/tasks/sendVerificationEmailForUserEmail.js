const sendEmail = require("./sendEmail");

module.exports = async ({ id }, { withPgClient }) => {
  const { ROOT_URL } = process.env;
  if (!ROOT_URL) {
    throw new Error("Missing required environment variable: ROOT_URL");
  }
  return withPgClient(async pgClient => {
    const result = await pgClient.query(
      `
      SELECT
        ue.email AS email,
        ue.is_verified AS is_verified,
        ues.verification_token AS token
      FROM app_public.user_emails AS ue
        JOIN app_private.user_email_secrets AS ues
        ON ue.id = ues.user_email_id
      WHERE ue.id = $1
      `,
      [id],
    );
    if (result.rowCount === 0) {
      throw new Error(`Could not find user_email ${id}`);
    }
    const { email, token, is_verified: isVerified } = result.rows[0];
    if (isVerified) {
      // nothing to do!
      return;
    }
    await sendEmail({
      to: email,
      subject: "Please verify your email address",
      text: `${ROOT_URL}/verify-email/${token}`,
    });
    await pgClient.query(
      `
      UPDATE app_private.user_email_secrets AS ues
      SET verification_email_sent_at = now()
      WHERE ues.user_email_id = $1
      `,
      [id],
    );
  });
};
