# KRT-TEMPLATE

## Generate KRT

```
$ pipenv shell
$ ./generate_krt.sh
```

This will generate the KRT file inside the `build` folder.

## Test entrypoint

```
$ pipenv shell
$ KRT_NATS_SUBJECTS_FILE=test/test_nats_subjects.json KRT_NATS_SERVER=localhost:4222 python greeter/src/entrypoint/entrypoint.py
```

## Call to entrypoint

Open a portforward to the deployed entrypoint inside a KRE version.

```
$ grpcurl -plaintext -d '{"name": "John"}' localhost:9000 entrypoint.Entrypoint/Greet
```
