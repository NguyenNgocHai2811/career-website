const express = require('express');
const cors = require('cors');
const { verifyConnection: verifyNeo4j } = require('./config/neo4j');
const routes = require('./routes');
require('dotenv').config();


const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/v1', routes);

const startServer = async () => {
  try {
    // Verify Database Connections
    await verifyNeo4j();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
