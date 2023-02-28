// Load express module by using require function and call function app.
const express = require('express');
      morgan = require('morgan');
      app = express();
      bodyParser = require('body-parser');
      uuid = require('uuid');




// We need to enable parsing json object. This is adding a piece of middleware.
app.use (bodyParser.json());
//app.use(express.static('public'));


//Define an array of users and movies with couple of properties. 
let users = [
  {
    "id": "1.1",
    "name": "Kim",
    "favoriteMovie": []
  },
  {
    "id": "1.2",
    "name": "Sarah",
    "favoriteMovie": ["Black Panther: Wakanda Forever"],
  }
];



let movies = [
  {
    "title":"Jurassic World",
    "description":"American science fiction action film",
    "release":"2015",
    "genre":{
      "name":"science fiction",
      "description":"genre description"
    },

    "director":{
      "name":"Colin Trevorrow",
      "bio":"placeholder",
      "birth":"1976"

    },
    
      "imageURL":"https://www.amazon.com/Jurassic-World/s?k=Jurassic+World",
      "feature":false
  },
  {
    "title":"Gladiator",
    "description":"Gladiator is a 2000 epic historical drama film directed by Ridley Scott and written by David Franzoni, John Logan, and William Nicholson.",
    "release":"2000",
    "genre":{
      "name":"historic drama",
      "description":"placeholder"
    },

    "director":{
      "name":"	Ridley Scott",
      "bio":"placeholder",
      "birth":"1937"

    },
    
      "imageURL":"https://www.amazon.com/Gladiator-Russell-Crowe/dp/B00470TOV0",
      "feature":false
  },
  {
    "title":"Black Panther: Wakanda Forever",
    "description":"Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.",
    "release":"2022",
    "genre":{
      "name":"action",
      "description":"genre description"
    },

    "director":{
      "name":"Ryan Coogler",
      "bio":"placeholder",
      "birth":"1986"

    },
    
      "imageURL":"https://www.amazon.com/Black-Panther-Wakanda-Forever-Feature/dp/B0BRYB43MG",
      "feature":false
  },
 
  ]
//Handling Http get request to get list of all movies.
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

//Handling Http get request to get specific  movie by title.
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.title === title );
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie')
  }
});
//Handling Http get request to get specific movie by genre.
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.genre.name === genreName ).genre;
  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such a movie!')
  }
})

//Handling Http get request to get specific movie by director.
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.director.name === directorName ).director;
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director!')
  }
})
// Handling HTTP Post Requests to allow new users to register.
app.post('/users', (req, res) => {
  const newUser = req.body;
  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need name');
  }
})
// Handling HTTP put  Requests to allow users to update their info.
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updateUser = req.body;
  let user = users.find( user => user.id == id );
  if (user) {
    user.name = updateUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user')
  }
})

// Handling HTTP Post Requests allowing users to  add movie to their list of favorit.

app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find( user => user.id == id );
  if (user) {
    user.favoriteMovie.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('No such movie')
  }
})
// Handling HTTP delete  Requests to remove a movies from their favorite.
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovie = user.favoriteMovie.filter( title => title !== movieTitle )
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('No such user')
  }
})
// Handling HTTP delete  Requests allowing users to de-register.
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  let user = users.find( user => user.id == id );
  if (user) {
    users = users.filter( user => user.id != id )
    res.status(200).send(` user ${id} has been successfully deleted `);
  } else {
    res.status(400).send('No such user')
  }
})


// created code that can handle unanticipated errors.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
}); 


// listen for requests
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});