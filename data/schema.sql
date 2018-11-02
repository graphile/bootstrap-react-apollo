--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4
-- Dumped by pg_dump version 10.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: app_hidden; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app_hidden;


--
-- Name: app_jobs; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app_jobs;


--
-- Name: app_private; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app_private;


--
-- Name: app_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app_public;


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: jobs; Type: TABLE; Schema: app_jobs; Owner: -
--

CREATE TABLE app_jobs.jobs (
    id integer NOT NULL,
    queue_name character varying DEFAULT (public.gen_random_uuid())::character varying NOT NULL,
    task_identifier character varying NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    run_at timestamp with time zone DEFAULT now() NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    last_error character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: add_job(character varying, jsonb); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.add_job(identifier character varying, payload jsonb) RETURNS app_jobs.jobs
    LANGUAGE sql
    AS $$
  INSERT INTO app_jobs.jobs(task_identifier, payload) VALUES(identifier, payload) RETURNING *;
$$;


--
-- Name: add_job(character varying, jsonb, character varying); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.add_job(identifier character varying, payload jsonb, queue_name character varying) RETURNS app_jobs.jobs
    LANGUAGE sql
    AS $$
  INSERT INTO app_jobs.jobs(task_identifier, queue_name, payload) VALUES(identifier, queue_name, payload) RETURNING *;
$$;


--
-- Name: add_job(character varying, jsonb, character varying, timestamp with time zone); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.add_job(identifier character varying, payload jsonb, queue_name character varying, run_at timestamp with time zone) RETURNS app_jobs.jobs
    LANGUAGE sql
    AS $$
  INSERT INTO app_jobs.jobs(task_identifier, queue_name, payload, run_at) VALUES(identifier, queue_name, payload, run_at) RETURNING *;
$$;


--
-- Name: complete_job(character varying, integer); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.complete_job(worker_id character varying, job_id integer) RETURNS app_jobs.jobs
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_row app_jobs.jobs;
BEGIN
  DELETE FROM app_jobs.jobs
    WHERE id = job_id
    RETURNING * INTO v_row;

  UPDATE app_jobs.job_queues
    SET locked_by = null, locked_at = null
    WHERE queue_name = v_row.queue_name AND locked_by = worker_id;

  RETURN v_row;
END;
$$;


--
-- Name: do_notify(); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.do_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- This is a STATEMENT trigger, so we do not have access to the individual
  -- rows.
  PERFORM pg_notify(TG_ARGV[0], '');
  RETURN NEW;
END;
$$;


--
-- Name: FUNCTION do_notify(); Type: COMMENT; Schema: app_jobs; Owner: -
--

COMMENT ON FUNCTION app_jobs.do_notify() IS 'Performs pg_notify passing the first argument as the topic.';


--
-- Name: fail_job(character varying, integer, character varying); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.fail_job(worker_id character varying, job_id integer, error_message character varying) RETURNS app_jobs.jobs
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_row app_jobs.jobs;
BEGIN
  UPDATE app_jobs.jobs
    SET
      last_error = error_message,
      run_at = greatest(now(), run_at) + (exp(least(attempts, 10))::text || ' seconds')::interval
    WHERE id = job_id
    RETURNING * INTO v_row;

  UPDATE app_jobs.job_queues
    SET locked_by = null, locked_at = null
    WHERE queue_name = v_row.queue_name AND locked_by = worker_id;

  RETURN v_row;
END;
$$;


--
-- Name: get_job(character varying, character varying[]); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.get_job(worker_id character varying, identifiers character varying[]) RETURNS app_jobs.jobs
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_job_id int;
  v_queue_name varchar;
  v_default_job_expiry text = (4 * 60 * 60)::text;
  v_default_job_maximum_attempts text = '25';
  v_row app_jobs.jobs;
BEGIN
  IF worker_id IS NULL OR length(worker_id) < 10 THEN
    RAISE EXCEPTION 'Invalid worker ID';
  END IF;

  SELECT job_queues.queue_name, jobs.id INTO v_queue_name, v_job_id
    FROM app_jobs.job_queues
    INNER JOIN app_jobs.jobs USING (queue_name)
    WHERE (locked_at IS NULL OR locked_at < (now() - (COALESCE(current_setting('jobs.expiry', true), v_default_job_expiry) || ' seconds')::interval))
    AND run_at <= now()
    AND attempts < COALESCE(current_setting('jobs.maximum_attempts', true), v_default_job_maximum_attempts)::int
    AND (identifiers IS NULL OR task_identifier = any(identifiers))
    ORDER BY priority ASC, run_at ASC, id ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

  IF v_queue_name IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE app_jobs.job_queues
    SET
      locked_by = worker_id,
      locked_at = now()
    WHERE job_queues.queue_name = v_queue_name;

  UPDATE app_jobs.jobs
    SET attempts = attempts + 1
    WHERE id = v_job_id
    RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;


--
-- Name: jobs__decrease_job_queue_count(); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.jobs__decrease_job_queue_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE app_jobs.job_queues
    SET job_count = job_queues.job_count - 1
    WHERE queue_name = OLD.queue_name
    AND job_queues.job_count > 1;

  IF NOT FOUND THEN
    DELETE FROM app_jobs.job_queues WHERE queue_name = OLD.queue_name;
  END IF;

  RETURN OLD;
END;
$$;


--
-- Name: jobs__increase_job_queue_count(); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.jobs__increase_job_queue_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO app_jobs.job_queues(queue_name, job_count)
    VALUES(NEW.queue_name, 1)
    ON CONFLICT (queue_name) DO UPDATE SET job_count = job_queues.job_count + 1;

  RETURN NEW;
END;
$$;


--
-- Name: update_timestamps(); Type: FUNCTION; Schema: app_jobs; Owner: -
--

CREATE FUNCTION app_jobs.update_timestamps() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = NOW();
    NEW.updated_at = NOW();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.created_at = OLD.created_at;
    NEW.updated_at = GREATEST(NOW(), OLD.updated_at + INTERVAL '1 millisecond');
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: FUNCTION update_timestamps(); Type: COMMENT; Schema: app_jobs; Owner: -
--

COMMENT ON FUNCTION app_jobs.update_timestamps() IS 'Ensures that created_at, updated_at are monotonically increasing.';


--
-- Name: job_queues; Type: TABLE; Schema: app_jobs; Owner: -
--

CREATE TABLE app_jobs.job_queues (
    queue_name character varying NOT NULL,
    job_count integer DEFAULT 0 NOT NULL,
    locked_at timestamp with time zone,
    locked_by character varying
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: app_jobs; Owner: -
--

CREATE SEQUENCE app_jobs.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: app_jobs; Owner: -
--

ALTER SEQUENCE app_jobs.jobs_id_seq OWNED BY app_jobs.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: jobs id; Type: DEFAULT; Schema: app_jobs; Owner: -
--

ALTER TABLE ONLY app_jobs.jobs ALTER COLUMN id SET DEFAULT nextval('app_jobs.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: job_queues job_queues_pkey; Type: CONSTRAINT; Schema: app_jobs; Owner: -
--

ALTER TABLE ONLY app_jobs.job_queues
    ADD CONSTRAINT job_queues_pkey PRIMARY KEY (queue_name);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: app_jobs; Owner: -
--

ALTER TABLE ONLY app_jobs.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: jobs _100_timestamps; Type: TRIGGER; Schema: app_jobs; Owner: -
--

CREATE TRIGGER _100_timestamps BEFORE INSERT OR UPDATE ON app_jobs.jobs FOR EACH ROW EXECUTE PROCEDURE app_jobs.update_timestamps();


--
-- Name: jobs _500_decrease_job_queue_count; Type: TRIGGER; Schema: app_jobs; Owner: -
--

CREATE TRIGGER _500_decrease_job_queue_count BEFORE DELETE ON app_jobs.jobs FOR EACH ROW EXECUTE PROCEDURE app_jobs.jobs__decrease_job_queue_count();


--
-- Name: jobs _500_decrease_job_queue_count_update; Type: TRIGGER; Schema: app_jobs; Owner: -
--

CREATE TRIGGER _500_decrease_job_queue_count_update AFTER UPDATE ON app_jobs.jobs FOR EACH ROW WHEN (((new.queue_name)::text IS DISTINCT FROM (old.queue_name)::text)) EXECUTE PROCEDURE app_jobs.jobs__decrease_job_queue_count();


--
-- Name: jobs _500_increase_job_queue_count; Type: TRIGGER; Schema: app_jobs; Owner: -
--

CREATE TRIGGER _500_increase_job_queue_count AFTER INSERT ON app_jobs.jobs FOR EACH ROW EXECUTE PROCEDURE app_jobs.jobs__increase_job_queue_count();


--
-- Name: jobs _500_increase_job_queue_count_update; Type: TRIGGER; Schema: app_jobs; Owner: -
--

CREATE TRIGGER _500_increase_job_queue_count_update AFTER UPDATE ON app_jobs.jobs FOR EACH ROW WHEN (((new.queue_name)::text IS DISTINCT FROM (old.queue_name)::text)) EXECUTE PROCEDURE app_jobs.jobs__increase_job_queue_count();


--
-- Name: jobs _900_notify_worker; Type: TRIGGER; Schema: app_jobs; Owner: -
--

CREATE TRIGGER _900_notify_worker AFTER INSERT ON app_jobs.jobs FOR EACH STATEMENT EXECUTE PROCEDURE app_jobs.do_notify('jobs:insert');


--
-- Name: job_queues; Type: ROW SECURITY; Schema: app_jobs; Owner: -
--

ALTER TABLE app_jobs.job_queues ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA app_hidden; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA app_hidden TO boilerplatecheck_visitor;


--
-- Name: SCHEMA app_public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA app_public TO boilerplatecheck_visitor;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: app_hidden; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE boilerplatecheck IN SCHEMA app_hidden REVOKE ALL ON SEQUENCES  FROM boilerplatecheck;
ALTER DEFAULT PRIVILEGES FOR ROLE boilerplatecheck IN SCHEMA app_hidden GRANT SELECT,USAGE ON SEQUENCES  TO boilerplatecheck_visitor;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: app_public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE boilerplatecheck IN SCHEMA app_public REVOKE ALL ON SEQUENCES  FROM boilerplatecheck;
ALTER DEFAULT PRIVILEGES FOR ROLE boilerplatecheck IN SCHEMA app_public GRANT SELECT,USAGE ON SEQUENCES  TO boilerplatecheck_visitor;


--
-- PostgreSQL database dump complete
--
