// Importing  Mongoose package into models.js file.
const mongoose = require('mongoose');


// Defining Schema for the movies collection
let moviesSchema = mongoose.Schema ({
    Title: { type:String, required:true},
    Description:{ type: String , required: true},
    Genre:{
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

// Defining Schema for the users collection.
let userSchema = mongoose.Schema ({
    Username: { type: String, required:true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref:'Movie'}]

});

//Creating models using the schemas.
let Movie = mongoose.model ('Movie',moviesSchema);
let User = mongoose.model ('User',userSchema);

// Exporting the models in order to import in Index.js file.
module.exports.Movie = Movie;
module.exports.User = User;