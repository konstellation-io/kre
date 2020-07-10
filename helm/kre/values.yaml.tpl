# Default values for konstellation Runtime Environment.
developmentMode: false

config:
  baseDomainName: "local"
  admin:
    k8sManagerAddress: "k8s-manager:50051"
    apiAddress: ":80"
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


adminApi:
  image:
    repository: konstellation/kre-admin-api
    tag: ${ADMIN_API_IMAGE_TAG}
    pullPolicy: IfNotPresent
  service:
    port: 4000
  tls:
    enabled: false
  host: api.kre.local

adminUI:
  image:
    repository: konstellation/kre-admin-ui
    tag: ${ADMIN_UI_IMAGE_TAG}
    pullPolicy: IfNotPresent
  service:
    port: 5000
  tls:
    enabled: false
  host: admin.kre.local

k8sManager:
  image:
    repository: konstellation/kre-k8s-manager
    tag: ${K8S_MANAGER_IMAGE_TAG}
    pullPolicy: IfNotPresent
  service:
    port: 50051


mongodb:
  service:
    name: "mongodb"
  mongodbDatabase: "localKRE"
  mongodbUsername: "admin"
  mongodbPassword: "123456"
  volumePermissions:
    enabled: true
  initConfigMap:
    name: kre-mongo-init-script

certManager:
  enabled: false
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: user@email.com

prometheusOperator:
  enabled: true
  grafana:
    enabled: false
