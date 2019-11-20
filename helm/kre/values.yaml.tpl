# Default values for konstellation Runtime Environment.
mongodb:
  service:
    name: "mongodb"
  mongodbDatabase: "localKRE"
  mongodbUsername: "admin"
  mongodbPassword: "123456"

config:
  admin:
    apiAddress: ":80"
    frontendBaseURL: "http://localhost:3000"
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
    pullPolicy: Always
  service:
    port: 4000
  tls:
    enabled: false
    host: admin-api-kre.local
