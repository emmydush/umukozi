const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database connection
const db = new sqlite3.Database(path.join(__dirname, '..', 'umukozi.db'), (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('🔌 Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Wrap query method to return promises
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows });
      }
    });
  });
};

// Wrap run method for INSERT/UPDATE/DELETE operations
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ 
          id: this.lastID, 
          changes: this.changes 
        });
      }
    });
  });
};

module.exports = {
  query,
  run,
  db
};
