const fs = require('fs');
const path = require('path');
const { gql } = require('apollo-server');

const schema = fs.readFileSync(
  path.join(__dirname, '../../../admin-api/schema.graphql'),
  'utf8'
);

// "scalar Upload" is needed by gqlgen to generate code in the admin-api.
// But the apollo mock server crashes: Error: There can be only one type named "Upload".
// So we remove it before starting the server.
const typeDefs = gql(schema.replace('scalar Upload', ''));
module.exports = { typeDefs, fullSchema: gql(schema) };
