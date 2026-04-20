DROP TABLE IF EXISTS movie;
DROP TABLE IF EXISTS type;
DROP TABLE IF EXISTS userprofile;

CREATE TABLE userprofile (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  e_password VARCHAR(100) NOT NULL,
  CHECK (length(e_password) >= 8),
  CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE type (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL
    CHECK (category IN ('Movie', 'TV Show'))
);

CREATE TABLE movie (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  type_id INTEGER NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  FOREIGN KEY (type_id) REFERENCES type(id) ON DELETE CASCADE
);

/* Insert data */
INSERT INTO userprofile (email, e_password) VALUES
  ('James@example.com', 'RWEWdhjgwd'),
  ('Peter@example.com', 'WQWuwehgd');

  
INSERT INTO type (category) VALUES
  ('Movie'),
  ('TV Show');

INSERT INTO movie (title, type_id, description, image_url) VALUES
  ('Something Bad Is Going To Happen', 2,
   'A certain atmosphere of horror is felt the week before the celebration of an unfortunate wedding.',
   'https://images.justwatch.com/poster/341255798/s718/something-very-bad-is-going-to-happen.jpg'),
  ('Scream 7', 1,
   'When a new Ghostface killer emerges in the town where Sidney Prescott has built a new life, her darkest fears are realized as her daughter becomes the next target.',
   'https://cdn.theplaylist.net/wp-content/uploads/2026/02/07165601/Scream-7.jpg');


