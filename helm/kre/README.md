# KRE helm chart

Installs KRE kubernetes manifests.

## Prerequisites

* Kubernetes 1.19+
* Nginx ingress controller. See [Ingress Controller](#ingress-controller).
* Helm 3+

## Install chart
```bash
$ helm repo add konstellation-io https://charts.konstellation.io
$ helm repo update
$ helm install [RELEASE_NAME] konstellation-io/kre
```

*See [helm repo](https://helm.sh/docs/helm/helm_repo/) and [helm install](https://helm.sh/docs/helm/helm_install/) for command documentation.*

## Dependencies

By default this chart installs [InfluxDB](https://github.com/influxdata/helm-charts/tree/master/charts/influxdb) and [Kapacitor](https://github.com/influxdata/helm-charts/tree/master/charts/kapacitor) chart as dependency.

However, **Kapacitor** is an optional dependency. To disable a it during installation, set `kapacitor.enabled`, to `false`.

## Uninstall chart

```bash
$ helm uninstall [RELEASE_NAME]
```

This removes all the Kubernetes components associated with the chart and deletes the release.

*See [helm uninstall](https://helm.sh/docs/helm/helm_uninstall/) for command documentation.*

## Upgrading Chart

```bash
$ helm upgrade [RELEASE_NAME] konstellation.io/kre
```

*See [helm upgrade](https://helm.sh/docs/helm/helm_upgrade/) for command documentation.* 

### Upgrading an existing Release to a new major version

A major chart version change (like v0.15.3 -> v1.0.0) indicates that there is an incompatible breaking change needing
manual actions.

### From 1.X to 2.X

This major version comes with the following changes:
* **Resource label refactor**: Labels have changed for some resources, so the following resources must be manually deleted before updating.

    Affected deployment resources:
    * Admin UI
    * Admin API
    * Chronograf
    * k8s-manager
    * MongoDB 
    * MongoExpress
    
    Affected statefulset resources:
    * MongoDB
    * NATS

    The commit that introduces the changes is [located here](https://github.com/konstellation-io/kre/pull/585).

* **Ingress annotations are taken from values.yaml**: Now default ingress annotations are specified from [values.yaml](values.yaml) file. If additional ingress annotations are required, those must be appended to the default ones via extra values files or by using the `--set` argument.

* **Openshift routes have been removed**: All Openshift route manifests have been removed from chart. Extend it if you are planning to install it on Openshift platforms.

* **Prometheus Operator have been removed**: Application functionallity has been decoupled from Prometheus so this component is no longer necessary. Use [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) for platform monitoring if needed.

## Chart customization
You can check all requirements and possible chart values [here](./CHART.md).

## Ingress controller

This Chart has been developed using **Nginx Ingress Controller**. So using the default ingress annotations ensures its correct operation. .

*See [values.yaml](values.yaml) file and [Nginx Ingress controller](https://kubernetes.github.io/ingress-nginx/) for additional documentation**.

However, users could use any other ingress controller (for example, [Traefik](https://doc.traefik.io/traefik/providers/kubernetes-ingress/)). In that case, ingress configurations equivalent to the default ones must be povided.

Notice that even using equivalent ingress configurations the correct operation of the appliance is not guaranteed.
