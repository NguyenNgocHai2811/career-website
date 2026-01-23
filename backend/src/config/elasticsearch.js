const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const username = process.env.ELASTICSEARCH_USERNAME;
const password = process.env.ELASTICSEARCH_PASSWORD;

const clientOptions = {
  node,
};

if (username && password) {
  clientOptions.auth = {
    username,
    password
  };
}

const client = new Client(clientOptions);

const verifyConnection = async () => {
  try {
    const health = await client.cluster.health();
    console.log('Successfully connected to Elasticsearch', health.status);
  } catch (error) {
    console.error('Elasticsearch connection error:', error);
  }
};

module.exports = {
  client,
  verifyConnection
};
