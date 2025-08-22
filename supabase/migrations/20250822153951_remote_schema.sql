drop extension if exists "pg_net";

drop policy "delete resume" on "public"."resumes";

drop policy "insert resume" on "public"."resumes";

drop policy "read resume" on "public"."resumes";

drop policy "update resume" on "public"."resumes";


  create policy "delete resume"
  on "public"."resumes"
  as permissive
  for delete
  to anon, authenticated
using ((auth.uid() = user_id));



  create policy "insert resume"
  on "public"."resumes"
  as permissive
  for insert
  to anon, authenticated
with check ((auth.uid() = user_id));



  create policy "read resume"
  on "public"."resumes"
  as permissive
  for select
  to anon, authenticated
using (((auth.uid() = user_id) OR (is_public = true)));



  create policy "update resume"
  on "public"."resumes"
  as permissive
  for update
  to anon, authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



