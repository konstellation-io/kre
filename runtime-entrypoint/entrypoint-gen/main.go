package main

import (
	"flag"
	"fmt"
	"log"
	"os"
)

func main() {
	inputFile := flag.String("input", "", "input proto file to generate python entrypoint.")
	outputFile := flag.String("output", "", "path where the file will be saved.")

	flag.Parse()

	in, err := os.Open(*inputFile)
	defer in.Close()

	if err != nil {
		log.Fatalf("error opening input file: %s", err)
	}

	out, err := os.Create(*outputFile)
	defer out.Close()

	if err != nil {
		log.Fatalf("error creating output file: %s", err)
	}

	err = generateEntrypoint(in, out)
	if err != nil {
		log.Fatalf("error generating file: %s", err)
	}

	fmt.Println("Done")
}
