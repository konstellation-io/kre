# Default values for konstellation Runtime Environment.
config:
  admin:
    apiAddress: ":4000"
    frontendBaseURL: "http://localhost:3000"
    corsEnabled: true
  smtp:
    enabled: false
  auth:
    verificationCodeDurationInMinutes: 1
    sessionDurationInHours: 1
    jwtSignSecret: jwt_secret
    secureCookie: false
  mongodb:
    address: "mongodb://mongodb:27017"
    dbName: "localKRE"

adminApi:
  image:
    repository: konstellation/kre-admin-api
    tag: ${ADMIN_API_IMAGE_TAG}
    pullPolicy: Always
  service:
    port: 3000
  tls:
    enabled: false
    host: admin-api-kre.local
