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
helm.sh/chart: {{ include "kre.chart" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Admin API labels
*/}}
{{- define "admin-api.labels" -}}
{{ include "kre.labels" . }}
{{ include "admin-api.selectorLabels" . }}
{{- end }}

{{/*
Admin API selector labels
*/}}
{{- define "admin-api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kre.name" . }}-admin-api
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Admin UI labels
*/}}
{{- define "admin-ui.labels" -}}
{{ include "kre.labels" . }}
{{ include "admin-ui.selectorLabels" . }}
{{- end }}

{{/*
Admin UI selector labels
*/}}
{{- define "admin-ui.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kre.name" . }}-admin-ui
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Chronograf labels
*/}}
{{- define "chronograf.labels" -}}
{{ include "kre.labels" . }}
{{ include "chronograf.selectorLabels" . }}
{{- end }}

{{/*
Chronograf selector labels
*/}}
{{- define "chronograf.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kre.name" . }}-chronograf
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* Fullname suffixed with k8s-manager */}}
{{- define "k8s-manager.fullname" -}}
{{- printf "%s-k8s-manager" (include "kre.fullname" .) -}}
{{- end }}

{{/*
k8s manager labels
*/}}
{{- define "k8s-manager.labels" -}}
{{ include "kre.labels" . }}
{{ include "k8s-manager.selectorLabels" . }}
{{- end }}

{{/*
k8s manager selector labels
*/}}
{{- define "k8s-manager.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kre.name" . }}-k8s-manager
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* Create the name of k8s-manager service account to use */}}
{{- define "k8s-manager.serviceAccountName" -}}
{{- if .Values.k8sManager.serviceAccount.create -}}
    {{ default (include "k8s-manager.fullname" .) .Values.k8sManager.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.k8sManager.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
nats labels
*/}}
{{- define "nats.labels" -}}
{{ include "kre.labels" . }}
{{ include "nats.selectorLabels" . }}
{{- end }}

{{/*
nats selector labels
*/}}
{{- define "nats.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kre.name" . }}-nats
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
nats host
*/}}
{{- define "nats.host" -}}
{{- printf "%s-nats" .Release.Name -}}
{{- end }}

{{/*
nats url
*/}}
{{- define "nats.url" -}}
{{- printf "%s:%d" (include "nats.host" .) (.Values.nats.client.port | int) -}}
{{- end -}}


{{/*
mongo-writer labels
*/}}
{{- define "mongo-writer.labels" -}}
{{ include "kre.labels" . }}
{{ include "mongo-writer.selectorLabels" . }}
{{- end }}

{{/*
mongo-writer selector labels
*/}}
{{- define "mongo-writer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kre.name" . }}-mongo-writer
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Mongo Express name
*/}}
{{- define "mongoExpress.name" -}}
{{ printf "%s-mongo-express" $.Release.Name }}
{{- end }}

{{/*
Mongo Express labels
*/}}
{{- define "mongoExpress.labels" -}}
{{ include "kre.labels" . }}
{{ include "mongoExpress.selectorLabels" . }}
{{- end }}

{{/*
Mongo Express selector labels
*/}}
{{- define "mongoExpress.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kre.name" . }}-mongo-express
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create InfluxDB URL.
*/}}
{{- define "kre-influxdb.influxURL" -}}
  {{- printf "http://%s-influxdb:8086" .Release.Name -}}
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

{{/* Fullname suffixed with nats-manager */}}
{{- define "nats-manager.fullname" -}}
{{- printf "%s-nats-manager" (include "kre.fullname" .) -}}
{{- end }}

{{/*
nats manager labels
*/}}
{{- define "nats-manager.labels" -}}
{{ include "kre.labels" . }}
{{ include "nats-manager.selectorLabels" . }}
{{- end }}

{{/*
nats manager selector labels
*/}}
{{- define "nats-manager.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kre.name" . }}-nats-manager
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
