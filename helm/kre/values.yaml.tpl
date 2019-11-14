# Default values for konstellation Runtime Environment.

api:
  image:
    repository: konstellation/kre-api
    tag: ${ADMIN_API_IMAGE_TAG}
    pullPolicy: Always
  service:
    port: 3000
  tls:
    enabled: false
    host: api-kre.local
