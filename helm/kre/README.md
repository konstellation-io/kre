# KRE helm chart

Installs KRE kubernetes manifests.

## Prerequisites

* Nginx ingress controller. See [Ingress Controller](#ingress-controller).
* Helm 3+

### Chart compatibility matrix

|     KRE Version     | Kubernetes Version |
|:-------------------:|:------------------:|
|  0.x.y <= X < 1.x.y |        1.16        |
| 1.x.y <= X <= 5.x.y |  1.19 <= X <= 1.21 |
|      X >= 6.x.y     |      X >= 1.19     |

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

### From 6.X to 7.X

* MongoDB kubernetes resources have been renamed. That also renames the generated mongodb PVC that stores the MongoDB data. A database data migration will be necessary if you come from previous KRE releases.
* The Mongo Express credentials Kubernetes secret has been modified. This secret will only be created if you are deploying the chart for the first time because it uses Helm hooks to avoid secret recreation on chart's upgrades. If you come from a previous release of KRE, execute the following script before uograding:

```shell
#!/bin/bash
RELEASE_NAME=<release_name>
NAMESPACE=<release_namespace>
ME_CONFIG_MONGODB_ADMINUSERNAME=$(kubectl -n $NAMESPACE get secret kre-mongo-express-secret -o jsonpath='{.data.ME_CONFIG_MONGODB_AUTH_USERNAME}'| base64 -d)
ME_CONFIG_MONGODB_ADMINPASSWORD=$(kubectl -n $NAMESPACE get secret kre-mongo-express-secret -o jsonpath='{.data.ME_CONFIG_MONGODB_AUTH_PASSWORD}'| base64 -d)
kubectl create secret -n $NAMESPACE generic --from-literal ME_CONFIG_MONGODB_ADMINUSERNAME=$ME_CONFIG_MONGODB_ADMINUSERNAME --from-literal ME_CONFIG_MONGODB_ADMINPASSWORD=$ME_CONFIG_MONGODB_ADMINPASSWORD $RELEASE_NAME-mongo-express -o yaml --dry-run=client | kubectl apply -f -
kubectl -n $NAMESPACE annotate secret $RELEASE_NAME-mongo-express helm.sh/hook='pre-install' helm.sh/hook-delete-policy='before-hook-creation'
```

### From 5.X to 6.X

* Minimal Kubernetes supported version is now **v1.19.x**

### From 3.X to 5.X

* Moved `.Values.entrypoints` block to `.Values.k8sManager.generatedEntrypoints` in `values.yaml`.

* k8s-manager Service Account settings have been moved to `k8sManager.serviceAccount` in `values.yaml`

### From 2.X to 3.X

* Removed `mongodb.mongodbUsername` and `mongodb.mongodbPassword` from **values.yaml** in favour of `mongodb.auth.adminUser` and `mongodb.auth.adminpassword`
* Removed `rbac.createServiceAccount` and `rbac.serviceAccount`
* Added `rbac.create` (defaults to true) and added Service Account related block under `k8sManager.serviceAccount`
* Removed other unused values from `values.yaml`.

Check commits [1fab33b](https://github.com/konstellation-io/kre/pull/593/commits/1fab33b8351cae317753017373ac2dab4817c36f) and [a280847](https://github.com/konstellation-io/kre/pull/598/commits/59e7365350d67d30984a2554a28d0241cf74f13e) for more details.

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
