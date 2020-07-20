module github.com/konstellation-io/kre/admin/k8s-manager

go 1.14

require (
	github.com/ghodss/yaml v1.0.0
	github.com/golang/protobuf v1.4.0
	github.com/imdario/mergo v0.3.8 // indirect
	github.com/kelseyhightower/envconfig v1.4.0
	github.com/konstellation-io/kre/libs/simplelogger v0.0.0-20200611081512-198d96c2a13a
	github.com/prometheus/client_golang v1.6.0
	github.com/prometheus/common v0.9.1
	github.com/stretchr/testify v1.5.1
	google.golang.org/grpc v1.28.0
	gopkg.in/yaml.v2 v2.2.8
	k8s.io/api v0.0.0-20191115135540-bbc9463b57e5
	k8s.io/apimachinery v0.0.0-20191116203941-08e4eafd6d11
	k8s.io/client-go v0.0.0-20191115215802-0a8a1d7b7fae
	k8s.io/utils v0.0.0-20191114200735-6ca3b61696b6 // indirect
)
