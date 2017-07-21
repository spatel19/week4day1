var mongoose = require('mongoose');

// Create all of your models/schemas here, as properties.
var userSchema = mongoose.Schema({
  username: String,
  password: String
});

module.exports = {
  User: mongoose.model('User', userSchema)
};
