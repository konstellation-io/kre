import { get } from 'lodash';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery, useMutation } from '@apollo/react-hooks';

import HorizontalBar from '../../../../components/Layout/HorizontalBar/HorizontalBar';
import Button from '../../../../components/Button/Button';
import SettingsHeader from '../../../Settings/components/SettingsHeader';
import ConfigurationVariableList from '../../../../components/ConfigurationVariableList/ConfigurationVariableList';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';

import {
  GET_CONFIGURATION_VARIABLES,
  GetConfigurationVariablesVars,
  GetConfigurationVariablesResponse,
  UpdateVersionConfigurationVars,
  UpdateVersionConfigurationResponse,
  UPDATE_VERSION_CONFIGURATION
} from './RuntimeConfiguration.graphql';
import { ConfigurationVariable } from '../../../../graphql/models';

import styles from './RuntimeConfiguration.module.scss';

/**
 * cache policy adds a non-desired _typename field to ConfigurationVariable elements.
 * This function cleans this field as it is not accepter by the input.
 */
function cleanVars(
  variables: ConfigurationVariable[]
): ConfigurationVariable[] {
  return variables.map(
    (variable: ConfigurationVariable) =>
      ({
        variable: variable.variable,
        value: variable.value,
        type: variable.type
      } as ConfigurationVariable)
  );
}

function RuntimeConfiguration() {
  const [configurationVariables, setConfigurationVariables] = useState<
    ConfigurationVariable[]
  >([]);
  const { versionId } = useParams();
  const { data, loading, error } = useQuery<
    GetConfigurationVariablesResponse,
    GetConfigurationVariablesVars
  >(GET_CONFIGURATION_VARIABLES, {
    variables: { versionId },
    fetchPolicy: 'no-cache'
  });
  const [updateConfiguration, { loading: mutationLoading }] = useMutation<
    UpdateVersionConfigurationResponse,
    UpdateVersionConfigurationVars
  >(UPDATE_VERSION_CONFIGURATION, {
    onCompleted: onCompleteUpdate,
    fetchPolicy: 'no-cache'
  });

  useEffect(() => {
    if (data) {
      setConfigurationVariables(
        get(data, 'version.configurationVariables', [])
      );
    }
  }, [data]);

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  // TODO: CHECK FOR ERRORS
  function onCompleteUpdate(data: any) {
    setConfigurationVariables(
      data.updateVersionConfiguration.version.configurationVariables
    );
  }

  function getContent() {
    if (configurationVariables.length === 0) {
      return <div>This version has no configuration variables</div>;
    }

    return (
      <>
        <ConfigurationVariableList
          data={configurationVariables}
          onType={onType}
        />
        {mutationLoading && (
          <div className={styles.spinnerUpdating}>
            <SpinnerCircular />
          </div>
        )}
      </>
    );
  }

  /**
   * Updates the value of the modified configuration variable.
   */
  function onType(variable: string, inputValue: string): void {
    const targetVariable: ConfigurationVariable = configurationVariables.filter(
      (confVar: ConfigurationVariable) => confVar.variable === variable
    )[0];
    const variableIdx = configurationVariables.indexOf(targetVariable);
    const newConfigurationsVariables: ConfigurationVariable[] = [
      ...configurationVariables
    ];
    newConfigurationsVariables[variableIdx].value = inputValue;

    setConfigurationVariables(newConfigurationsVariables);
  }

  function onSave(): void {
    updateConfiguration({
      variables: {
        input: {
          id: versionId || '',
          configurationVariables: cleanVars(configurationVariables)
        }
      }
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <SettingsHeader
          title="Configuration"
          subtitle="Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec viverra eleifend
        lacus, vitae ullamcorper metus. Sed sollicitudin ipsum quis nunc sollicitudin ultrices.
        Donec euismod scelerisque ligula. Maecenas eu varius risus, eu aliquet arcu. Curabitur
        fermentum suscipit est, tincidunt."
        />
        {getContent()}
      </div>
      <HorizontalBar>
        <Button
          label="SAVE CHANGES"
          onClick={onSave}
          disabled={mutationLoading || loading}
          primary
        />
      </HorizontalBar>
    </div>
  );
}

export default RuntimeConfiguration;
