const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const { typeDefs, fullSchema } = require('./schema');
const { makeExecutableSchema } = require('apollo-server');
const mocks = require('./mock');

const app = express();

app.use(
  bodyParser.json(),
  cors({ origin: 'http://dev-admin.kre.local:3000', credentials: true })
);

// # This endpoint is used to test unauthorized response
// app.post('/graphql', (req, res) => {
//   return res.status(401)
//     .send({"code": "unauthorized", "message": "Unauthorized user"});
// });

app.post('/api/v1/auth/signin', (req, res) => {
  if (!req.body.email) {
    return res
      .status(400)
      .send({ code: 'bad_email', message: 'Invalid email' });
  }

  res.json({ message: 'Email sent to the user' });
});

app.post('/api/v1/auth/signin/verify', (req, res) => {
  if (!req.body.verificationCode) {
    return res.status(400).send({
      code: 'invalid_verification_code',
      message: 'The verification code is invalid.'
    });
  }

  res.cookie('LOCAL_JWT_TOKEN', 'LOCAL_JWT_TOKEN_VALUE');
  res.json({ message: 'Login success' });
});

const server = new ApolloServer({ typeDefs, mocks });

const schema = makeExecutableSchema({
  typeDefs: fullSchema,
  resolvers: { Subscription: mocks.Subscription() }
});

server.applyMiddleware({ app, path: '/graphql', cors: false });
server.installSubscriptionHandlers(app);

const appServer = app.listen(4000, () => {
  const address = appServer.address();
  console.log(`🚀 Server ready at ${address.address}${address.port}`);
});

new SubscriptionServer(
  { schema, execute, subscribe },
  { server: appServer, path: '/graphql' }
);
