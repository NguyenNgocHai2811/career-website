const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;


const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const verifyConnection = async () => {
  try {
    await driver.verifyConnectivity();
    console.log('Successfully connected to Neo4j');
  } catch (error) {
    console.error('Neo4j connection error:', error);
  }
};

module.exports = {
  driver,
  verifyConnection
};
