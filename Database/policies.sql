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

/*userprofiles*/
create policy "Enable select for  anon"
on "public"."userprofile"
as PERMISSIVE
for select
to anon
using (true);

create policy "Enable delete for  anon"
on "public"."userprofile"
as PERMISSIVE
for DELETE
to anon
using (true);

create policy "Enable update for  anon"
on "public"."userprofile"
as PERMISSIVE
for UPDATE
to anon
using (true);

alter table public.userprofile enable row level security;

create policy "allow insert for  anon"
on public.userprofile
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