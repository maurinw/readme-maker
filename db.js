const Datastore    = require('nedb');
const path         = require('path');

// Ensure you create a directory named "data" in your root folder.
const usersDB      = new Datastore({ filename: path.join(__dirname, 'data/users.db'), autoload: true });
const readmesDB    = new Datastore({ filename: path.join(__dirname, 'data/readmes.db'), autoload: true });

module.exports = {
  usersDB,
  readmesDB,
};
