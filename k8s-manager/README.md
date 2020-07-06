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

- **ResourceMetricsService**: Once a runtime and a version are running with this service we return to the Admin API the resource metrics stored in Prometheus. Expose the following functions.
    - GetVersion: return an array of metrics of CPU and Memory with a timestamp.
    - WatchVersion: create a gRPC stream to return realtime metrics to the Admin API in order to update graphs in the front.


### Kubernetes

This server uses the official kubernetes sdk `client-go` to interact with the cluster. 

We create these resources:

- **Namespace**: Each `Runtime` is deployed in its own namespace with a matching name.

- **RBAC**: The Kubernetes objects `Role`, `ServiceAccount` and `RoleBinding` to allow the K8s Runtime Operator to create the required objects within the namespace.

- **KRE Runtime Operator**: This is the Kubernetes operator that extend the Custom Resource Definition to create the Runtime resource.

- **Runtime**: This custom resource is the base infrastructure needed to later run a `RuntimeVersion` created with a `.krt` file.

### Prometheus

Create a manager to handle all the required queries to Prometheus to print the graphs in the front.

Before launch the service you need to open a port-forward to Prometheus service and update the `config.yaml` with the Prometheus URL pointing to `localhost:9090`. To open the port-forward run the below command.

```bash
kubectl -n kre port-forward svc/prometheus-prometheus-oper-prometheus 9090:9090
```
Once the service have started this service in your local environment there are a script to perform gRPC calls that trigger the Prometheus queries (`./scripts/metrics-grpc-call.sh`). The script output should show something like below.

```bash
$ ./scripts/metrics-grpc-call.sh
{
  "versionResourceMetrics": [
    {
      "date": "2020-06-11 15:56:48 +0200 CEST",
      "cpu": 0.00024974045489303945,
      "mem": 56677.52937041498
    },
    {
      "date": "2020-06-11 16:01:48 +0200 CEST",
      "cpu": 0.0003369122322523001
    },
[...]
```
