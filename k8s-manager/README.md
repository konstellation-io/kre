# K8s manager 

- [K8s manager](#k8s-manager)
    - [Description](#description)
    - [gRPC](#grpc)
    - [Kubernetes](#kubernetes)


### Description 

This service is part of the Engine, exposes a gRPC service to encapsulate all Kubernetes related features. The only service that is going to call this gRPC is the Admin API service when need to create new Kubernetes resources.

### gRPC

The Protobuf file and the code generated are within `runtimepb` folder. 

To generate the code from the `.proto` file run the following command.

```bash
./scripts/generate_proto.sh
```

We expose the following services in the gRPC server:

- **NewRuntime**: This function wait for the required values to create a runtime in the cluster on each call.

### Kubernetes

This server uses the official kubernetes sdk `client-go` to interact with the cluster. 

We create these resources:

- **Namespace**: Each `Runtime` is deployed in its own namespace with a matching name.

- **RBAC**: The Kubernetes objects `Role`, `ServiceAccount` and `RoleBinding` to allow the Operator to create the required objects within the namespace.

- **KRE Operator**: This is the Kubernetes operator that extend the Custom Resource Definition to create the Runtime resource.

- **Runtime**: This custom resource is the base infrastructure needed to later run a `RuntimeVersion` created with a `.krt` file.
