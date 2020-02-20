package usecase

import (
	"sort"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/krt"
)

func makeConfigMapByKey(list []*entity.ConfigVar) map[string]*entity.ConfigVar {
	configMap := map[string]*entity.ConfigVar{}
	for _, c := range list {
		configMap[c.Key] = c
	}
	return configMap
}

func (i *VersionInteractor) validateNewConfig(currentConfig, newValues []*entity.ConfigVar) error {
	cMap := makeConfigMapByKey(currentConfig)
	for _, c := range newValues {
		_, ok := cMap[c.Key]
		if !ok {
			return ErrVersionConfigInvalidKey
		}
	}
	return nil
}

func generateNewConfig(currentConfig, newValues []*entity.ConfigVar) ([]*entity.ConfigVar, bool) {
	isComplete := false
	cMap := makeConfigMapByKey(currentConfig)

	// Only get values that already exists on currentConfig
	configToUpdate := make([]*entity.ConfigVar, len(currentConfig))
	totalValues := 0
	for x, c := range currentConfig {
		configToUpdate[x] = c
		nc := cMap[c.Key]
		if nc == nil {
			if configToUpdate[x].Value != "" {
				totalValues += 1
			}
			continue
		}
		nc.Type = c.Type
		configToUpdate[x] = nc
		if nc.Value != "" {
			totalValues += 1
		}
	}
	if len(currentConfig) == totalValues {
		isComplete = true
	}
	return configToUpdate, isComplete
}

func readExistingConf(versions []*entity.Version) map[string]string {
	if len(versions) == 0 {
		return map[string]string{}
	}

	// Sort version list by creation date descending
	sort.Slice(versions, func(i, j int) bool {
		return versions[i].CreationDate.Unix() < versions[j].CreationDate.Unix()
	})
	currentConfig := map[string]string{}
	for _, v := range versions {
		for _, c := range v.Config.Vars {
			if c.Value != "" {
				currentConfig[c.Key] = c.Value
			}
		}
	}
	return currentConfig
}

func fillNewConfWithExisting(currentConfig map[string]string, krtYml *krt.Krt) entity.VersionConfig {
	// mark config as completed unless it finds an empty value
	conf := entity.VersionConfig{
		Completed: true,
		Vars:      []*entity.ConfigVar{},
	}
	for _, key := range krtYml.Config.Files {
		appendConfValue(&conf, currentConfig, key, "FILE")
	}

	for _, key := range krtYml.Config.Variables {
		appendConfValue(&conf, currentConfig, key, "VARIABLE")
	}

	return conf
}

func appendConfValue(conf *entity.VersionConfig, currentConfig map[string]string, key, varType string) {
	val := ""
	if previousVal, ok := currentConfig[key]; ok {
		val = previousVal
	} else {
		conf.Completed = false
	}
	conf.Vars = append(conf.Vars, &entity.ConfigVar{
		Key:   key,
		Value: val,
		Type:  varType,
	})
}
