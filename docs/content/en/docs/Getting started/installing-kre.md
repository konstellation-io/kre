---
title: "Installing KRE"
linkTitle: "Installing KRE"
date: 2020-08-04
description: >
  Overview of installation choices for various environments
weight: 20
---

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
