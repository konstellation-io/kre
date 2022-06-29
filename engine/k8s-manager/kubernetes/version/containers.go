package version

import (
	"fmt"
	apiv1 "k8s.io/api/core/v1"
)

func (m *Manager) getFluentBitContainer(envVars []apiv1.EnvVar) apiv1.Container {
	return apiv1.Container{
		Name:            "fluent-bit",
		Image:           "fluent/fluent-bit:1.3",
		ImagePullPolicy: apiv1.PullIfNotPresent,
		Command: []string{
			"/fluent-bit/bin/fluent-bit",
			"-c",
			"/fluent-bit/etc/fluent-bit.conf",
			"-v",
		},
		Env: envVars,
		VolumeMounts: []apiv1.VolumeMount{
			{
				Name:      "version-conf-files",
				ReadOnly:  true,
				MountPath: "/fluent-bit/etc/fluent-bit.conf",
				SubPath:   "fluent-bit.conf",
			},
			{
				Name:      "version-conf-files",
				ReadOnly:  true,
				MountPath: "/fluent-bit/etc/parsers.conf",
				SubPath:   "parsers.conf",
			},
			{
				Name:      "app-log-volume",
				ReadOnly:  true,
				MountPath: "/var/log/app",
			},
		},
	}
}

func (m *Manager) getKRTFilesDownloaderContainer(envVars []apiv1.EnvVar) apiv1.Container {
	return apiv1.Container{
		Name:            "krt-files-downloader",
		Image:           fmt.Sprintf("%s:%s", m.config.KrtFilesDownloader.Image, m.config.KrtFilesDownloader.Tag),
		ImagePullPolicy: apiv1.PullPolicy(m.config.KrtFilesDownloader.PullPolicy),
		Env:             envVars,
		VolumeMounts: []apiv1.VolumeMount{
			m.getKRTFilesVolumeMount(),
		},
	}
}
