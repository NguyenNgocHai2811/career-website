const express = require('express');
const { verifyConnection: verifyNeo4j } = require('./config/neo4j');
require('dotenv').config();
console.log('hello')

const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/auth.routes');
const app = express();

// Middleware parse JSON body
app.use(express.json());


// Mount API routes
app.use('/v1/auth', authRoutes);

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
