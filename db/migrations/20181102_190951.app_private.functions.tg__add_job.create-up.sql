create function app_private.tg__add_job() returns trigger as $$
begin
  perform app_jobs.add_job(tg_argv[0], json_build_object('id', NEW.id), tg_argv[1]);
  return NEW;
end;
$$ language plpgsql volatile set search_path from current;
comment on function app_private.tg__add_job() is E'Useful shortcut to create a job on insert/update. Pass the task name as the first trigger argument, and optionally the queue name as the second argument. The record id will automatically be available on the JSON payload.';
