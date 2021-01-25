package main

import (
	"fmt"
	"log"

	"github.com/konstellation-io/kre/libs/krt-utils/pkg/validator"
)

func main() {
	// Create a validator instance
	v := validator.New()

	// If you have the filename, use ParseFile
	krtFile, err := v.ParseFile("./krt.yaml")
	if err != nil {
		log.Fatal(err)
	}

	// Check valid format
	errs := v.Validate(krtFile)
	if errs != nil {
		//log.Fatal(errs)

		// (optional) you can also loop through all validation errors
		for _, e := range errs.(validator.ValidationErrors) {
			fmt.Println(e.Error())
		}
	}

	fmt.Printf("%#v\n", krtFile)

	// Check valid content
	errs = v.ValidateContent(krtFile, "./")
	if errs != nil {
		// log.Fatal(err)

		// (optional) you can also loop through all validation errors
		for _, e := range errs.(validator.ValidationErrors) {
			fmt.Println(e.Error())
		}
	}
}
