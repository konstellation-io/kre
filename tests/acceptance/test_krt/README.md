# KRT-TEMPLATE

## Generate KRT

```
./scripts/build_krt.sh
```

This will generate the KRT file inside the `build` folder.

## Generate Protobuf code

```
./scripts/gen_protobuf.sh
```

This will generate the protobuf code inside the node folders.

## Call to entrypoint

This code is useful to test the krt in your local environment only.
Call to `local_test.sh <runtime-name>` to call a gRPC endpoint. 

Example: Given you have a Runtime named "test":

```sh
./local_test.sh test
```
