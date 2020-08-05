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

The following diagram describes the main components and the relationship each other:

{{< imgproc architecture Resize "1000x" >}}
KRE Architecture.
{{< /imgproc >}}


Below are described the main concepts of KRE.

### KRT

Konstellation Runtime Transport is a compressed file with the definition of a runtime version, included the code to 
run and a YAML file called `kre.yml` with the desired workflows definitions.

The base structure of a `kre.yml` is as follows:

```yaml
version: example-project
description: This is an example of a ML project.
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
 - name: etl
   image: konstellation/kre-py:latest
   src: src/etl/execute_etl.py
 
 - name: execute-dl-model
   image: konstellation/kre-py:latest
   src: src/execute_model/execute_model.py

 - name: create-output
   image: konstellation/kre-py:latest
   src: src/output/output.py

 - name: client-metrics
   image: konstellation/kre-go:latest
   src: bin/client-metrics

workflows:
  - name: prediction
    entrypoint: MakePrediction
    sequential:
      - etl
      - execute-dl-model
      - create-output
  - name: save-client-metrics
    entrypoint: SaveClientMetric
    sequential:
      - client-metrics
```
