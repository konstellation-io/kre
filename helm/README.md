# KRE helm chart

## Deploy dev environment

```bash
helm upgrade --install --namespace kre --values ./values-dev-local.yml kre ./kre
```

## Chart values

Parameter | Description | Default
--------- | ----------- | -------
`api.image.repository` | Docker registry to download the api image | `konstellation/kre-api`
`api.image.tag` | Version of the api Docker image to deploy | `latest`
`api.image.pullPolicy` | Define when Kubernetes has to pull a Docker image | `Always`
`api.service.port` | TCP port where is going to listen the internal service | `3000`
`api.tls.enabled` | If we want to enable HTTPS access to the API. For this Cert Manager is required in the Kuberentes cluster | `false`
`api.tls.host` | Public hostname to generate SSL certificate with Cert Manager | `false`
