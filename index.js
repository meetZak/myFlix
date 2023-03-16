// Load required modules and call function app.
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const uuid = require("uuid");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//Integrating Mongoose with RESTAPI cfDB is the name od Database with movies and users
mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importing auth.js and requiring Passport Module into the project.
let auth = require ('./auth') (app);
const passport = require ('passport');
require ('./passport');

app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));

  // default text response when at/
  app.get('/', (req, res) => {
    res.send('Welcome to MyFlix Movie App!');
  });

//Handling  get request to get list of all movies with Mongoose.
  app.get('/movies',passport.authenticate ('jwt',{session:false}), (req, res) => {
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
  app.get('/movies/:title', passport.authenticate('jwt',{session:false}),(req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.status(201).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
//Handling  get request to get specific movie by genre with Mongoose.
  app.get('/movies/genre/:Name',passport.authenticate('jwt', { session: false }), (req, res) => {
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
  app.get('/movies/director/:directorName',passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => {
        res.status(201).json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// Handling Get request for all users with Mongoose.
app.get('/users',passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.get('/users/:Username',passport.authenticate('jwt', { session: false }), (req, res) => {
Users.findOne({ Username: req.params.Username })
  .then((users) => {
    res.status(201).json(users);
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


    // Update a user's info, by username
    app.put('/users/:Username',passport.authenticate('jwt', { session: false }), (req, res) => {
     Users.findOneAndUpdate({ Username: req.params.Username }, req.body, { new: true })
    .then(updatedUser => {
    res.status(200).json(updatedUser);
    })
    .catch(error => {
    res.status(500).json({ error: error.message });
    });
    }
    );
     

/* POST: allow users to add a movie to their favourites with MONGOOSE  */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),(req, res) => {
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
app.delete('/users/:Username',passport.authenticate('jwt', { session: false }), (req, res) => {
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

// Access documentation.html using express.static.
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
  });

 // created code that can handle unanticipated errors.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
}); 
 

// listen on port.
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});