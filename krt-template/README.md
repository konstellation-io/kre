# KRT-TEMPLATE

## Generate KRT

```
./scripts/build_krt.sh <VERSION_NAME>
```

This will generate the KRT file inside the `build` folder.

## Call to entrypoint

Call to `run_test.sh <RUNTIME_NAME> <VERSION_NAME> <WORKFLOW> <NUM_MSGS> <GREETING_NAME>` to call a gRPC endpoint.

Example: Given you have a Runtime named "test" and you upload a krt for version "greeter-v1", run this command:

```sh
./scripts/run_test.sh my-runtime greeter-v1 PyGreet
./scripts/run_test.sh my-runtime greeter-v1 GoGreet
./scripts/run_test.sh my-runtime greeter-v1 GoGreet 2
./scripts/run_test.sh my-runtime greeter-v1 GoGreet 2 Gustavo
```

## Protobuf

If you want to change the `public_input.proto` file, remember to generate the protobuf code:

```
./scripts/generate_protobuf_code.sh
```
