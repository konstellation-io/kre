// +build tools

// This will allow go modules to see the dependency.
// You can invoke it from anywhere within your module now using go run github.com/vektah/dataloaden and always get the pinned version.
package main

import _ "github.com/vektah/dataloaden"
