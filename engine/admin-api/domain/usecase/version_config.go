package usecase

import (
	"sort"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
)

func makeConfigMapByKey(list []*entity.ConfigurationVariable) map[string]*entity.ConfigurationVariable {
	configMap := map[string]*entity.ConfigurationVariable{}
	for _, c := range list {
		configMap[c.Key] = c
	}
	return configMap
}

func (i *VersionInteractor) validateNewConfig(currentConfig, newValues []*entity.ConfigurationVariable) error {
	cMap := makeConfigMapByKey(currentConfig)
	for _, c := range newValues {
		_, ok := cMap[c.Key]
		if !ok {
			return ErrVersionConfigInvalidKey
		}
	}
	return nil
}

func generateNewConfig(oldConfig, newConfigVars []*entity.ConfigurationVariable) ([]*entity.ConfigurationVariable, bool) {
	newConfig := make([]*entity.ConfigurationVariable, len(oldConfig))
	isComplete := true
	newConfigVarsMap := makeConfigMapByKey(newConfigVars)

	// Only get values that already exists on oldConfig
	for i, current := range oldConfig {
		newConfig[i] = &entity.ConfigurationVariable{
			Key:  current.Key,
			Type: current.Type,
		}

		if newVar, ok := newConfigVarsMap[current.Key]; ok {
			newConfig[i].Value = newVar.Value
		} else {
			newConfig[i].Value = current.Value
		}

		if newConfig[i].Value == "" {
			isComplete = false
		}
	}

	return newConfig, isComplete
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
		Vars:      []*entity.ConfigurationVariable{},
	}
	for _, key := range krtYml.Config.Files {
		appendConfValue(&conf, currentConfig, key, entity.ConfigurationVariableTypeFile)
	}

	for _, key := range krtYml.Config.Variables {
		appendConfValue(&conf, currentConfig, key, entity.ConfigurationVariableTypeVariable)
	}

	return conf
}

func appendConfValue(conf *entity.VersionConfig, currentConfig map[string]string, key string, varType entity.ConfigurationVariableType) {
	val := ""
	if previousVal, ok := currentConfig[key]; ok {
		val = previousVal
	} else {
		conf.Completed = false
	}
	conf.Vars = append(conf.Vars, &entity.ConfigurationVariable{
		Key:   key,
		Value: val,
		Type:  varType,
	})
}
