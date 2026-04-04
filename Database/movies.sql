/* Drop tables.  */
DROP table if exists UserProfile;
DROP table if exists Role;
DROP table if exists Actor;
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
  category varchar(100)
);

Create table Actor(
  id integer primary key,
  name varchar(100)  
);

Create table Movie(
  id integer primary key,
  title varchar(100),
  type_id integer,
  foreign key (type_id)references type(id)
);

Create table Role(
  id integer primary key,
  movie_id integer,
  actor_id integer,
  character varchar(100),
  foreign key (movie_id)references movie(id),
  foreign key (actor_id)references actor(id)
);

/* insert into tables.  */
Insert into UserProfile  values
    (1, 'James Korgan', 'James@example.com'),
    (2, 'Peter Louis ', 'Peter@example.com');

Insert into Type values(1, 'Movie');
Insert into Type values(2, 'TV Show');

Insert into Actor values
    (1,'Camila Morrone'),
    (2,'Mckenna Grace');

Insert into Movie values
    (1,'Something Bad Is Going To Happen',2),
    (2,'Scream 7',1);

Insert into Role values
    (1,1,1,'Rachel'),
    (2,2,2,'Hannah Thurman');

