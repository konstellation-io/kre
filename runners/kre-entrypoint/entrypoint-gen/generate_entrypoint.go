package main

import (
	"io"
	"text/template"

	"github.com/emicklei/proto"
)

type Service struct {
	Name    string
	Methods []Method
}

type Method struct {
	Name        string
	RequestType string
	ReturnsType string
}

func generateEntrypoint(input io.Reader, out io.Writer) error {
	parser := proto.NewParser(input)
	definition, err := parser.Parse()
	if err != nil {
		panic(err)
	}

	var data Service

	proto.Walk(definition,
		proto.WithService(func(s *proto.Service) {
			// NOTE: Currently only support a single Entrypoint service
			if s.Name != "Entrypoint" {
				return
			}

			var serviceMethods []Method
			for _, e := range s.Elements {
				m := e.(*proto.RPC)
				serviceMethods = append(serviceMethods, Method{
					Name:        m.Name,
					RequestType: m.RequestType,
					ReturnsType: m.ReturnsType,
				})
			}

			data = Service{
				s.Name,
				serviceMethods,
			}
		}),
	)

	t := template.Must(template.ParseFiles("entrypoint.py.tmpl"))
	err = t.Execute(out, data)
	if err != nil {
		return err
	}

	return nil
}
