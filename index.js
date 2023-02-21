const morgan = require('morgan');
const express = require('express');
const app = express();




let topMovies = [
  {
    title: 'Jurassic World',
    director: 'Colin Trevorrow'
  },
  {
    title: 'Birdman',
    director: 'Alejandro González Iñárritu'
  },
  {
    title: 'Song Of The Sea',
    director: 'Tomm Moore'
  },
  {
    title: 'Inherent Vice',
    director: 'Paul Thomas Anderson'
  },
  {
    title: 'Brooklyn',
    director: 'John Crowley'
  },
  {
    title: 'Macbeth',
    director: 'Joel Coen'
  },
  {
    title: 'Avengers: Age Of Ultron',
    director: 'Joss Whedon'
  },
  {
    title: 'White God',
    director: 'Kornél Mundruczó'
  },
  {
    title: 'Mission: Impossible - Rogue Nation',
    director: 'Christopher McQuarrie'
  },
  {
    title: 'Me And Earl And The Dying Girl',
    director: 'Alfonso Gomez-Rejon'
  },
];

// Using third-party middleware (Morgan).
app.use (morgan('common'));

// Used express.static function to serve public folder.
app.use(express.static('public'));

// created code that can handle unanticipated errors.
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movies club!');
});



app.get('/movies', (req, res) => {
  res.json(topMovies);
});


// listen for requests
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});