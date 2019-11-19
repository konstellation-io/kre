# KRE helm chart

## Deploy dev environment

```bash
helm upgrade --install --namespace kre --values ./values-dev-local.yml kre ./kre
```

## Chart values

### Config 
Shared configuration for all components

| Parameter                                       | Description                                | Default                   |
| ----------------------------------------------- | ------------------------------------------ | ------------------------- |
| `config.admin.apiAddress`                       | Base internal URL for Api Server           | `:4000`                   |
| `config.admin.frontendBaseURL`                  | Base URL to connect from frontent          | `http://localhost:3000`   |
| `config.admin.corsEnabled`                      | Activate CORS in Admin API                 | `true`                    |
| `config.smtp.enabled`                           | Activate SMTP                              | `false`                   |
| `config.smtp.sender`                            | SMTP Sender Email                          | <not_defined>             |
| `config.smtp.senderName`                        | SMTP Sender Name                           | <not_defined>             |
| `config.smtp.user`                              | SMTP User to connect                       | <not_defined>             |
| `config.smtp.pass`                              | SMTP Password to connect                   | <not_defined>             |
| `config.smtp.host`                              | SMTP Host to connect                       | <not_defined>             |
| `config.smtp.port`                              | SMTP Port to connect                       | <not_defined>             |
| `config.auth.verificationCodeDurationInMinutes` | User Verification Code Duration In Minutes | `1`                       |
| `config.auth.sessionDurationInHours`            | User Session Duration in Hours             | `1`                       |
| `config.auth.jwtSignSecret`                     | JWT Sign Secret Key                        | `jwt_secret`              |
| `config.auth.secureCookie`                      | Activate secure cookie                     | `false`                   |
| `config.mongodb.address`                        | MongoDB Connection Address                 | `mongodb://mongodb:27017` |
| `config.mongodb.dbName`                         | MongoDB Database Name                      | `localKRE`                |




### Admin API
Specific configuration for Admin API

| Parameter                    | Description                                                                                               | Default                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `admin-api.image.repository` | Docker registry to download the admin-api image                                                           | `konstellation/kre-admin-api` |
| `admin-api.image.tag`        | Version of the admin-api Docker image to deploy                                                           | `latest`                      |
| `admin-api.image.pullPolicy` | Define when Kubernetes has to pull a Docker image                                                         | `Always`                      |
| `admin-api.service.port`     | TCP port where is going to listen the internal service                                                    | `3000`                        |
| `admin-api.tls.enabled`      | If we want to enable HTTPS access to the API. For this Cert Manager is required in the Kuberentes cluster | `false`                       |
| `admin-api.tls.host`         | Public hostname to generate SSL certificate with Cert Manager                                             | `false`                       |
