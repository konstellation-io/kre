- [KRE (Konstellation Runtime Engine)](#kre-konstellation-runtime-engine)
  - [Engine](#engine)
  - [Runtime](#runtime)
  - [Runners](#runners)
- [Architecture](#architecture)
  - [Engine](#engine-1)
  - [Runtime](#runtime-1)
    - [KRT](#krt)
- [Install](#install)
  - [Custom Installation](#custom-installation)
    - [Prometheus](#prometheus)
- [Development](#development)
  - [Requirements](#requirements)
  - [Local Environment](#local-environment)
    - [Login](#login)

# KRE (Konstellation Runtime Engine)

Konstellation Runtime Engine is an application that allow to run AI/ML models for inference based on the content of a
 `.krt` file. 

 ## Engine

|  Component  | Coverage  |  Bugs  |  Maintainability Rating  |
| :---------: | :-----:   |  :---: |  :--------------------:  |
|  Admin UI  | [![coverage][admin-ui-coverage]][admin-ui-coverage-link] | [![bugs][admin-ui-bugs]][admin-ui-bugs-link] | [![mr][admin-ui-mr]][admin-ui-mr-link] |
|  Admin API  | [![coverage][admin-api-coverage]][admin-api-coverage-link] | [![bugs][admin-api-bugs]][admin-api-bugs-link] | [![mr][admin-api-mr]][admin-api-mr-link] |
|  K8s Manager | [![coverage][k8s-manager-coverage]][k8s-manager-coverage-link] | [![bugs][k8s-manager-bugs]][k8s-manager-bugs-link] | [![mr][k8s-manager-mr]][k8s-manager-mr-link] |

## Runtime

|  Component  | Coverage  |  Bugs  |  Maintainability Rating  |
| :---------: | :-----:   |  :---: |  :--------------------:  |
|  Runtime API  | [![coverage][runtime-api-coverage]][runtime-api-coverage-link] | [![bugs][runtime-api-bugs]][runtime-api-bugs-link] | [![mr][runtime-api-mr]][runtime-api-mr-link] |
|  K8s Runtime Operator   | - | - | - |
|  Mongo Writer  | [![coverage][mongo-writer-coverage]][mongo-writer-coverage-link] | [![bugs][mongo-writer-bugs]][mongo-writer-bugs-link] | [![mr][mongo-writer-mr]][mongo-writer-mr-link] |

## Runners 

|  Component  | Coverage  |  Bugs  |  Maintainability Rating  |
| :---------: | :-----:   |  :---: |  :--------------------:  |
|  KRE Entrypoint  | [![coverage][kre-entrypoint-coverage]][kre-entrypoint-coverage-link] | [![bugs][kre-entrypoint-bugs]][kre-entrypoint-bugs-link] | [![mr][kre-entrypoint-mr]][kre-entrypoint-mr-link] |
|  KRE Go  | [![coverage][kre-go-coverage]][kre-go-coverage-link] | [![bugs][kre-go-bugs]][kre-go-bugs-link] | [![mr][kre-go-mr]][kre-go-mr-link] |
|  KRE Py  | [![coverage][kre-py-coverage]][kre-py-coverage-link] | [![bugs][kre-py-bugs]][kre-py-bugs-link] | [![mr][kre-py-mr]][kre-py-mr-link] |

# Architecture

KRE is designed based on a microservice pattern to be run on top of a Kubernetes cluster.

In the following diagram is described the main components and the relationship each other.

![Architecture](.github/images/kre-architecture.jpg)


Below are described the main concepts of KRE.

## Engine

When you install KRE in your Kubernetes cluster a Namespace called `kre` is created and within this are deployed some 
components. These components are responsible to create new runtimes and expose all the required information to the 
Admin UI.

The Engine is composed by the following components:

* [Admin UI](./admin/admin-ui/README.md)
* [Admin API](./admin/admin-api/README.md)
* [K8s Manager](./admin/k8s-manager/README.md)
* MongoDB

## Runtime

When you create what is called a `runtime`, the Engine create a new Namespace within the Kubernetes cluster with the 
name set by the user from the Admin UI, and deploy on this Namespace all the base components that are described
below.

The goal of a Runtime is to run the designed services within the `.krt` file to perform the inference of a AI/ML model.

Each Runtime is composed by the following components:

* [K8s Runtime Operator](runtime/k8s-runtime-operator/README.md)
* [Runtime API](runtime/runtime-api/README.md)
* MongoDB
* Minio
* NATS-Streaming

### KRT

Konstellation Runtime Transport is a compressed file with the definition of a runtime version, included the code to 
run and a YAML file called `kre.yaml` with the desired workflows definitions.

The base structure of a `kre.yaml` is as follow:

```yaml
version: mettel-tnba-v1
description: This is the new version that solves some problems.
entrypoint: 
  proto: public_input.proto
  image: konstellation/kre-runtime-entrypoint:latest

config:
  variables:
    - API_KEY
    - API_SECRET
  files:
    - HTTPS_CERT

nodes:
 - name: ETL
   image: konstellation/kre-py:latest
   src: src/etl/execute_etl.py
 
 - name: Execute DL Model
   image: konstellation/kre-py:latest
   src: src/execute_model/execute_model.py

 - name: Create Output
   image: konstellation/kre-py:latest
   src: src/output/output.py

 - name: Client Metrics
   image: konstellation/kre-py:latest
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

## Custom Installation
KRE allows a custom configuration to use parts that already exist in your infrastructure.

### Prometheus

- Prometheus will be installed by default if you prefer use your own prometheus, use this helm parameter:

|       Param                | Value |
| -------------------------- | ----- |
| prometheusOperator.enabled | false |

# Development 


## Requirements

In order to start development on this project you will need these tools: 

- **gettext**: OS package to fill templates during deployment
- **minikube**: the local version of Kubernetes to deploy KRE
- **helm**: K8s package manager. Make sure you have v3+

*NOTE*: If you still have Helm v2 update variable `$HELM_VERSION` in file `.krectl.conf`. 


## Local Environment

This repo contains a tool called `./krectl.sh` to handle common actions you need during development.

All the configuration needed to run  KRE locally can be found in `.krectl.conf` file. Usually you'd be ok with the default values.
Check Minikube parameters if you need to tweak the resources assigned to it.

Run help to get info for each command:

```
$> krectl.sh [command] --help

// Outputs:

  krectl.sh -- a tool to manage KRE environment during development.

  syntax: krectl.sh <command> [options]

    commands:
      dev     creates a complete local environment and auto-login to frontend.
      start   starts minikube kre profile.
      stop    stops minikube kre profile.
      login   creates a login URL and open your browser automatically on the admin page.
      build   calls docker to build all images inside minikube.
      deploy  calls helm to create install/upgrade a kre release on minikube.
      delete  calls kubectl to remove runtimes or versions.

    global options:
      h     prints this help.
      v     verbose mode.
```

### Login

First of all remember to edit your `/etc/hosts`, see `./krectl.sh dev` output for more details.

NOTE: If you have [hostctl](https://github.com/guumaster/hostctl) installed, updating `/etc/hosts` will be done automatically too.

In order to access the admin app, the login process can be done automatically using this script:

```
$ ./krectl.sh login [--new]
```

You will see an output like this:

```
⏳ Calling Admin API...

 Login done. Open your browser at:

 🌎 http://admin.kre.local/signin/c7d024eb-ce35-4328-961a-7d2b79ee8988

✔️  Done.
```

[admin-ui-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_ui&metric=coverage 
[admin-ui-coverage-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_admin_ui&metric=Coverage 
[admin-ui-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_ui&metric=bugs
[admin-ui-bugs-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_admin_ui&metric=Reliability
[admin-ui-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_ui&metric=ncloc
[admin-ui-loc-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_admin_ui&metric=Coverage
[admin-ui-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_ui&metric=sqale_rating
[admin-ui-mr-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_admin_ui&metric=Maintainability

[admin-api-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_api&metric=coverage 
[admin-api-coverage-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_admin_api&metric=Coverage 
[admin-api-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_api&metric=bugs
[admin-api-bugs-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_admin_api&metric=Security
[admin-api-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_api&metric=ncloc
[admin-api-loc-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_admin_api&metric=Coverage
[admin-api-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_admin_api&metric=sqale_rating
[admin-api-mr-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_admin_api

[k8s-manager-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_k8s_manager&metric=coverage 
[k8s-manager-coverage-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_k8s_manager 
[k8s-manager-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_k8s_manager&metric=bugs
[k8s-manager-bugs-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_k8s_manager
[k8s-manager-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_k8s_manager&metric=ncloc
[k8s-manager-loc-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_k8s_manager
[k8s-manager-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_k8s_manager&metric=sqale_rating
[k8s-manager-mr-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_k8s_manager

[runtime-api-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_runtime_api&metric=coverage 
[runtime-api-coverage-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_runtime_api&metric=Coverage 
[runtime-api-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_runtime_api&metric=bugs
[runtime-api-bugs-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_runtime_api&metric=Security&view=list
[runtime-api-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_runtime_api&metric=ncloc
[runtime-api-loc-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_runtime_api&metric=Coverage&view=list
[runtime-api-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_runtime_api&metric=sqale_rating
[runtime-api-mr-link]: https://sonarcloud.io/component_measures?id=konstellation_kre_runtime_api&metric=alert_status&view=list

[mongo-writer-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_mongo_writer&metric=coverage
[mongo-writer-coverage-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_mongo_writer 
[mongo-writer-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_mongo_writer&metric=bugs
[mongo-writer-bugs-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_mongo_writer
[mongo-writer-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_mongo_writer&metric=ncloc
[mongo-writer-loc-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_mongo_writer
[mongo-writer-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_mongo_writer&metric=sqale_rating
[mongo-writer-mr-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_mongo_writer

[kre-py-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_py&metric=coverage
[kre-py-coverage-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_py 
[kre-py-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_py&metric=bugs
[kre-py-bugs-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_py
[kre-py-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_py&metric=ncloc
[kre-py-loc-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_py
[kre-py-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_py&metric=sqale_rating
[kre-py-mr-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_py

[kre-go-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_go&metric=coverage
[kre-go-coverage-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_go 
[kre-go-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_go&metric=bugs
[kre-go-bugs-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_go
[kre-go-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_go&metric=ncloc
[kre-go-loc-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_go
[kre-go-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_go&metric=sqale_rating
[kre-go-mr-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_go

[kre-entrypoint-coverage]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_entrypoint&metric=coverage
[kre-entrypoint-coverage-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_entrypoint 
[kre-entrypoint-bugs]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_entrypoint&metric=bugs
[kre-entrypoint-bugs-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_entrypoint
[kre-entrypoint-loc]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_entrypoint&metric=ncloc
[kre-entrypoint-loc-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_entrypoint
[kre-entrypoint-mr]: https://sonarcloud.io/api/project_badges/measure?project=konstellation_kre_entrypoint&metric=sqale_rating
[kre-entrypoint-mr-link]: https://sonarcloud.io/dashboard?id=konstellation_kre_entrypoint
