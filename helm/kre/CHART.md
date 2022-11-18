# kre

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://helm.influxdata.com/ | influxdb | 4.8.1 |
| https://helm.influxdata.com/ | kapacitor | 1.4.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| adminApi.affinity | object | `{}` | Assign custom affinity rules to the Admin API pods |
| adminApi.host | string | `"api.kre.local"` | Hostname |
| adminApi.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| adminApi.image.repository | string | `"konstellation/kre-admin-api"` | Image repository |
| adminApi.image.tag | string | `"latest"` | Image tag |
| adminApi.ingress.annotations | object | See `adminApi.ingress.annotations` in [values.yaml](./values.yaml) | Ingress annotations |
| adminApi.ingress.className | string | `"nginx"` | The name of the ingress class to use |
| adminApi.logLevel | string | `"INFO"` | Default application log level |
| adminApi.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. |
| adminApi.storage.class | string | `"standard"` | Storage class name |
| adminApi.storage.path | string | `"/admin-api-files"` | Persistent volume mount point. This will define Admin API app workdir too. |
| adminApi.storage.size | string | `"1Gi"` | Storage class size |
| adminApi.tls.enabled | bool | `false` | Whether to enable TLS |
| adminApi.tolerations | list | `[]` | Tolerations for use with node taints |
| adminUI.affinity | object | `{}` | Assign custom affinity rules to the Admin UI pods |
| adminUI.host | string | `"admin.kre.local"` | Hostname |
| adminUI.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| adminUI.image.repository | string | `"konstellation/kre-admin-ui"` | Image repository |
| adminUI.image.tag | string | `"latest"` | Image tag |
| adminUI.ingress.annotations | object | `{}` | Ingress annotations |
| adminUI.ingress.className | string | `"nginx"` | The name of the ingress class to use |
| adminUI.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. |
| adminUI.tls.enabled | bool | `false` | Whether to enable TLS |
| adminUI.tolerations | list | `[]` | Tolerations for use with node taints |
| chronograf.affinity | object | `{}` | Assign custom affinity rules to the Chronograf pods |
| chronograf.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. |
| chronograf.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| chronograf.image.repository | string | `"chronograf"` | Image repository |
| chronograf.image.tag | string | `"1.8.4"` | Image tag |
| chronograf.persistence.accessMode | string | `"ReadWriteOnce"` | Access mode for the volume |
| chronograf.persistence.enabled | bool | `true` | Whether to enable persistence |
| chronograf.persistence.size | string | `"2Gi"` | Storage size |
| chronograf.persistence.storageClass | string | `"standard"` | Storage class name |
| chronograf.tolerations | list | `[]` | Tolerations for use with node taints |
| config.admin.apiHost | string | `"api.kre.local"` | Api Hostname for Admin UI and Admin API |
| config.admin.corsEnabled | bool | `true` | Whether to enable CORS on Admin API |
| config.admin.frontendBaseURL | string | `"http://admin.kre.local"` | Frontend Base URL for Admin API |
| config.admin.userEmail | string | `"dev@local.local"` | Email address for sending notifications |
| config.auth.apiTokenSecret | string | `"api_token_secret"` | API token secret |
| config.auth.cookieDomain | string | `"kre.local"` | Admin API secure cookie domain |
| config.auth.jwtSignSecret | string | `"jwt_secret"` | JWT Sign secret |
| config.auth.secureCookie | bool | `false` | Whether to enable secure cookie for Admin API |
| config.auth.verificationCodeDurationInMinutes | int | `1` | Verification login link duration |
| config.baseDomainName | string | `"local"` | Base domain name for Admin API and K8S Manager apps |
| config.mongodb.connectionString.secretKey | string | `""` | The name of the secret key that contains the MongoDB connection string. |
| config.mongodb.connectionString.secretName | string | `""` | The name of the secret that contains a key with the MongoDB connection string. |
| config.smtp.enabled | bool | `false` | Whether to enable SMTP server connection |
| config.smtp.pass | string | `""` | SMTP server password |
| config.smtp.user | string | `""` | SMTP server user |
| developmentMode | bool | `false` | Whether to setup developement mode |
| influxdb.address | string | `"http://kre-influxdb/"` |  |
| influxdb.affinity | object | `{}` | Assign custom affinity rules to the InfluxDB pods # ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ # |
| influxdb.config.http | object | `{"auth-enabled":false,"enabled":true,"flux-enabled":true}` | [Details](https://docs.influxdata.com/influxdb/v1.8/administration/config/#http) |
| influxdb.image.tag | string | `"1.8.1"` | Image tag |
| influxdb.initScripts.enabled | bool | `true` | Boolean flag to enable and disable initscripts. See https://github.com/influxdata/helm-charts/tree/master/charts/influxdb#configure-the-chart for more info |
| influxdb.initScripts.scripts | object | `{"init.iql":"CREATE DATABASE \"kre\"\n"}` | Init scripts |
| influxdb.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. # ref: https://kubernetes.io/docs/user-guide/node-selection/ # |
| influxdb.persistence.accessMode | string | `"ReadWriteOnce"` | Access mode for the volume |
| influxdb.persistence.enabled | bool | `true` | Whether to enable persistence. See https://github.com/influxdata/helm-charts/tree/master/charts/influxdb#configure-the-chart for more info |
| influxdb.persistence.size | string | `"10Gi"` | Storage size |
| influxdb.persistence.storageClass | string | `"standard"` | Storage class name |
| k8sManager.affinity | object | `{}` | Assign custom affinity rules to the K8S Manager pods |
| influxdb.tolerations | list | `[]` | Tolerations for use with node taints # ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ # |
| k8sManager.generatedEntrypoints.ingress.annotations | object | See `entrypoints.ingress.annotations` in [values.yaml](./values.yaml) | The annotations that all the generated ingresses for the entrypoints will have |
| k8sManager.generatedEntrypoints.ingress.className | string | `"nginx"` | The ingressClassName to use for the enypoints' generated ingresses |
| k8sManager.generatedEntrypoints.ingress.tls.secretName | string | If not defined, every created ingress will use an autogenerated certificate name based on the deployed runtimeId and .Values.config.baseDomainName. | TLS certificate secret name. If defined, wildcard for the current application domain must be used. |
| k8sManager.generatedEntrypoints.tls | bool | `false` | Wether to enable tls |
| k8sManager.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| k8sManager.image.repository | string | `"konstellation/kre-k8s-manager"` | Image repository |
| k8sManager.image.tag | string | `"latest"` | Image tag |
| k8sManager.krtFilesDownloader.image.pullPolicy | string | `"Always"` | Image pull policy |
| k8sManager.krtFilesDownloader.image.repository | string | `"konstellation/krt-files-downloader"` | Image repository |
| k8sManager.krtFilesDownloader.image.tag | string | `"latest"` | Image tag |
| k8sManager.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. |
| k8sManager.serviceAccount.annotations | object | `{}` | The Service Account annotations |
| k8sManager.serviceAccount.create | bool | `true` | Whether to create the Service Account |
| k8sManager.serviceAccount.name | string | `""` | The name of the service account. @default: A pre-generated name based on the chart relase fullname sufixed by `-k8s-manager` |
| k8sManager.tolerations | list | `[]` | Tolerations for use with node taints |
| kapacitor.enabled | bool | `false` | Whether to enable Kapacitor |
| kapacitor.persistence.enabled | bool | `false` | Whether to enable persistence [Details](https://github.com/influxdata/helm-charts/blob/master/charts/kapacitor/values.yaml) |
| mongoExpress.affinity | object | `{}` | Assign custom affinity rules to the Mongo Express pods |
| mongoExpress.connectionString.secretKey | string | `""` | The name of the secret key that contains the MongoDB connection string. |
| mongoExpress.connectionString.secretName | string | `""` | The name of the secret that contains a key with the MongoDB connection string. |
| mongoExpress.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| mongoExpress.image.repository | string | `"mongo-express"` | Image repository |
| mongoExpress.image.tag | string | `"0.54.0"` | Image tag |
| mongoExpress.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. |
| mongoExpress.tolerations | list | `[]` | Tolerations for use with node taints |
| mongoWriter.affinity | object | `{}` | Assign custom affinity rules to the Mongo Writter pods |
| mongoWriter.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| mongoWriter.image.repository | string | `"konstellation/kre-mongo-writer"` | Image repository |
| mongoWriter.image.tag | string | `"latest"` | Image tag |
| mongoWriter.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. |
| mongoWriter.tolerations | list | `[]` | Tolerations for use with node taints |
| nameOverride | string | `""` | Provide a name in place of kre for `app.kubernetes.io/name` labels |
| nats.affinity | object | `{}` | Assign custom affinity rules to the InfluxDB pods # ref: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ # |
| nats.client.port | int | `4222` | Port for client connections |
| nats.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| nats.image.repository | string | `"nats"` | Image repository |
| nats.image.tag | string | `"2.8.4"` | Image tag |
| nats.jetstream.memStorage.enabled | bool | `true` | Whether to enable memory storage for Jetstream |
| nats.jetstream.memStorage.size | string | `"1Gi"` | Memory storage max size for JetStream |
| nats.jetstream.storage.enabled | bool | `true` | Whether to enable a PersistentVolumeClaim for Jetstream |
| nats.jetstream.storage.size | string | `"1Gi"` | Storage size for the Jetstream PersistentVolumeClaim. Notice this is also used for the Jetstream storage limit configuration even if PVC creation is disabled |
| nats.jetstream.storage.storageClassName | string | `"standard"` | Storage class name for the Jetstream PersistentVolumeClaim |
| nats.jetstream.storage.storageDirectory | string | `"/data"` | Directory to use for JetStream storage when using a PersistentVolumeClaim |
| nats.logging.debug | bool | `false` | Whether to enable logging debug mode |
| nats.logging.logtime | bool | `true` | Timestamp log entries |
| nats.logging.trace | bool | `false` | Whether to enable logging trace mode |
| nats.nodeSelector | object | `{}` | Define which Nodes the Pods are scheduled on. # ref: https://kubernetes.io/docs/user-guide/node-selection/ # |
| nats.tolerations | list | `[]` | Tolerations for use with node taints # ref: https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ # |
| natsManager.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| natsManager.image.repository | string | `"konstellation/kre-nats-manager"` | Image repository |
| natsManager.image.tag | string | `"latest"` | Image tag |
| rbac.create | bool | `true` | Whether to create the roles for the services that could use custom Service Accounts |
