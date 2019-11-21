# KRE helm chart

## Deploy dev environment

```bash
helm upgrade --install --namespace kre --values ./values-dev-local.yml kre ./kre
```

## Chart values

### Config 
Shared configuration for all components

| Parameter                                       | Description                                | Default                 |
| ----------------------------------------------- | ------------------------------------------ | ----------------------- |
| `config.admin.apiAddress`                       | Base internal URL for Api Server           | `:3000`                 |
| `config.admin.frontendBaseURL`                  | Base URL to connect from frontent          | `http://localhost:3000` |
| `config.admin.corsEnabled`                      | Activate CORS in Admin API                 | `true`                  |
| `config.smtp.enabled`                           | Activate SMTP                              | `false`                 |
| `config.smtp.sender`                            | SMTP Sender Email                          | <not_defined>           |
| `config.smtp.senderName`                        | SMTP Sender Name                           | <not_defined>           |
| `config.smtp.user`                              | SMTP User to connect                       | <not_defined>           |
| `config.smtp.pass`                              | SMTP Password to connect                   | <not_defined>           |
| `config.smtp.host`                              | SMTP Host to connect                       | <not_defined>           |
| `config.smtp.port`                              | SMTP Port to connect                       | <not_defined>           |
| `config.auth.verificationCodeDurationInMinutes` | User Verification Code Duration In Minutes | `1`                     |
| `config.auth.sessionDurationInHours`            | User Session Duration in Hours             | `1`                     |
| `config.auth.jwtSignSecret`                     | JWT Sign Secret Key                        | `jwt_secret`            |
| `config.auth.secureCookie`                      | Activate secure cookie                     | `false`                 |


### Subcharts values

Subchart info configuration
- [mongoDB stable chart](https://github.com/helm/charts/tree/master/stable/mongodb#parameters)

| Parameter                 | Description                                                 | Default    |
| ------------------------- | ----------------------------------------------------------- | ---------- |
| `mongodb.mongodbDatabase` | Database to create                                          | `localKRE` |
| `mongodb.mongodbUsername` | MongoDB custom user (mandatory if `mongodbDatabase` is set) | `admin`    |
| `mongodb.mongodbPassword` | MongoDB custom user password                                | `123456`   |

### Admin API
Specific configuration for Admin API

| Parameter                    | Description                                                                                               | Default                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `admin-api.image.repository` | Docker registry to download the admin-api image                                                           | `konstellation/kre-admin-api` |
| `admin-api.image.tag`        | Version of the admin-api Docker image to deploy                                                           | `latest`                      |
| `admin-api.image.pullPolicy` | Define when Kubernetes has to pull a Docker image                                                         | `IfNotPresent`                |
| `admin-api.service.port`     | TCP port where is going to listen the internal service                                                    | `4000`                        |
| `admin-api.tls.enabled`      | If we want to enable HTTPS access to the API. For this Cert Manager is required in the Kuberentes cluster | `false`                       |
| `admin-api.host`             | Public hostname to generate SSL certificate with Cert Manager                                             | `false`                       |


### Admin UI
Specific configuration for Admin UI

| Parameter                   | Description                                                                                              | Default                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `admin-ui.image.repository` | Docker registry to download the admin-ui image                                                           | `konstellation/kre-admin-ui` |
| `admin-ui.image.tag`        | Version of the admin-ui Docker image to deploy                                                           | `latest`                     |
| `admin-ui.image.pullPolicy` | Define when Kubernetes has to pull a Docker image                                                        | `IfNotPresent`               |
| `admin-ui.service.port`     | TCP port where is going to listen the internal service                                                   | `5000`                       |
| `admin-ui.tls.enabled`      | If we want to enable HTTPS access to the UI. For this Cert Manager is required in the Kuberentes cluster | `false`                      |
| `admin-ui.host`             | Public hostname to generate SSL certificate with Cert Manager                                            | `false`                      |
