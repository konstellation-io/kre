package gql

const GraphQLSchema = `
type Query {
  me: User
  runtimes: [Runtime]!
  dashboard: Dashboard!
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

type Dashboard {
  runtimes: [Runtime]
  alerts: [Alert]
}

type Alert {
  id: ID!
  type: String!
  message: String!
  runtime: Runtime!
}
`
