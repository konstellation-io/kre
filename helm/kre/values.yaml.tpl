# Default values for konstellation Runtime Environment.

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
