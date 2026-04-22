-- == CLEAN RESET ==
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile;

DROP TABLE IF EXISTS movie;
DROP TABLE IF EXISTS type;
DROP TABLE IF EXISTS userprofile;


-- == USER PROFILE TABLE ==
CREATE TABLE userprofile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- == TYPE TABLE (Movie / TV Show) ==
CREATE TABLE type (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL
    CHECK (category IN ('Movie', 'TV Show'))
);


-- == MOVIE TABLE ==
CREATE TABLE movie (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  type_id INTEGER NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  FOREIGN KEY (type_id)
    REFERENCES type(id)
    ON DELETE CASCADE
);


-- == INSERT DEFAULT DATA ==
INSERT INTO type (category) VALUES
  ('Movie'),
  ('TV Show');

INSERT INTO movie (title, type_id, description, image_url) VALUES
  ('Something Bad Is Going To Happen', 2,
   'A certain atmosphere of horror is felt before a wedding.',
   'https://images.justwatch.com/poster/341255798/s718/something-very-bad-is-going-to-happen.jpg'),

  ('Scream 7', 1,
   'A new Ghostface killer targets Sidney Prescott’s daughter.',
   'https://cdn.theplaylist.net/wp-content/uploads/2026/02/07165601/Scream-7.jpg');


-- == AUTO CREATE PROFILE (FIXED TRIGGER) ==
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.userprofile (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();