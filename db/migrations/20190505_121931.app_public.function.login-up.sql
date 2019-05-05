
CREATE OR REPLACE FUNCTION app_public.login(username text, password text)
 RETURNS app_public.users
 LANGUAGE sql
 STRICT SECURITY DEFINER
 SET search_path TO '$user', 'public'
AS $function$
  select app_private.login(username, password);
$function$
