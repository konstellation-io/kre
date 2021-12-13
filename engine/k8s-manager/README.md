# K8s manager 

- [K8s manager](#k8s-manager)
    - [Description](#description)
    - [gRPC](#grpc)
    - [Kubernetes](#kubernetes)
    - [Prometheus](#prometheus)


### Description 

This service is part of the Engine, exposes a gRPC service to encapsulate all Kubernetes related features and Prometheus 
queries to get metrics and alerts. The only service that is going to call this gRPC is the Admin API service when need 
to create new Kubernetes resources.

### gRPC

The Protobuf file and the code generated are within `proto` folder. 

To generate the code from the `.proto` file run the following command.

```bash
./scripts/generate_proto.sh
```

We expose the following services in the gRPC server:

- **RuntimeService**: This service manage the runtime lifecycle and expose two functions:
    - Create: to create a new runtime
    - RuntimeStatus: to get the status of a runtime, in order to return to the front when is ready.

- **VersionService**: Is intended to control the versions lifecycle with the following functions.
    - Start
    - Stop
    - Publish
    - Unpublish
    - UpdateConfig

### Kubernetes

This server uses the official kubernetes sdk `client-go` to interact with the cluster. 

We create these resources:

- **Namespace**: Each `Runtime` is deployed in its own namespace with a matching name.

- **RBAC**: The Kubernetes objects `Role`, `ServiceAccount` and `RoleBinding` to allow the K8s Runtime Operator to create the required objects within the namespace.

- **K8s Runtime Operator**: This is the Kubernetes operator that extend the Custom Resource Definition to create the Runtime resource.

- **Runtime**: This custom resource is the base infrastructure needed to later run a `RuntimeVersion` created with a `.krt` file.
