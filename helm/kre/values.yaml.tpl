# Default values for konstellation Runtime Environment.
developmentMode: false

config:
  baseDomainName: "local"
  admin:
    apiHost: ${KRE_ADMIN_API_HOST}
    frontendBaseURL: ${KRE_ADMIN_FRONTEND_BASE_URL}
    corsEnabled: true
    userEmail: dev@local.local
  smtp:
    enabled: false
  auth:
    verificationCodeDurationInMinutes: 1
    jwtSignSecret: jwt_secret
    secureCookie: false
    cookieDomain: kre.local
  runtime:
    sharedStorageClass: standard
    sharedStorageSize: 2Gi
    nats_streaming:
      storage:
        className: standard
        size: 1Gi
    mongodb:
      persistentVolume:
        enabled: true
        storageClass: standard
        size: 5Gi
    chronograf:
      persistentVolume:
        enabled: true
        storageClass: standard
        size: 1Gi
    influxdb:
      persistentVolume:
        enabled: true
        storageClass: standard
        size: 5Gi

adminApi:
  image:
    repository: konstellation/kre-admin-api
    tag: ${ADMIN_API_IMAGE_TAG}
    pullPolicy: IfNotPresent
  tls:
    enabled: false
  host: api.kre.local
  storage:
    class: standard
    size: 1Gi
    path: /admin-api-files

adminUI:
  image:
    repository: konstellation/kre-admin-ui
    tag: ${ADMIN_UI_IMAGE_TAG}
    pullPolicy: IfNotPresent
  tls:
    enabled: false
  host: admin.kre.local

k8sManager:
  image:
    repository: konstellation/kre-k8s-manager
    tag: ${K8S_MANAGER_IMAGE_TAG}
    pullPolicy: IfNotPresent


mongodb:
  service:
    name: "mongodb"
  mongodbDatabase: "localKRE"
  mongodbUsername: "admin"
  mongodbPassword: "123456"
  rootCredentials:
    username: admin
    password: "123456"
  storage:
    className: standard
    size: 3G
  volumePermissions:
    enabled: ${DEVELOPMENT_MODE}
    image:
      registry: docker.io
      repository: debian
      tag: buster-slim
  initConfigMap:
    name: kre-mongo-init-script

certManager:
  enabled: false
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: user@email.com

prometheus-operator:
  enabled: true
  grafana:
    enabled: false
