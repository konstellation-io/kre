# Default values for konstellation.

api:
  image:
    repository: konstellation/api
    tag: ${API_IMAGE_TAG}
    pullPolicy: Always
  service:
    host: api-konstellation.local
    port: 32501
