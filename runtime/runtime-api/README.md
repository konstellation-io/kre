# KST Runtime-API


## Requirements

- [Mockery](https://github.com/vektra/mockery)

## Test Mocks

Mocks used on tests are generated with Mockery, when you need a new mock, create it with this command:

```sh
$> mockery -all
```

## Development

Before running the first time this code you need to install this specific kubernetes client go version:
```
    go get k8s.io/client-go@kubernetes-1.15.4
    go run .
```
