// Load required modules and call function app.
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require('mongoose');
const Models = require('./models.js');
const uuid = require("uuid");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const fileUpload = require('express-fileupload')



const Movies = Models.Movie;
const Users = Models.User;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importing the express-validator library into file.
const { check, validationResult } = require ('express-validator');

// import a handful of classes from the AWS SDK: the S3 client, as well as commands to list and put objects.
const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3')

// Passing the region , endpoint URL and set another parameter
const s3Client = new S3Client({
  region: 'us-east-1',
  forcePathStyle: true
})


//instantiating objects from the classes for individual commands.
const listObjectsParams = {
  Bucket: 'ec2tos3bucket'
}

listObjectsCmd = new ListObjectsV2Command(listObjectsParams)


//creating an endpoint in Express that’s a passthrough to list the objects in a bucket
app.get('/images', (req, res) => {

  s3Client.send(new ListObjectsV2Command(listObjectsParams))
      .then((listObjectsResponse) => {
          res.send(listObjectsResponse)
  })
})

//POST request sent to /images
app.post('/images', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.images;
  const fileName = file.name;
  const tempPath = `${UPLOAD_TEMP_PATH}/${fileName}`;
  file.mv(tempPath, (err) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
      }

      // File successfully uploaded
      res.status(200).send('File uploaded!');
  });
});




// Importing auth.js and requiring Passport Module into the project.
const cors = require('cors');
app.use(cors());
  let allowedOrigins = ['http://localhost:8080','https://zaflix.herokuapp.com/','http://localhost:1234','https://myflixmovie-app.netlify.app/login','http://myflix-client.s3-website-us-east-1.amazonaws.com/login','http://myflix-client.s3-website-us-east-1.amazonaws.com/signup'];
 app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
       let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
       return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
 }));  
let auth = require('./auth')(app);
const passport = require ('passport');
const { S3 } = require("aws-sdk");
const { error } = require("console");
require ('./passport');

//Integrating Mongoose with RESTAPI cfDB is the name od Database with movies and users
/*   mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });*/
mongoose.connect( 'mongodb+srv://abuyahya:abuyusra@ourflixdb.aocjkw6.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
 
app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));



// default text response when at/
app.get('/', (req, res) => {
res.send('Welcome to MyFlix Movie App!');
});

//Handling  get request to get list of all movies with Mongoose.
app.get('/movies',passport.authenticate('jwt',{session:false}),(req, res) => {
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
app.get('/users',passport.authenticate('jwt',{session:false}), (req, res) => {
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
app.post('/users',
[
check('Username', 'Username is required').isLength({min: 5}),
check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

// check the validation object for errors
let errors = validationResult(req);

if (!errors.isEmpty()) {
return res.status(422).json({ errors: errors.array() });
}

let hashedPassword = Users.hashPassword(req.body.Password);
Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
.then((user) => {
  if (user) {
    //If the user is found, send a response that it already exists
    return res.status(400).send(req.body.Username + ' already exists');
  } else {
    Users
      .create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) => { res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
})
.catch((error) => {
  console.error(error);
  res.status(500).send('Error: ' + error);
});
});

// Adds a new movie to the database by filling out required information

app.post('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
  const movie = await Movies.findOne({Title: req.body.Title})
  if (movie) {
    return res.status(400).send(req.body.Title + 'already exists');
  } else {
    const newMovie = await Movies.create({
      Title: req.body.Title,
      Description: req.body.Description,
      Genre: {
        Name: req.body.Genre.Name,
        Description: req.body.Genre.Description
      },
      Director: {
        Name: req.body.Director.Name,
        Bio: req.body.Director.Bio,
        Birthyear: req.body.Director.Birthyear,
        Deathyear: req.body.Director.Deathyear
      },
      ImagePath: req.body.ImagePath,
      Featured: req.body.Featured,
      Release: req.body.Release
    })
      res.status(201).json(newMovie)
  }
} catch (error) {
  console.error(error);
  res.status(500).send('Error' + error);
}
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

// Access documentation.html using express.static.
app.get('/documentation', (req, res) => {                  
res.sendFile('public/documentation.html', { root: __dirname });
});

// created code that can handle unanticipated errors.cb
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something broke!');
}); 


// listen on port.
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
console.log('Listening on Port ' + port);
});

// app.listen(port, () => {
//   console.log(`Server is listening at http://localhost:${4566}`);
// });