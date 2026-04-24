/* =========================
   🧹 DROP EXISTING POLICIES
   ========================= */

-- MOVIE
DROP POLICY IF EXISTS "Public read access to movies" ON public.movie;
DROP POLICY IF EXISTS "Authenticated users can insert movies" ON public.movie;
DROP POLICY IF EXISTS "Authenticated users can update movies" ON public.movie;
DROP POLICY IF EXISTS "Authenticated users can delete movies" ON public.movie;

-- TYPE
DROP POLICY IF EXISTS "Public read access to type" ON public.type;
DROP POLICY IF EXISTS "Authenticated users can modify type" ON public.type;

-- USERPROFILE
DROP POLICY IF EXISTS "Users can read their own profile" ON public.userprofile;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.userprofile;



/* =========================
   🔐 ENABLE RLS
   ========================= */

ALTER TABLE public.movie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.userprofile ENABLE ROW LEVEL SECURITY;



/* =========================
   🎬 MOVIE POLICIES
   ========================= */

-- Public can read movies
CREATE POLICY "Public read access to movies"
ON public.movie
FOR SELECT
TO public
USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert movies"
ON public.movie
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update movies"
ON public.movie
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete movies"
ON public.movie
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);



/* =========================
   🏷️ TYPE POLICIES
   ========================= */

-- Public can read type table
CREATE POLICY "Public read access to type"
ON public.type
FOR SELECT
TO public
USING (true);

-- Only authenticated users can modify type
CREATE POLICY "Authenticated users can modify type"
ON public.type
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);



/* =========================
   👤 USERPROFILE POLICIES
   ========================= */

-- Users can read their own profile
CREATE POLICY "Users can read their own profile"
ON public.userprofile
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.userprofile
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());