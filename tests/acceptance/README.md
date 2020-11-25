# KRE Acceptance Tests

## Frameworks and libraries

- [godog](https://github.com/cucumber/godog) as Cucumber test runner.
- [golangci-lint](https://golangci-lint.run/) as linters runner.

## Run integration tests

If you want to run the acceptance tests locally execute:

```sh
export INTEGRATION_TESTS_API_URL=http://api.kre.local
export INTEGRATION_TESTS_API_TOKEN=***
go test ./...
```

## Linters

`golangci-lint` is a fast Go linters runner. It runs linters in parallel, uses caching, supports yaml config, has
integrations with all major IDE and has dozens of linters included.

As you can see in the `.golangci.yml` config file of this repo, we enable more linters than the default and 
have more strict settings.

To run `golangci-lint` execute: 
```
golangci-lint run
```
