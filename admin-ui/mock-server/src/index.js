const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const mocks = require('./mock');

const server = new ApolloServer({
  typeDefs,
  mocks,
});
const app = express();

app.use(bodyParser.json(), cors());

app.post('/api/v1/auth/signin', (req, res) => {
  if (!req.body.email) {
    return res.status(400)
      .send({"code": "bad_email", "message": "Invalid email"});
  }
  
  res.json({"message": "Email sent to the user"});
});

app.post('/api/v1/auth/validate-otp', (req, res) => {
  if (!req.body.otp) {
    return res.status(400)
      .send({"code": "bad_otp_token", "message": "Invalid OTP token"});
  }
  
  res.set('set-cookie', 'LOCAL_JWT_TOKEN');
  res.json({"message": "Login success"});
});

server.applyMiddleware({ app, path: '/graphql' });
  const appServer = app.listen(4000, () => {
  const address = appServer.address();
  console.log(`🚀 Server ready at ${address.address}${address.port}`);
})
