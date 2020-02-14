FROM alpine:latest AS builder

ARG DEVELOPMENT_MODE=false

RUN apk add --update bash gettext coreutils
COPY helm-charts/kre-chart/values.yaml.tpl /values.yaml.tpl
COPY helm-charts/replace_env_path.sh /replace_env_path.sh
RUN ./replace_env_path.sh

FROM quay.io/operator-framework/helm-operator:v0.15.1

COPY watches.yaml ${HOME}/watches.yaml
COPY helm-charts/ ${HOME}/helm-charts/
COPY --from=builder /values.yaml ${HOME}/helm-charts/kre-chart/values.yaml
