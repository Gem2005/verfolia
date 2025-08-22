

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_table_exists"("table_name" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = check_table_exists.table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;


ALTER FUNCTION "public"."check_table_exists"("table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."compare_resume_metrics"("p_resume_id" "uuid", "p_period_1_start" timestamp with time zone, "p_period_1_end" timestamp with time zone, "p_period_2_start" timestamp with time zone, "p_period_2_end" timestamp with time zone) RETURNS TABLE("metric_name" "text", "period_1_value" numeric, "period_2_value" numeric, "percentage_change" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    views_p1 BIGINT;
    views_p2 BIGINT;
    unique_views_p1 BIGINT;
    unique_views_p2 BIGINT;
    avg_duration_p1 NUMERIC;
    avg_duration_p2 NUMERIC;
    interactions_p1 BIGINT;
    interactions_p2 BIGINT;
BEGIN
    -- Get views for period 1
    SELECT 
        COUNT(*), 
        COUNT(DISTINCT session_id),
        COALESCE(AVG(view_duration), 0)
    INTO 
        views_p1, 
        unique_views_p1,
        avg_duration_p1
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id
        AND viewed_at BETWEEN p_period_1_start AND p_period_1_end;
    
    -- Get views for period 2
    SELECT 
        COUNT(*), 
        COUNT(DISTINCT session_id),
        COALESCE(AVG(view_duration), 0)
    INTO 
        views_p2, 
        unique_views_p2,
        avg_duration_p2
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id
        AND viewed_at BETWEEN p_period_2_start AND p_period_2_end;
    
    -- Get interactions for period 1
    SELECT 
        COUNT(*)
    INTO 
        interactions_p1
    FROM 
        public.resume_interactions
    WHERE 
        resume_id = p_resume_id
        AND clicked_at BETWEEN p_period_1_start AND p_period_1_end;
    
    -- Get interactions for period 2
    SELECT 
        COUNT(*)
    INTO 
        interactions_p2
    FROM 
        public.resume_interactions
    WHERE 
        resume_id = p_resume_id
        AND clicked_at BETWEEN p_period_2_start AND p_period_2_end;
    
    -- Return metrics
    
    -- Total Views
    metric_name := 'Total Views';
    period_1_value := views_p1;
    period_2_value := views_p2;
    percentage_change := CASE 
                            WHEN views_p1 = 0 THEN 
                                NULL
                            ELSE 
                                100.0 * (views_p2 - views_p1) / views_p1
                         END;
    RETURN NEXT;
    
    -- Unique Views
    metric_name := 'Unique Views';
    period_1_value := unique_views_p1;
    period_2_value := unique_views_p2;
    percentage_change := CASE 
                            WHEN unique_views_p1 = 0 THEN 
                                NULL
                            ELSE 
                                100.0 * (unique_views_p2 - unique_views_p1) / unique_views_p1
                         END;
    RETURN NEXT;
    
    -- Average View Duration
    metric_name := 'Avg View Duration (seconds)';
    period_1_value := avg_duration_p1;
    period_2_value := avg_duration_p2;
    percentage_change := CASE 
                            WHEN avg_duration_p1 = 0 THEN 
                                NULL
                            ELSE 
                                100.0 * (avg_duration_p2 - avg_duration_p1) / avg_duration_p1
                         END;
    RETURN NEXT;
    
    -- Total Interactions
    metric_name := 'Total Interactions';
    period_1_value := interactions_p1;
    period_2_value := interactions_p2;
    percentage_change := CASE 
                            WHEN interactions_p1 = 0 THEN 
                                NULL
                            ELSE 
                                100.0 * (interactions_p2 - interactions_p1) / interactions_p1
                         END;
    RETURN NEXT;
    
    -- Interactions per View
    metric_name := 'Interactions per View';
    period_1_value := CASE WHEN views_p1 = 0 THEN 0 ELSE interactions_p1::NUMERIC / views_p1 END;
    period_2_value := CASE WHEN views_p2 = 0 THEN 0 ELSE interactions_p2::NUMERIC / views_p2 END;
    percentage_change := CASE 
                            WHEN period_1_value = 0 THEN 
                                NULL
                            ELSE 
                                100.0 * (period_2_value - period_1_value) / period_1_value
                         END;
    RETURN NEXT;
END;
$$;


ALTER FUNCTION "public"."compare_resume_metrics"("p_resume_id" "uuid", "p_period_1_start" timestamp with time zone, "p_period_1_end" timestamp with time zone, "p_period_2_start" timestamp with time zone, "p_period_2_end" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_resume_interactions_table"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.resume_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    target_value TEXT,
    section_name TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Create index for faster queries
  CREATE INDEX IF NOT EXISTS resume_interactions_resume_id_idx ON public.resume_interactions(resume_id);
  CREATE INDEX IF NOT EXISTS resume_interactions_clicked_at_idx ON public.resume_interactions(clicked_at);
  CREATE INDEX IF NOT EXISTS resume_interactions_type_idx ON public.resume_interactions(interaction_type);
END;
$$;


ALTER FUNCTION "public"."create_resume_interactions_table"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_resume_views_table"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.resume_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    view_duration INTEGER,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Create index for faster queries
  CREATE INDEX IF NOT EXISTS resume_views_resume_id_idx ON public.resume_views(resume_id);
  CREATE INDEX IF NOT EXISTS resume_views_viewed_at_idx ON public.resume_views(viewed_at);
END;
$$;


ALTER FUNCTION "public"."create_resume_views_table"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_slug"("base_title" "text", "user_id_param" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert title to slug format
  base_slug := lower(trim(regexp_replace(base_title, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- If empty, use default
  IF base_slug = '' THEN
    base_slug := 'resume';
  END IF;
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if necessary
  WHILE EXISTS (SELECT 1 FROM public.resumes WHERE slug = final_slug AND user_id != user_id_param) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;


ALTER FUNCTION "public"."generate_unique_slug"("base_title" "text", "user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_device_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("device_type" "text", "view_count" bigint, "percentage" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    total_views BIGINT;
    actual_start_date TIMESTAMP WITH TIME ZONE;
    actual_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Set default date range if not provided
    actual_start_date := COALESCE(p_start_date, '1970-01-01'::TIMESTAMP WITH TIME ZONE);
    actual_end_date := COALESCE(p_end_date, NOW());
    
    -- Get total views in the date range
    SELECT 
        COUNT(*) 
    INTO 
        total_views
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id
        AND viewed_at BETWEEN actual_start_date AND actual_end_date;
    
    -- Return the device analytics
    RETURN QUERY
    SELECT 
        CASE 
            WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' OR user_agent LIKE '%iPhone%' OR user_agent LIKE '%iPad%' THEN 'Mobile'
            WHEN user_agent LIKE '%Windows%' THEN 'Windows'
            WHEN user_agent LIKE '%Mac%' THEN 'Mac'
            WHEN user_agent LIKE '%Linux%' THEN 'Linux'
            ELSE 'Other'
        END as device_type,
        COUNT(*) as view_count,
        CASE 
            WHEN total_views > 0 THEN 
                100.0 * COUNT(*) / total_views
            ELSE 0
        END as percentage
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id
        AND viewed_at BETWEEN actual_start_date AND actual_end_date
        AND user_agent IS NOT NULL
    GROUP BY 
        device_type
    ORDER BY 
        view_count DESC;
END;
$$;


ALTER FUNCTION "public"."get_device_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_geographic_view_distribution"("p_resume_id" "uuid") RETURNS TABLE("country" "text", "region" "text", "city" "text", "view_count" bigint, "unique_viewers" bigint, "percentage" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    total_views BIGINT;
BEGIN
    -- First check if the user owns this resume
    IF NOT EXISTS (
        SELECT 1 
        FROM public.resumes 
        WHERE id = p_resume_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied: User does not own this resume';
    END IF;

    -- Get total views for percentage calculation
    SELECT COUNT(*) INTO total_views
    FROM public.resume_views
    WHERE resume_id = p_resume_id AND country IS NOT NULL;
    
    RETURN QUERY
    SELECT 
        rv.country,
        rv.region,
        rv.city,
        COUNT(*) as view_count,
        COUNT(DISTINCT rv.session_id) as unique_viewers,
        CASE 
            WHEN total_views > 0 THEN 
                100.0 * COUNT(*) / total_views
            ELSE 0
        END as percentage
    FROM 
        public.resume_views rv
    WHERE 
        rv.resume_id = p_resume_id
        AND rv.country IS NOT NULL
    GROUP BY 
        rv.country, rv.region, rv.city
    ORDER BY 
        view_count DESC;
END;
$$;


ALTER FUNCTION "public"."get_geographic_view_distribution"("p_resume_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_referrer_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("referrer_source" "text", "view_count" bigint, "percentage" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    total_views BIGINT;
    actual_start_date TIMESTAMP WITH TIME ZONE;
    actual_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Set default date range if not provided
    actual_start_date := COALESCE(p_start_date, '1970-01-01'::TIMESTAMP WITH TIME ZONE);
    actual_end_date := COALESCE(p_end_date, NOW());
    
    -- Get total views in the date range
    SELECT 
        COUNT(*) 
    INTO 
        total_views
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id
        AND viewed_at BETWEEN actual_start_date AND actual_end_date;
    
    -- Return the referrer analytics
    RETURN QUERY
    SELECT 
        COALESCE(
            CASE 
                WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
                WHEN referrer LIKE '%google%' THEN 'Google'
                WHEN referrer LIKE '%bing%' THEN 'Bing'
                WHEN referrer LIKE '%yahoo%' THEN 'Yahoo'
                WHEN referrer LIKE '%facebook%' THEN 'Facebook'
                WHEN referrer LIKE '%twitter%' OR referrer LIKE '%x.com%' THEN 'Twitter/X'
                WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
                WHEN referrer LIKE '%instagram%' THEN 'Instagram'
                ELSE 'Other'
            END, 
            'Direct'
        ) as referrer_source,
        COUNT(*) as view_count,
        CASE 
            WHEN total_views > 0 THEN 
                100.0 * COUNT(*) / total_views
            ELSE 0
        END as percentage
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id
        AND viewed_at BETWEEN actual_start_date AND actual_end_date
    GROUP BY 
        referrer_source
    ORDER BY 
        view_count DESC;
END;
$$;


ALTER FUNCTION "public"."get_referrer_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_resume_engagement_metrics"("p_resume_id" "uuid") RETURNS TABLE("total_views" bigint, "unique_viewers" bigint, "avg_view_duration" numeric, "bounce_rate" numeric, "interaction_rate" numeric, "section_interaction_counts" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    total_views_count BIGINT;
    interacting_views_count BIGINT;
BEGIN
    -- First check if the user owns this resume
    IF NOT EXISTS (
        SELECT 1 
        FROM public.resumes 
        WHERE id = p_resume_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied: User does not own this resume';
    END IF;
    
    -- Get total views and unique viewers
    SELECT 
        COUNT(*), 
        COUNT(DISTINCT session_id) 
    INTO 
        total_views_count, 
        unique_viewers
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id;
    
    -- Get number of views with interactions
    SELECT 
        COUNT(DISTINCT view_id) 
    INTO 
        interacting_views_count
    FROM 
        public.resume_interactions
    WHERE 
        resume_id = p_resume_id;
    
    -- Calculate metrics
    total_views := total_views_count;
    
    -- Average view duration
    SELECT 
        COALESCE(AVG(view_duration), 0) 
    INTO 
        avg_view_duration
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id;
    
    -- Bounce rate (percentage of views with no interactions)
    bounce_rate := CASE 
                      WHEN total_views_count > 0 THEN 
                          100.0 * (total_views_count - interacting_views_count) / total_views_count
                      ELSE 0
                   END;
    
    -- Interaction rate (percentage of views with interactions)
    interaction_rate := CASE 
                           WHEN total_views_count > 0 THEN 
                               100.0 * interacting_views_count / total_views_count
                           ELSE 0
                        END;
    
    -- Section interaction counts as JSON
    SELECT 
        COALESCE(
            jsonb_object_agg(
                section_name, 
                interaction_count
            ),
            '{}'::jsonb
        )
    INTO 
        section_interaction_counts
    FROM 
        public.section_interaction_analysis
    WHERE 
        resume_id = p_resume_id;
    
    RETURN NEXT;
END;
$$;


ALTER FUNCTION "public"."get_resume_engagement_metrics"("p_resume_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_resume_views_by_hour"("p_resume_id" "uuid") RETURNS TABLE("day_of_week" integer, "hour_of_day" integer, "view_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(DOW FROM viewed_at)::INTEGER AS day_of_week,  -- 0 (Sunday) to 6 (Saturday)
        EXTRACT(HOUR FROM viewed_at)::INTEGER AS hour_of_day, -- 0 to 23
        COUNT(*)::INTEGER AS view_count
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id
    GROUP BY 
        day_of_week, hour_of_day
    ORDER BY 
        day_of_week, hour_of_day;
END;
$$;


ALTER FUNCTION "public"."get_resume_views_by_hour"("p_resume_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_resume_views_heatmap"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) RETURNS TABLE("day_of_week" integer, "hour_of_day" integer, "view_count" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(DOW FROM viewed_at)::INTEGER as day_of_week,
        EXTRACT(HOUR FROM viewed_at)::INTEGER as hour_of_day,
        COUNT(*) as view_count
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id
        AND viewed_at BETWEEN p_start_date AND p_end_date
    GROUP BY 
        day_of_week, hour_of_day
    ORDER BY 
        day_of_week, hour_of_day;
END;
$$;


ALTER FUNCTION "public"."get_resume_views_heatmap"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_resume_views_over_time"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" "text") RETURNS TABLE("time_period" timestamp with time zone, "view_count" bigint, "unique_viewers" bigint, "avg_duration" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- First check if the user owns this resume
    IF NOT EXISTS (
        SELECT 1 
        FROM public.resumes 
        WHERE id = p_resume_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied: User does not own this resume';
    END IF;

    RETURN QUERY
    SELECT 
        DATE_TRUNC(p_interval, viewed_at) as time_period,
        COUNT(*) as view_count,
        COUNT(DISTINCT session_id) as unique_viewers,
        COALESCE(AVG(view_duration), 0) as avg_duration
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id
        AND viewed_at BETWEEN p_start_date AND p_end_date
    GROUP BY 
        DATE_TRUNC(p_interval, viewed_at)
    ORDER BY 
        time_period;
END;
$$;


ALTER FUNCTION "public"."get_resume_views_over_time"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_section_popularity"("p_resume_id" "uuid") RETURNS TABLE("section_name" "text", "view_count" bigint, "interaction_count" bigint, "engagement_rate" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    total_views BIGINT;
BEGIN
    -- Get total views
    SELECT 
        COUNT(*) 
    INTO 
        total_views
    FROM 
        public.resume_views
    WHERE 
        resume_id = p_resume_id;
    
    -- Return the section popularity
    RETURN QUERY
    SELECT 
        COALESCE(ri.section_name, 'Unknown') as section_name,
        COUNT(DISTINCT ri.view_id) as view_count,
        COUNT(*) as interaction_count,
        CASE 
            WHEN total_views > 0 THEN 
                100.0 * COUNT(DISTINCT ri.view_id) / total_views
            ELSE 0
        END as engagement_rate
    FROM 
        public.resume_interactions ri
    WHERE 
        ri.resume_id = p_resume_id
        AND ri.section_name IS NOT NULL
    GROUP BY 
        ri.section_name
    ORDER BY 
        interaction_count DESC;
END;
$$;


ALTER FUNCTION "public"."get_section_popularity"("p_resume_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_trending_resumes"("p_user_id" "uuid" DEFAULT NULL::"uuid", "p_limit" integer DEFAULT 10) RETURNS TABLE("resume_id" "uuid", "resume_title" "text", "recent_views" bigint, "previous_views" bigint, "growth_percentage" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    current_date TIMESTAMP WITH TIME ZONE := NOW();
    week_ago TIMESTAMP WITH TIME ZONE := current_date - INTERVAL '7 days';
    two_weeks_ago TIMESTAMP WITH TIME ZONE := current_date - INTERVAL '14 days';
BEGIN
    RETURN QUERY
    WITH recent_views AS (
        SELECT 
            r.id as resume_id,
            r.title as resume_title,
            COUNT(*) as view_count
        FROM 
            public.resume_views rv
            JOIN public.resumes r ON rv.resume_id = r.id
        WHERE 
            rv.viewed_at BETWEEN week_ago AND current_date
            AND (p_user_id IS NULL OR r.user_id = p_user_id)
        GROUP BY 
            r.id, r.title
    ),
    previous_views AS (
        SELECT 
            r.id as resume_id,
            COUNT(*) as view_count
        FROM 
            public.resume_views rv
            JOIN public.resumes r ON rv.resume_id = r.id
        WHERE 
            rv.viewed_at BETWEEN two_weeks_ago AND week_ago
            AND (p_user_id IS NULL OR r.user_id = p_user_id)
        GROUP BY 
            r.id
    )
    SELECT 
        rv.resume_id,
        rv.resume_title,
        rv.view_count as recent_views,
        COALESCE(pv.view_count, 0) as previous_views,
        CASE 
            WHEN COALESCE(pv.view_count, 0) = 0 THEN 
                100.0 -- New views, so 100% growth
            ELSE 
                100.0 * (rv.view_count - COALESCE(pv.view_count, 0)) / COALESCE(pv.view_count, 1)
        END as growth_percentage
    FROM 
        recent_views rv
        LEFT JOIN previous_views pv ON rv.resume_id = pv.resume_id
    ORDER BY 
        growth_percentage DESC, recent_views DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_trending_resumes"("p_user_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_resume_view_count"("resume_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.resumes
  SET view_count = view_count + 1
  WHERE id = resume_id_param;
END;
$$;


ALTER FUNCTION "public"."increment_resume_view_count"("resume_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_resume_view_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update the view_count in the resumes table
    UPDATE public.resumes
    SET view_count = view_count + 1
    WHERE id = NEW.resume_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_resume_view_count"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."resume_views" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "session_id" "text" NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "country" "text",
    "city" "text",
    "region" "text",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "referrer" "text",
    "view_duration" integer DEFAULT 0,
    "viewed_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."resume_views" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."daily_resume_views" WITH ("security_invoker"='true') AS
 SELECT "resume_id",
    "date_trunc"('day'::"text", "viewed_at") AS "view_date",
    "count"(*) AS "view_count",
    "count"(DISTINCT "session_id") AS "unique_views",
    "avg"("view_duration") AS "avg_view_duration"
   FROM "public"."resume_views"
  GROUP BY "resume_id", ("date_trunc"('day'::"text", "viewed_at"))
  ORDER BY "resume_id", ("date_trunc"('day'::"text", "viewed_at"));


ALTER VIEW "public"."daily_resume_views" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."geographic_view_distribution" WITH ("security_invoker"='true') AS
 SELECT "resume_id",
    "country",
    "region",
    "city",
    "count"(*) AS "view_count",
    "count"(DISTINCT "session_id") AS "unique_viewers"
   FROM "public"."resume_views"
  WHERE ("country" IS NOT NULL)
  GROUP BY "resume_id", "country", "region", "city"
  ORDER BY "resume_id", ("count"(*)) DESC;


ALTER VIEW "public"."geographic_view_distribution" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."referrer_analysis" WITH ("security_invoker"='true') AS
 SELECT "resume_id",
    COALESCE(
        CASE
            WHEN (("referrer" IS NULL) OR ("referrer" = ''::"text")) THEN 'Direct'::"text"
            WHEN ("referrer" ~~ '%google%'::"text") THEN 'Google'::"text"
            WHEN ("referrer" ~~ '%bing%'::"text") THEN 'Bing'::"text"
            WHEN ("referrer" ~~ '%yahoo%'::"text") THEN 'Yahoo'::"text"
            WHEN ("referrer" ~~ '%facebook%'::"text") THEN 'Facebook'::"text"
            WHEN (("referrer" ~~ '%twitter%'::"text") OR ("referrer" ~~ '%x.com%'::"text")) THEN 'Twitter/X'::"text"
            WHEN ("referrer" ~~ '%linkedin%'::"text") THEN 'LinkedIn'::"text"
            WHEN ("referrer" ~~ '%instagram%'::"text") THEN 'Instagram'::"text"
            ELSE 'Other'::"text"
        END, 'Direct'::"text") AS "referrer_source",
    "count"(*) AS "view_count",
    "count"(DISTINCT "session_id") AS "unique_viewers"
   FROM "public"."resume_views"
  GROUP BY "resume_id", COALESCE(
        CASE
            WHEN (("referrer" IS NULL) OR ("referrer" = ''::"text")) THEN 'Direct'::"text"
            WHEN ("referrer" ~~ '%google%'::"text") THEN 'Google'::"text"
            WHEN ("referrer" ~~ '%bing%'::"text") THEN 'Bing'::"text"
            WHEN ("referrer" ~~ '%yahoo%'::"text") THEN 'Yahoo'::"text"
            WHEN ("referrer" ~~ '%facebook%'::"text") THEN 'Facebook'::"text"
            WHEN (("referrer" ~~ '%twitter%'::"text") OR ("referrer" ~~ '%x.com%'::"text")) THEN 'Twitter/X'::"text"
            WHEN ("referrer" ~~ '%linkedin%'::"text") THEN 'LinkedIn'::"text"
            WHEN ("referrer" ~~ '%instagram%'::"text") THEN 'Instagram'::"text"
            ELSE 'Other'::"text"
        END, 'Direct'::"text")
  ORDER BY "resume_id", ("count"(*)) DESC;


ALTER VIEW "public"."referrer_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resume_interactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "view_id" "uuid" NOT NULL,
    "interaction_type" "text" NOT NULL,
    "target_value" "text",
    "section_name" "text",
    "clicked_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."resume_interactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resumes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "template_id" "text" NOT NULL,
    "is_public" boolean DEFAULT true,
    "personal_info" "jsonb",
    "experience" "jsonb",
    "education" "jsonb",
    "skills" "jsonb",
    "projects" "jsonb",
    "certifications" "jsonb",
    "languages" "jsonb",
    "custom_sections" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "slug" "text" NOT NULL,
    "theme_id" "text" DEFAULT 'black'::"text" NOT NULL,
    "view_count" integer DEFAULT 0 NOT NULL,
    "user_id" "uuid"
);


ALTER TABLE "public"."resumes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."resume_interactions_summary" WITH ("security_invoker"='true') AS
 SELECT "ri"."resume_id",
    "r"."title" AS "resume_title",
    "r"."user_id",
    "ri"."interaction_type",
    "ri"."section_name",
    "count"("ri"."id") AS "interaction_count",
    "count"(DISTINCT "ri"."view_id") AS "unique_view_interactions"
   FROM ("public"."resume_interactions" "ri"
     JOIN "public"."resumes" "r" ON (("ri"."resume_id" = "r"."id")))
  GROUP BY "ri"."resume_id", "r"."title", "r"."user_id", "ri"."interaction_type", "ri"."section_name";


ALTER VIEW "public"."resume_interactions_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."resume_views_summary" WITH ("security_invoker"='true') AS
 SELECT "rv"."resume_id",
    "r"."title" AS "resume_title",
    "r"."user_id",
    "count"("rv"."id") AS "total_views",
    "count"(DISTINCT "rv"."session_id") AS "unique_views",
    "avg"("rv"."view_duration") AS "avg_view_duration",
    "max"("rv"."viewed_at") AS "last_viewed_at",
    "min"("rv"."viewed_at") AS "first_viewed_at",
    "count"(DISTINCT "rv"."country") AS "countries_count",
    "array_agg"(DISTINCT "rv"."country") FILTER (WHERE ("rv"."country" IS NOT NULL)) AS "countries"
   FROM ("public"."resume_views" "rv"
     JOIN "public"."resumes" "r" ON (("rv"."resume_id" = "r"."id")))
  GROUP BY "rv"."resume_id", "r"."title", "r"."user_id";


ALTER VIEW "public"."resume_views_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."section_interaction_analysis" WITH ("security_invoker"='true') AS
 SELECT "resume_id",
    "section_name",
    "interaction_type",
    "count"(*) AS "interaction_count",
    "count"(DISTINCT "view_id") AS "unique_view_count"
   FROM "public"."resume_interactions" "ri"
  WHERE ("section_name" IS NOT NULL)
  GROUP BY "resume_id", "section_name", "interaction_type"
  ORDER BY "resume_id", ("count"(*)) DESC;


ALTER VIEW "public"."section_interaction_analysis" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."time_based_view_analysis" WITH ("security_invoker"='true') AS
 SELECT "resume_id",
    EXTRACT(hour FROM "viewed_at") AS "hour_of_day",
    "count"(*) AS "view_count"
   FROM "public"."resume_views"
  GROUP BY "resume_id", (EXTRACT(hour FROM "viewed_at"))
  ORDER BY "resume_id", (EXTRACT(hour FROM "viewed_at"));


ALTER VIEW "public"."time_based_view_analysis" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_agent_analysis" WITH ("security_invoker"='true') AS
 SELECT "resume_id",
        CASE
            WHEN (("user_agent" ~~ '%Mobile%'::"text") OR ("user_agent" ~~ '%Android%'::"text") OR ("user_agent" ~~ '%iPhone%'::"text") OR ("user_agent" ~~ '%iPad%'::"text")) THEN 'Mobile'::"text"
            WHEN ("user_agent" ~~ '%Windows%'::"text") THEN 'Windows'::"text"
            WHEN ("user_agent" ~~ '%Mac%'::"text") THEN 'Mac'::"text"
            WHEN ("user_agent" ~~ '%Linux%'::"text") THEN 'Linux'::"text"
            ELSE 'Other'::"text"
        END AS "device_type",
    "count"(*) AS "view_count",
    "count"(DISTINCT "session_id") AS "unique_viewers"
   FROM "public"."resume_views"
  WHERE ("user_agent" IS NOT NULL)
  GROUP BY "resume_id",
        CASE
            WHEN (("user_agent" ~~ '%Mobile%'::"text") OR ("user_agent" ~~ '%Android%'::"text") OR ("user_agent" ~~ '%iPhone%'::"text") OR ("user_agent" ~~ '%iPad%'::"text")) THEN 'Mobile'::"text"
            WHEN ("user_agent" ~~ '%Windows%'::"text") THEN 'Windows'::"text"
            WHEN ("user_agent" ~~ '%Mac%'::"text") THEN 'Mac'::"text"
            WHEN ("user_agent" ~~ '%Linux%'::"text") THEN 'Linux'::"text"
            ELSE 'Other'::"text"
        END
  ORDER BY "resume_id", ("count"(*)) DESC;


ALTER VIEW "public"."user_agent_analysis" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."weekly_view_analysis" WITH ("security_invoker"='true') AS
 SELECT "resume_id",
    EXTRACT(dow FROM "viewed_at") AS "day_of_week",
    "count"(*) AS "view_count"
   FROM "public"."resume_views"
  GROUP BY "resume_id", (EXTRACT(dow FROM "viewed_at"))
  ORDER BY "resume_id", (EXTRACT(dow FROM "viewed_at"));


ALTER VIEW "public"."weekly_view_analysis" OWNER TO "postgres";


ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."resume_interactions"
    ADD CONSTRAINT "resume_interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_views"
    ADD CONSTRAINT "resume_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_slug_unique" UNIQUE ("slug");



CREATE INDEX "resume_interactions_resume_id_idx" ON "public"."resume_interactions" USING "btree" ("resume_id");



CREATE INDEX "resume_interactions_view_id_idx" ON "public"."resume_interactions" USING "btree" ("view_id");



CREATE INDEX "resume_views_resume_id_idx" ON "public"."resume_views" USING "btree" ("resume_id");



CREATE INDEX "resume_views_viewed_at_idx" ON "public"."resume_views" USING "btree" ("viewed_at");



CREATE INDEX "resumes_slug_idx" ON "public"."resumes" USING "btree" ("slug");



CREATE OR REPLACE TRIGGER "after_resume_view_insert" AFTER INSERT ON "public"."resume_views" FOR EACH ROW EXECUTE FUNCTION "public"."update_resume_view_count"();



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."resume_interactions"
    ADD CONSTRAINT "resume_interactions_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_interactions"
    ADD CONSTRAINT "resume_interactions_view_id_fkey" FOREIGN KEY ("view_id") REFERENCES "public"."resume_views"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_views"
    ADD CONSTRAINT "resume_views_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Allow service role to insert resume interactions" ON "public"."resume_interactions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow service role to insert resume views" ON "public"."resume_views" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow service role to update resume views" ON "public"."resume_views" FOR UPDATE USING (true);



CREATE POLICY "Allow users to view their own resume analytics" ON "public"."resume_views" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resumes"
  WHERE (("resumes"."id" = "resume_views"."resume_id") AND ("resumes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow users to view their own resume interactions" ON "public"."resume_interactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resumes"
  WHERE (("resumes"."id" = "resume_interactions"."resume_id") AND ("resumes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "delete resume" ON "public"."resumes" FOR DELETE TO "authenticated", "anon" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "insert resume" ON "public"."resumes" FOR INSERT TO "authenticated", "anon" WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read resume" ON "public"."resumes" FOR SELECT TO "authenticated", "anon" USING ((("auth"."uid"() = "user_id") OR ("is_public" = true)));



ALTER TABLE "public"."resume_interactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "resume_interactions_insert_policy" ON "public"."resume_interactions" FOR INSERT WITH CHECK (("resume_id" IN ( SELECT "resumes"."id"
   FROM "public"."resumes"
  WHERE ("resumes"."user_id" = "auth"."uid"()))));



CREATE POLICY "resume_interactions_public_insert" ON "public"."resume_interactions" FOR INSERT WITH CHECK (true);



CREATE POLICY "resume_interactions_select_policy" ON "public"."resume_interactions" FOR SELECT USING (("resume_id" IN ( SELECT "resumes"."id"
   FROM "public"."resumes"
  WHERE ("resumes"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."resume_views" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "resume_views_insert_policy" ON "public"."resume_views" FOR INSERT WITH CHECK (("resume_id" IN ( SELECT "resumes"."id"
   FROM "public"."resumes"
  WHERE ("resumes"."user_id" = "auth"."uid"()))));



CREATE POLICY "resume_views_public_insert" ON "public"."resume_views" FOR INSERT WITH CHECK (true);



CREATE POLICY "resume_views_select_policy" ON "public"."resume_views" FOR SELECT USING (("resume_id" IN ( SELECT "resumes"."id"
   FROM "public"."resumes"
  WHERE ("resumes"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."resumes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update resume" ON "public"."resumes" FOR UPDATE TO "authenticated", "anon" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."check_table_exists"("table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_table_exists"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_table_exists"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."compare_resume_metrics"("p_resume_id" "uuid", "p_period_1_start" timestamp with time zone, "p_period_1_end" timestamp with time zone, "p_period_2_start" timestamp with time zone, "p_period_2_end" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."compare_resume_metrics"("p_resume_id" "uuid", "p_period_1_start" timestamp with time zone, "p_period_1_end" timestamp with time zone, "p_period_2_start" timestamp with time zone, "p_period_2_end" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."compare_resume_metrics"("p_resume_id" "uuid", "p_period_1_start" timestamp with time zone, "p_period_1_end" timestamp with time zone, "p_period_2_start" timestamp with time zone, "p_period_2_end" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_resume_interactions_table"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_resume_interactions_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_resume_interactions_table"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_resume_views_table"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_resume_views_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_resume_views_table"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_unique_slug"("base_title" "text", "user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"("base_title" "text", "user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"("base_title" "text", "user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_device_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_device_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_device_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_geographic_view_distribution"("p_resume_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_geographic_view_distribution"("p_resume_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_geographic_view_distribution"("p_resume_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_referrer_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_referrer_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_referrer_analytics"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_resume_engagement_metrics"("p_resume_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_resume_engagement_metrics"("p_resume_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_resume_engagement_metrics"("p_resume_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_resume_views_by_hour"("p_resume_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_resume_views_by_hour"("p_resume_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_resume_views_by_hour"("p_resume_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_resume_views_heatmap"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_resume_views_heatmap"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_resume_views_heatmap"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_resume_views_over_time"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_resume_views_over_time"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_resume_views_over_time"("p_resume_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_section_popularity"("p_resume_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_section_popularity"("p_resume_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_section_popularity"("p_resume_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trending_resumes"("p_user_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_trending_resumes"("p_user_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trending_resumes"("p_user_id" "uuid", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_resume_view_count"("resume_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_resume_view_count"("resume_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_resume_view_count"("resume_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_resume_view_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_resume_view_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_resume_view_count"() TO "service_role";


















GRANT ALL ON TABLE "public"."resume_views" TO "anon";
GRANT ALL ON TABLE "public"."resume_views" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_views" TO "service_role";



GRANT ALL ON TABLE "public"."daily_resume_views" TO "anon";
GRANT ALL ON TABLE "public"."daily_resume_views" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_resume_views" TO "service_role";



GRANT ALL ON TABLE "public"."geographic_view_distribution" TO "anon";
GRANT ALL ON TABLE "public"."geographic_view_distribution" TO "authenticated";
GRANT ALL ON TABLE "public"."geographic_view_distribution" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."referrer_analysis" TO "anon";
GRANT ALL ON TABLE "public"."referrer_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."referrer_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."resume_interactions" TO "anon";
GRANT ALL ON TABLE "public"."resume_interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_interactions" TO "service_role";



GRANT ALL ON TABLE "public"."resumes" TO "anon";
GRANT ALL ON TABLE "public"."resumes" TO "authenticated";
GRANT ALL ON TABLE "public"."resumes" TO "service_role";



GRANT ALL ON TABLE "public"."resume_interactions_summary" TO "anon";
GRANT ALL ON TABLE "public"."resume_interactions_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_interactions_summary" TO "service_role";



GRANT ALL ON TABLE "public"."resume_views_summary" TO "anon";
GRANT ALL ON TABLE "public"."resume_views_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_views_summary" TO "service_role";



GRANT ALL ON TABLE "public"."section_interaction_analysis" TO "anon";
GRANT ALL ON TABLE "public"."section_interaction_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."section_interaction_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."time_based_view_analysis" TO "anon";
GRANT ALL ON TABLE "public"."time_based_view_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."time_based_view_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."user_agent_analysis" TO "anon";
GRANT ALL ON TABLE "public"."user_agent_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."user_agent_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."weekly_view_analysis" TO "anon";
GRANT ALL ON TABLE "public"."weekly_view_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."weekly_view_analysis" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
