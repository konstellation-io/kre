# Default values for konstellation Runtime Environment.
mongodb:
  service:
    name: "mongodb"
  mongodbDatabase: "localKRE"
  mongodbUsername: "admin"
  mongodbPassword: "123456"

config:
  admin:
    k8sManagerAddress: "k8s-manager:50051"
    apiAddress: ":80"
    frontendBaseURL: "http://api-kre.local"
    corsEnabled: true
  smtp:
    enabled: false
  auth:
    verificationCodeDurationInMinutes: 1
    sessionDurationInHours: 1
    jwtSignSecret: jwt_secret
    secureCookie: false

adminApi:
  image:
    repository: konstellation/kre-admin-api
    tag: ${ADMIN_API_IMAGE_TAG}
    pullPolicy: IfNotPresent
  service:
    port: 4000
  tls:
    enabled: false
  host: api-kre.local

adminUI:
  image:
    repository: konstellation/kre-admin-ui
    tag: ${ADMIN_UI_IMAGE_TAG}
    pullPolicy: IfNotPresent
  service:
    port: 5000
  tls:
    enabled: false
  host: admin-kre.local

k8sManager:
  image:
    repository: konstellation/kre-k8s-manager
    tag: ${K8S_MANAGER_IMAGE_TAG}
    pullPolicy: Always
  service:
    port: 50051
