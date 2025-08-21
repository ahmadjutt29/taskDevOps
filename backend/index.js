const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MY_NAME = process.env.MY_NAME || 'Default Name';

// DB connection config from environment
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'namesdb';

let db;

// Initialize database connection and table
async function initDB() {
  db = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  });

  // Create table if it doesn't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS names (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database connected and table ready');
}

// Root route
app.get('/', (_req, res) => {
  res.send('Backend is running. Try GET /api/hello');
});

app.get('/api/hello', async (req, res) => {
  const queryName = req.query.name;
  const finalName = queryName && queryName.trim() ? queryName : MY_NAME;

  try {
    await db.execute('INSERT INTO names (name) VALUES (?)', [finalName]);
    res.json({ name: finalName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/names', async (_req, res) => {
  try {
    const [rows] = await db.execute('SELECT name FROM names ORDER BY id ASC');
    const storedNames = rows.map(row => row.name);
    res.json({ storedNames });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT} with name: ${MY_NAME}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize DB', err);
    process.exit(1);
  });
