const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
let db = null;

const dbPath = path.join(__dirname, "moviesData.db");

const startDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server Started");
    });
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
    process.exit(1);
  }
};
startDbAndServer();
// get all movies from movie table, path /movies/
app.get("/movies/", async (request, response) => {
  const movieQuery = `SELECT * FROM movie ORDER BY movie_id;`;
  const movieObj = await db.all(movieQuery);
  response.send(movieObj);
});

//post movie in movie table,path /movies/
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    values(
        ${directorId},
        '${movieName}',
        '${leadActor}'    
    )
    ;`;
  await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//get one movie by id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const oneMovieQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId};`;
  const dbResponse = await db.get(oneMovieQuery);
  response.send(dbResponse);
});
//put update a movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const queryToUpdate = `
    UPDATE movie 
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE
    movie_id=${movieId};
    `;
  await db.run(queryToUpdate);
  response.send("Movie Details Updated");
});
//delete a movie from db
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE  FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
// get directors details, path /directors/
app.get("/directors/", async (request, response) => {
  const directorDetails = `
    SELECT * FROM director ;`;
  const directors_array = await db.all(directorDetails);
  response.send(directors_array);
});
//get movies of a director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMoviesQuery = `
    SELECT movie_name FROM movie
    where director_id=${directorId};
    `;
  const directorMovies = await db.all(directorMoviesQuery);
  response.send(directorMovies);
});
module.exports = app;
