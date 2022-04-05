# KST Runtime Admin-API

## Architecture

The constraints in the Clean Architecture are :

- **Independent of Frameworks**: The architecture does not depend on the existence of some library of feature laden
  software. This allows you to use such frameworks as tools, rather than having to cram your system into their limited
  constraints.
- **Testable**: The business rules can be tested without the UI, Database, Web Server, or any other external element.
- **Independent of UI**: The UI can change easily, without changing the rest of the system. A Web UI could be replaced
  with a console UI, for example, without changing the business rules.
- **Independent of Database**: You can swap out Oracle or SQL Server, for Mongo, BigTable, CouchDB, or something else .
  Your business rules are not bound to the database.
- **Independent of any external agency**: In fact your business rules simply don’t know anything at all about the
  outside world.

More at https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html

## Project structure

The application is organized using the following packages:

1. **domain**: This package contains all the core business code. It does not depend on anything else than the Golang
   core and contains sub-packages:

  - **entity**: They are the building blocks of the domain and encapsulate the business concepts. Entities are not
    coupled with any ORM framework. Indeed the domain model can be quite different from the database model!
  - **usecase**: They contain application specific business rules and orchestrate the flow of data to and from the
    entities and implement higher level business rules. It is important to understand that the domain model should not
    leak outside of this module. In order to do that, use cases should not take entities are arguments for their
    methods, but a list of raw arguments.
  - **repository**: In the domain module, repositories are only interfaces that are used by the use cases to access data
    without any knowledge of the concrete implementations: data can be retrieved from databases, files or external Web
    APIs, it should not affect the core business logic at all. To reinforce this, repositories take entities as
    arguments and return entities as well. It is the responsibility of the concrete implementation to handle conversion
    if needed.

2. **adapter**: This package contains the implementation details for all domain interfaces like the database and ORM
   configurations and the repositories implementations. Repositories implementation are responsible for converting "
   database objects" in domain objects.

3. **delivery**: Everything related to serving content via HTTP or CLI should be here.
  - **http**: The http package contains all the web controllers. It is responsible for handling HTTP requests,
    converting JSON payloads to objects, invoking use cases and delivering responses.

## Frameworks and libraries

- [echo](https://echo.labstack.com/) a web framework.
- [gomock](https://github.com/golang/mock) a mock library.

Mocks used on tests are generated with **mockgen**, when you need a new mock, add the following:

```go
//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/${GOFILE} -package=mocks
```

To generate the mocks execute:

```sh
$ go generate ./...
```

- [gqlgen](https://github.com/99designs/gqlgen) as library for building GraphQL servers

**Important** If the GraphQL schema (`./schema.graphql`) changes, use the following command to regenerate the code:

```sh
$ go generate ./...
```

- [dataloaden](https://github.com/vektah/dataloaden) to reduce the number of queries being sent to the database:

In order to generate the dataloaders, we execute the following command:

```sh
$ ./scripts/generate_dataloaders.sh
```

If you want to create a new one, remember adding it to the previous script.

