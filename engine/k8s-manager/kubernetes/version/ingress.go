package version

import (
	"context"
	"encoding/base64"
	"fmt"

	"gopkg.in/yaml.v2"
	v1 "k8s.io/api/networking/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	apiVersion  = "networking.k8s.io/v1"
	kindIngress = "Ingress"
)

func (m *Manager) ensureIngressCreated(ctx context.Context, name, runtimeID, activeServiceName string) error {
	m.logger.Infof("Creating ingress %s", name)
	ingressExists, err := m.checkIngressExists(ctx, name)
	if err != nil {
		return err
	}
	if ingressExists {
		return nil
	}
	ingress, err := m.getIngressDefinition(runtimeID, name, activeServiceName)
	if err != nil {
		return err
	}
	_, err = m.clientset.NetworkingV1().Ingresses(m.config.Kubernetes.Namespace).Create(ctx, ingress, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	return nil
}

func (m *Manager) checkIngressExists(ctx context.Context, name string) (bool, error) {
	_, err := m.clientset.NetworkingV1().Ingresses(m.config.Kubernetes.Namespace).Get(ctx, name, metav1.GetOptions{})
	if errors.IsNotFound(err) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (m *Manager) getIngressDefinition(runtimeID, name, activeServiceName string) (*v1.Ingress, error) {
	annotations, err := m.getIngressAnnotations()
	if err != nil {
		return nil, err
	}
	labels := map[string]string{
		"runtime-id": runtimeID,
	}
	entrypointHost := fmt.Sprintf("%s-entrypoint.%s", runtimeID, m.config.BaseDomainName)
	ingress := &v1.Ingress{
		TypeMeta: metav1.TypeMeta{
			APIVersion: apiVersion,
			Kind:       kindIngress,
		},
		ObjectMeta: metav1.ObjectMeta{
			Name:        name,
			Labels:      labels,
			Annotations: annotations,
		},
		Spec: m.getIngressSpec(entrypointHost, activeServiceName),
	}
	if m.config.Entrypoint.TLS.IsEnabled {
		ingress.Spec.TLS = []v1.IngressTLS{{
			Hosts:      []string{entrypointHost},
			SecretName: m.config.Entrypoint.TLS.CertSecretName,
		}}
	}
	return ingress, nil
}

func (m *Manager) getIngressAnnotations() (map[string]string, error) {
	annotations, err := base64.StdEncoding.DecodeString(m.config.Entrypoint.IngressAnnotationsBase64)
	if err != nil {
		return nil, err
	}
	var annotationsMap map[string]string
	err = yaml.Unmarshal(annotations, &annotationsMap)
	if err != nil {
		return nil, err
	}
	return annotationsMap, nil
}

func (m *Manager) getIngressSpec(entrypointHost, activeServiceName string) v1.IngressSpec {
	pathType := v1.PathTypePrefix
	return v1.IngressSpec{
		Rules: []v1.IngressRule{{
			Host: entrypointHost,
			IngressRuleValue: v1.IngressRuleValue{
				HTTP: &v1.HTTPIngressRuleValue{
					Paths: []v1.HTTPIngressPath{{
						Path:     "/",
						PathType: &pathType,
						Backend: v1.IngressBackend{
							Service: &v1.IngressServiceBackend{
								Name: activeServiceName,
								Port: v1.ServiceBackendPort{
									Name: "grpc",
								},
							},
						},
					}},
				},
			},
		}},
	}
}
