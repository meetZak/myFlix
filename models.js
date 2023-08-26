const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// defines movieSchema format to be used in mongoDB 
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birthyear: Date,
        Deathyear: Date
    },
    Release: Date,
    ImagePath: String,
    Featured: Boolean 
});

// defines userSchema format to be used in mongoDB
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * converts user password into hashed format using bcrypt.js
 * @function hashPassword
 * @param {string} password as input by user
 * @returns {string} hashed @password of user input
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

/**
 * validates user password by comparing it with the stored hashed password
 * @function validatePassword
 * @param {string} password to be validated
 * @returns {string} validated @password
 */
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};
  
// creates models based on defined Schemas
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// export defined modules so they can be used
module.exports.Movie = Movie;
module.exports.User = User;
