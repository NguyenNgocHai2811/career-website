const express = require('express');
const { verifyConnection: verifyNeo4j } = require('./config/neo4j');
require('dotenv').config();
console.log('hello')

const PORT = process.env.PORT || 3000;
const app = express();


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
