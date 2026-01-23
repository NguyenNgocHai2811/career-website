const app = require('./app');
const { verifyConnection: verifyNeo4j } = require('./config/neo4j');
const { verifyConnection: verifyElastic } = require('./config/elasticsearch');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Verify Database Connections
    await verifyNeo4j();
    await verifyElastic();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
