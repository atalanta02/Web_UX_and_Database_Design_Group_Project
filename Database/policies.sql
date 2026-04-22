/*movies*/
create policy "Enable select for  anon"
on "public"."movie"
as PERMISSIVE
for select
to anon
using (true);



create policy "Enable delete for  anon"
on "public"."movie"
as PERMISSIVE
for DELETE
to anon
using (true);

create policy "Enable update for  anon"
on "public"."movie"
as PERMISSIVE
for UPDATE
to anon
using (true);

alter table public.movie enable row level security;

create policy "allow insert for  anon"
on public.movie
as PERMISSIVE
for insert
to anon
with check (true);



/*types*/
create policy "Enable select for  anon"
on "public"."type"
as PERMISSIVE
for select
to anon
using (true);

create policy "Enable delete for  anon"
on "public"."type"
as PERMISSIVE
for DELETE
to anon
using (true);

create policy "Enable update for  anon"
on "public"."type"
as PERMISSIVE
for UPDATE
to anon
using (true);

alter table public.type enable row level security;

create policy "allow insert for  anon"
on public.type
as PERMISSIVE
for insert
to anon
with check (true);


/*authorization*/
-- USERPROFILE
ALTER TABLE public.userprofile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access to everyone"
ON public.userprofile
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);


-- MOVIE
ALTER TABLE public.movie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access to everyone"
ON public.movie
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);


-- TYPE
ALTER TABLE public.type ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access to everyone"
ON public.type
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);