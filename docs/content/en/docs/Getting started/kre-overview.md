---
title: "KRE Overview"
linkTitle: "KRE Overview"
date: 2020-08-04
description: >
  How KRE helps you to deploy your ML solutions
weight: 10
---

Konstellation Runtime Engine is an application that allow to run AI/ML models for inference based on the content of a
 `.krt` file. 

|  Component  | Description  |
|  ---------  | ------------ |
|  Admin UI  | |
|  Admin API  | |
| K8s Manager | |
|  Runtime API  | |
|  K8s Runtime Operator | |
|  Runner Python  | |
|  Runner Go  | |


## Architecture

KRE is designed based on a microservice pattern to be run on top of a Kubernetes cluster.

In the following diagram is described the main components and the relationship each other.

![Architecture](.github/images/kre-architecture.jpg)


Below are described the main concepts of KRE.

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
