var crypto = require('crypto');

module.exports = function(password) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
};
