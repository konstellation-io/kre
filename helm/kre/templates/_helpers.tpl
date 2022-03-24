{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "kre.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "kre.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name used by the chart label.
*/}}
{{- define "kre.chart" -}}
{{- printf "%s" .Chart.Name | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "kre.labels" -}}
app.kubernetes.io/name: {{ include "kre.name" . }}
helm.sh/chart: {{ include "kre.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "runtime.name" -}}
{{- default .Release.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "runtime.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "runtime.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "runtime.labels" -}}
app.kubernetes.io/name: {{ include "runtime.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Create MongoDB URI.
*/}}
{{- define "runtime.mongoURI" -}}
  {{- printf "mongodb://%s:%s@kre-mongo-0:27017/admin?replicaSet=rs0" $.Values.mongodb.auth.adminUser $.Values.mongodb.auth.adminPassword -}}
{{- end -}}

{{/*
Create a default fully qualified InfluxDB service name for InfluxDB.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "kre-influxdb.fullname" -}}
{{- if .Values.influxdb.fullnameOverride -}}
{{- .Values.influxdb.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default "influxdb" .Values.influxdb.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Create a default fully qualified Kapacitor service name for Chronograph.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "kre-kapacitor.fullname" -}}
{{- $name := default "kapacitor" .Values.kapacitor.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create the default ingress controller annotations and let the user to specify custom ones
*/}}
{{- define "kre-admin-api.annotations" -}}
kubernetes.io/ingress.class: nginx
nginx.ingress.kubernetes.io/proxy-body-size: 100000m
nginx.org/client-max-body-size: 100000m
nginx.org/websocket-services: admin-api
{{- if .Values.adminApi.ingress.annotations }}
{{ toYaml .Values.adminApi.ingress.annotations }}
{{- end }}
{{- end -}}

{{- define "kre-admin-ui.annotations" -}}
kubernetes.io/ingress.class: nginx
{{- if .Values.adminUI.ingress.annotations }}
{{ toYaml .Values.adminUI.ingress.annotations }}
{{- end }}
{{- end -}}

{{- define "kre-entrypoint.annotations" -}}
kubernetes.io/ingress.class: nginx
{{- if .Values.adminUI.ingress.annotations }}
{{ toYaml .Values.adminUI.ingress.annotations }}
{{- end }}
{{- end -}}

{{- define "kre-entrypoint.grpc.ingress.annotations" -}}
kubernetes.io/ingress.class: "nginx"
nginx.ingress.kubernetes.io/proxy-body-size: 16m
nginx.ingress.kubernetes.io/backend-protocol: "GRPC"
# Based on this snippet:
#  https://github.com/kubernetes/ingress-nginx/issues/5609#issuecomment-634908849
nginx.ingress.kubernetes.io/server-snippet: |
  error_page 404 = @grpc_unimplemented;
  error_page 502 503 = @grpc_unavailable;
  location @grpc_unimplemented {
      add_header grpc-status 12;
      add_header grpc-message unimplemented;
      return 204;
  }
  location @grpc_unavailable {
      add_header grpc-status 14;
      add_header grpc-message unavailable;
      return 204;
  }
  default_type application/grpc;
{{- if .Values.entrypoint.grpc.ingress.annotations }}
{{ toYaml .Values.entrypoint.grpc.ingress.annotations }}
{{- end }}
{{- end -}}

{{- define "kre-entrypoint.ingress.annotations" -}}
kubernetes.io/ingress.class: "nginx"
nginx.ingress.kubernetes.io/default-backend: runtime-default-backend
nginx.ingress.kubernetes.io/custom-http-errors: "404,503,502"
{{- if .Values.entrypoint.ingress.annotations }}
{{ toYaml .Values.entrypoint.ingress.annotations }}
{{- end }}
{{- end -}}
