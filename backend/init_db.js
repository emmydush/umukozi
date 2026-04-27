const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'umukozi.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
    
    // Read and execute the SQL file
    const fs = require('fs');
    const sql = fs.readFileSync('create_sqlite_tables.sql', 'utf8');
    
    db.exec(sql, (err) => {
      if (err) {
        console.error('Error creating tables:', err);
      } else {
        console.log('Database tables created successfully');
      }
    });
  }
});

db.close();
