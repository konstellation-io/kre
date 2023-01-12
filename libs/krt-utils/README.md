[![Tests][tests-badge]][tests-link]
[![Go Report Card][report-badge]][report-link]
[![License][license-badge]][license-link]

# KRT Utils

This repo contains tools to create and validate KRT files.

## Frameworks and libraries

- [golangci-lint](https://golangci-lint.run/) as linters runner.

## Usage

- KRT Validator

```go
func main() {
  // Create a validator instance
  v := validator.New()

  // If you have the filename, use ParseFile
  krtFile, err := v.ParseFile("/path/to/krt.yaml")
  if err != nil {
    log.Fatal(err)
  }

  // Check valid format
  errs := v.Validate(krtFile)
  if errs != nil {
    log.Fatal(errs)
  }

  // Check all content is valid
  errs := v.ValidateContent(krtFile, "/home/test/krt")
  if errs != nil {
    log.Fatal(errs)
  }
}
```

- KRT builder
```go
package main

func main() {
  b := builder.New()

  err := builder.Build()
  if err != nil {
    log.Fatal(err)
  }

}
```

## Run tests

```sh
go test ./...
```

## Linters

`golangci-lint` is a fast Go linters runner. It runs linters in parallel, uses caching, supports yaml config, has
integrations with all major IDE and has dozens of linters included.

As you can see in the `.golangci.yml` config file of this repo, we enable more linters than the default and have more
strict settings.

To run `golangci-lint` execute:

```
golangci-lint run
```

<!-- JUST BADGES & LINKS -->

[tests-badge]: https://img.shields.io/github/workflow/status/konstellation-io/kre/libs/krt-utils/Test
[tests-link]: https://github.com/konstellation-io/kre/libs/krt-utils/actions?query=workflow%3ATest

[report-badge]: https://goreportcard.com/badge/github.com/konstellation-io/kre/libs/krt-utils
[report-link]: https://goreportcard.com/report/github.com/konstellation-io/kre/libs/krt-utils

[license-badge]: https://img.shields.io/github/license/konstellation-io/kre/libs/krt-utils
[license-link]: https://github.com/konstellation-io/kre/libs/krt-utils/blob/main/LICENSE
