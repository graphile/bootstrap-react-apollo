create function app_public.verify_user_email(token text) returns app_public.user_emails as $$
declare
  v_user_email app_public.user_emails;
  v_max_duration interval = interval '7 days';
begin
  UPDATE app_public.user_emails
  SET is_verified = true
  WHERE id = (
    SELECT user_email_id
    FROM app_private.user_email_secrets
    WHERE user_email_secrets.verification_token = token
    AND user_email_secrets.verification_email_sent_at > now() - v_max_duration
  )
  RETURNING * INTO v_user_email;

  if v_user_email is NULL THEN
    raise exception 'verification token is invalid or expired' using errcode='INVALID';
  end if;

  return v_user_email;
end;
$$ language plpgsql strict security definer volatile set search_path from current;

comment on function app_public.verify_user_email(token text) is
  E'@resultFieldName userEmail\nAfter you add an email address, you will receive an email with a verification token. Give us the verification token to mark that email as verified!';
