// Load required modules and call function app.
  const express = require('express');
        bodyParser = require('body-parser');
        uuid = require('uuid');
  
  const app = express();
  const morgan = require('morgan');
        fs = require('fs');
  const path = require ('path');

// Integrating Mongoose to allow REST API to perform CRUD.
  const mongoose = require('mongoose');
  const Models = require ('./models.js');
 

// Creation of variables to call databases.
  const Movies = Models.Movie;
  const Users = Models.User;
  const Genres = Models.Genre;
  const Directors = Models.Director;    

// Method allowing Mongoose to connect to that database so it can perform CRUD operations .
  mongoose.connect ('mongodb://localhost:27017/cfDB',
 {useNewUrlParser:true,useUnifiedTopology:true});


// We need to enable parsing json object. This is adding a piece of middleware.
  app.use (bodyParser.json());
  app.use(bodyParser.urlencoded({ extended:true}));
  app.use(express.static('public'));


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

  // default text response when at/
  app.get('/', (req, res) => {
    res.send('Welcome to MyFlix Movie App!');
  });

// Handling Get request for all users with Mongoose.
  app.get('/users', (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  // Handling Get request for a specific user by username with Mongoose.

app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//Handling  get request to get list of all movies with Mongoose.
  app.get('/movies', (req, res) => {
    Movies.find()
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//Handling Http get request to get specific  movie by title with Mongoose.
  app.get('/movies/:title', (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
//Handling  get request to get specific movie by genre with Mongoose.
  app.get('/movies/genre/:genreName', (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
      .then((movie) => {
        res.status(201).json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
 
//Handling  get request to get specific movie by director with Mongoose.
  app.get('/movies/director/:directorName', (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => {
        res.status(201).json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//  Post Requests to allow new users to register with Mongoose.
    app.post('/users', (req, res) => {
      const newUser = req.body;
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
    });


/* PUT: UPDATE user info by username using MONGOOSE */
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    },
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    } else {
      res.json(updatedUser);
    }
  });
});


/* POST: allow users to add a movie to their favourites with MONGOOSE  */
app.post('/users/:Username/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


// Delete a user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

 // created code that can handle unanticipated errors.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
}); 
 

// listen for requests
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});