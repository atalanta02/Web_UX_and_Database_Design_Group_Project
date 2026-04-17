/* Drop tables.  */
DROP table if exists UserProfile;
DROP table if exists Movie;
DROP table if exists Type;

/* Create tables.  */
Create table UserProfile(
  id integer primary key,
  name varchar(100),
  email varchar(100)
);

Create table Type(
  id integer primary key,
  category varchar(100) CHECK (CATEGORY in('Movie', 'TV Show'))
);

Create table Movie(
  id integer primary key,
  title varchar(100),
  type_id integer,
  description TEXT,
  image_url varchar(255),
  foreign key (type_id)references type(id) ON DELETE CASCADE
);

/* insert into tables.  */
Insert into UserProfile  values
    (1, 'James Korgan', 'James@example.com'),
    (2, 'Peter Louis ', 'Peter@example.com');

Insert into Type values(1, 'Movie');
Insert into Type values(2, 'TV Show');

Insert into Movie values
    (1,'Something Bad Is Going To Happen',2,'A certain atmosphere of horror is felt the week before the celebration of an unfortunate wedding.','https://images.justwatch.com/poster/341255798/s718/something-very-bad-is-going-to-happen.jpg'),
    (2,'Scream 7',1,'When a new Ghostface killer emerges in the town where Sidney Prescott
          has built a new life, her darkest fears are realized as her daughter
          becomes the next target.','https://cdn.theplaylist.net/wp-content/uploads/2026/02/07165601/Scream-7.jpg');



