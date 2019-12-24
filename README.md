

- [KRE (Konstellataion Runtime Engine)](#kre-konstellataion-runtime-engine)
- [Archiecture](#archiecture)
  - [Engine](#engine)
  - [Runtime](#runtime)
    - [KRT](#krt)
- [Install](#install)
- [Development](#development)
  - [Deploy local](#deploy-local)

# KRE (Konstellataion Runtime Engine)

Konstellation Runtime Engine is an application that allow to run AI/ML models for inference based on the content of a
 `.krt` file. 

|  Component  |                                                                                                  Coverage                                                                                                  |
| :---------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  Admin UI   |    [![coverage report](https://gitlab.com/konstellation/konstellation-ce/kre/badges/master/coverage.svg?job=test-admin-ui)](https://gitlab.com/konstellation/konstellation-ce/kre/tree/master/admin-ui)    |
|  Admin API  |   [![coverage report](https://gitlab.com/konstellation/konstellation-ce/kre/badges/master/coverage.svg?job=test-admin-api)](https://gitlab.com/konstellation/konstellation-ce/kre/tree/master/admin-api)   |
| K8s Manager | [![coverage report](https://gitlab.com/konstellation/konstellation-ce/kre/badges/master/coverage.svg?job=test-k8s-manager)](https://gitlab.com/konstellation/konstellation-ce/kre/tree/master/m8s-manager) |
| Runtime API | [![coverage report](https://gitlab.com/konstellation/konstellation-ce/kre/badges/master/coverage.svg?job=test-runtime-api)](https://gitlab.com/konstellation/konstellation-ce/kre/tree/master/runtime-api) |
|  Operator   |    [![coverage report](https://gitlab.com/konstellation/konstellation-ce/kre/badges/master/coverage.svg?job=test-operator)](https://gitlab.com/konstellation/konstellation-ce/kre/tree/master/operator)    |

# Archiecture

KRE is designed based on a microservice pattern to be run on top of a Kubernetes cluster.

In the following diagram is described the main components and the relationship each other.

![Architecture](docs/images/kre-architecture.jpg)


Below are described the main concepts of KRE.

## Engine

When you install KRE in your Kubernetes cluster a Namespace called `kre` is created and within this are deployed some 
components. These components are responsible to create new runtimes and expose all the required information to the 
Admin UI.

The Engine is composed by the following components:

* [Admin UI](./admin-ui/README.md)
* [Admin API](./admin-api/README.md)
* [K8s Manager](./k8s-manager/README.md)
* MongoDB

## Runtime

When you create what is called a `runtime`, the Engine create a new Namespace within the Kubernetes cluster with the 
name setted by the user from the Admin UI, and deploy on this Namespace all the base components that are described 
below.

The goal of a Runtimme is to run the designed services within the `.krt` file to perform the inference of a AI/ML model.

Each Runtime is composed by the following components:

* [Operator](operator/README.md)
* [Runtime API](runtime-api/README.md)
* MongoDB
* Minio
* NATS-Streaming

### KRT

Konstellation Runtime Transport is a compressed file with the definition of a runtime version, included the code to 
run and a YAML file called `kre.yaml` with the desired workflows deffinitions.

The base structure of a `kre.yaml` is as follow:

```yaml
version: 1.0.3
entrypoint: 
 - image: golang
   name: input
   entrypoint: src/ioapi

config:
  variables:
    - API_KEY
    - API_SECRET
  files:
    - HTTPS_CERT

nodes:
 - name: model_input_etl
   image: konstellation/kre-python3
 
 - name: model
   image: konstellation/kre-pytorch2

 - name: output
   image: konstellation/kre-python3

 - name: client_metrics
   image: konstellation/kre-python3

workflows:
  - name: make_prediction
    waterfall:
      - model_input_etl
      - model
      - output
  - name: save_client_metrics
    sequencial:
      - client_metrics
```

# Install

KRE can be installed only on top of a Kubernetes cluster, and is packetized as a Helm Chart. In order to install it 
just need to download the desired Chart version, define your custom `values.yaml` and run the following command.

```bash
helm repo add konstellation-ce https://charts.konstellation.io
helm upgrade --install --namespace kre --values ./custom-values.yaml kre-v1.0.0
```

# Development 

## Deploy local

Deploy KRE with Helm in Minikube environment

```
    ./deploy_local.sh
```
