package gql

const GraphQLSchema = `
type Query {
  me: User
}

type Mutation {
   createRuntime(name: String!): RuntimeUpdateResponse!
}

type User {
  id: ID!
  email: String!
  disabled: Boolean
}

type Runtime {
 id: ID!
 name: String!
 status: String!
 creationDate: String!
 versions(status: String!): [Version]
}

type Version {
 id: ID!
 versionNumber: String!
 description: String
 status: String!
 creationDate: String!
 creatorName: String!
 activationDate: String!
 activatorName: String!
}

type RuntimeUpdateResponse {
 success: Boolean!
 message: String
 runtime: Runtime!
}
`
