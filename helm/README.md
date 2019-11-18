# KRE helm chart

## Deploy dev environment

```bash
helm upgrade --install --namespace kre --values ./values-dev-local.yml kre ./kre
```

## Chart values

| Parameter                    | Description                                                                                               | Default                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `admin-api.image.repository` | Docker registry to download the admin-api image                                                           | `konstellation/kre-admin-api` |
| `admin-api.image.tag`        | Version of the admin-api Docker image to deploy                                                           | `latest`                      |
| `admin-api.image.pullPolicy` | Define when Kubernetes has to pull a Docker image                                                         | `Always`                      |
| `admin-api.service.port`     | TCP port where is going to listen the internal service                                                    | `3000`                        |
| `admin-api.tls.enabled`      | If we want to enable HTTPS access to the API. For this Cert Manager is required in the Kuberentes cluster | `false`                       |
| `admin-api.tls.host`         | Public hostname to generate SSL certificate with Cert Manager                                             | `false`                       |
