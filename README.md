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

|  Component  | Coverage  |  Bugs  |  Lines of Code  |  Maintainability Rating  |
| :---------: | :-----:   |  :---: |  :-----------:  |  :--------------------:  |
|  Admin UI  | ![coverage][admin-ui-coverage] | ![bugs][admin-ui-bugs] | ![loc][admin-ui-loc] | ![mr][admin-ui-mr] |
|  Admin API  | ![coverage][admin-api-coverage] | ![bugs][admin-api-bugs] | ![loc][admin-api-loc] | ![mr][admin-api-mr] |
| K8s Manager |  |  |  |  |
|  Runtime API  | ![coverage][runtime-api-coverage] | ![bugs][runtime-api-bugs] | ![loc][runtime-api-loc] | ![mr][runtime-api-mr] |
|  Operator   |  |  |  |  |

[admin-ui-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_ui&metric=coverage 
[admin-ui-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_ui&metric=bugs
[admin-ui-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_ui&metric=ncloc
[admin-ui-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_ui&metric=sqale_rating

[admin-api-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_api&metric=coverage 
[admin-api-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_api&metric=bugs
[admin-api-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_api&metric=ncloc
[admin-api-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_api&metric=sqale_rating

[runtime-api-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_runtime_api&metric=coverage 
[runtime-api-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_runtime_api&metric=bugs
[runtime-api-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_runtime_api&metric=ncloc
[runtime-api-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_runtime_api&metric=sqale_rating

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
version: mettel-tnba-v1
description: This is the new version that solves some problems.
entrypoint: 
 - proto: public_input.proto
   image: konstellation/kre-python37
   src: src/entrypoint.py

config:
  variables:
    - API_KEY
    - API_SECRET
  files:
    - HTTPS_CERT

nodes:
 - name: ETL
   image: konstellation/kre-python37
   src: src/etl/model_input_etl.py
 
 - name: Execute DL Model
   image: konstellation/kre-pytorch2
   src: src/execute_model/model.py

 - name: Create Output
   image: konstellation/kre-python37
   src: src/output/output.py

 - name: Client Metrics
   image: konstellation/kre-python37
   src: src/client_metrics/client_metrics.py

workflows:
  - name: New prediction
    entrypoint: MakePrediction
    sequential:
      - ETL
      - Execute DL Model
      - Create Output
  - name: Save Client Metrics
    entrypoint: SaveClientMetric
    sequential:
      - Client Metrics

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
