drop function app_private.register_user(
  f_service character varying,
  f_identifier character varying,
  f_profile json,
  f_auth_details json,
  f_email_is_verified boolean
);
