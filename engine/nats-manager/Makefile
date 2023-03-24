.PHONY: test integration-test proto

test:
	go test ./...

integration-test:
	go test ./... -tags=integration

proto:
	./scripts/generate_proto.sh
