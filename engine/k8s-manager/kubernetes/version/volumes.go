package version

import (
	"fmt"

	apiv1 "k8s.io/api/core/v1"
)

func (m *Manager) getCommonVolumes(runtimeId, versionName string) []apiv1.Volume {
	return []apiv1.Volume{
		{
			Name: basePathKRTName,
			VolumeSource: apiv1.VolumeSource{
				EmptyDir: &apiv1.EmptyDirVolumeSource{},
			},
		},
		{
			Name: "version-conf-files",
			VolumeSource: apiv1.VolumeSource{
				ConfigMap: &apiv1.ConfigMapVolumeSource{
					LocalObjectReference: apiv1.LocalObjectReference{
						Name: fmt.Sprintf("%s-%s-conf-files", runtimeId, versionName),
					},
				},
			},
		},
		{
			Name: "app-log-volume",
			VolumeSource: apiv1.VolumeSource{
				EmptyDir: &apiv1.EmptyDirVolumeSource{},
			},
		},
	}
}

func (m *Manager) getAppLogVolumeMount() apiv1.VolumeMount {
	return apiv1.VolumeMount{
		Name:      "app-log-volume",
		MountPath: "/var/log/app",
		ReadOnly:  false,
	}
}

func (m *Manager) getKRTFilesVolumeMount() apiv1.VolumeMount {
	return apiv1.VolumeMount{
		Name:      basePathKRTName,
		ReadOnly:  false,
		MountPath: basePathKRT,
	}
}
