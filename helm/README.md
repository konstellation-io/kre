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


### Subcharts values

Subchart info configuration
- [mongoDB stable chart](https://github.com/helm/charts/tree/master/stable/mongodb#parameters)

| Parameter                 | Description                                                 | Default    |
| ------------------------- | ----------------------------------------------------------- | ---------- |
| `mongodb.mongodbDatabase` | Database to create                                          | `localKRE` |
| `mongodb.mongodbUsername` | MongoDB custom user (mandatory if `mongodbDatabase` is set) | `admin`    |
| `mongodb.mongodbPassword` | MongoDB custom user password                                | `123456`   |



### Cert Manager
| Parameter                 | Description                                                                            | Default                                  |
| ------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| `certManager.enabled`     | Enable Cert Manager to validate certificates                                           | `false`                                  |
| `certManager.acme.server` | Default certificate authority server to validate certificates, more instructions below | `acme-v02.api.letsencrypt.org/directory` |
| `certManager.acme.email`  | Default email for the certificate owner                                                | `user@email.com`                         |

You can fill in the field `certManager.acme.server` with one of the following values depend of your environment:

**Production environment**
```
  certManager:
    acme:
        server: https://acme-v02.api.letsencrypt.org/directory
```
Rate limit of 50 per day on certificates request with a week block if the limit is passed.[+ info](https://letsencrypt.org/docs/rate-limits/)

No web-browser action required.

**Staging environment** 
```
  certManager:
    acme:
        server: https://acme-staging-v02.api.letsencrypt.org/directory
```
Rate limit of 1500 each three hours on certificates request.[+ Info](https://letsencrypt.org/docs/staging-environment/)



This option needs the following action from user to set-up the staging certification authority.

#### How add the fake certificate on chrome
- Download the certificate [Fake Certificate](https://letsencrypt.org/certs/fakeleintermediatex1.pem)
- Go to settings -> Search Certificates -> Manage Certificates -> Issuers Entities
- Import the previous certificate.
- Enable the first option.
- Reload the https://admin.<your-domain> page
- You have a certificate for any kre domain.