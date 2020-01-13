import { get, omit } from 'lodash';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery, useMutation } from '@apollo/react-hooks';

import HorizontalBar from '../../../../components/Layout/HorizontalBar/HorizontalBar';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import SettingsHeader from '../../../Settings/components/SettingsHeader';
import ConfigurationVariableList from '../../../../components/ConfigurationVariableList/ConfigurationVariableList';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';

import {
  GET_CONFIGURATION_VARIABLES,
  GetVersionConfigVars,
  GetVersionConfigResponse,
  UpdateVersionConfigVars,
  UPDATE_VERSION_CONFIGURATION
} from './RuntimeConfiguration.graphql';
import { ConfigurationVariable, Version } from '../../../../graphql/models';

import styles from './RuntimeConfiguration.module.scss';

/**
 * cache policy adds a non-desired _typename field to ConfigurationVariable elements.
 * This function cleans this field as it is not accepter by the input.
 * Also removes type field
 */
function cleanVars(
  variables: ConfigurationVariable[]
): ConfigurationVariable[] {
  return variables.map(
    (variable: ConfigurationVariable) =>
      omit(variable, ['__typename', 'type']) as ConfigurationVariable
  );
}

function RuntimeConfiguration() {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [hideAll, setHideAll] = useState(true);
  const [configurationVariables, setConfigurationVariables] = useState<
    ConfigurationVariable[]
  >([]);
  const { versionId } = useParams();
  const { data, loading, error } = useQuery<
    GetVersionConfigResponse,
    GetVersionConfigVars
  >(GET_CONFIGURATION_VARIABLES, {
    variables: { versionId: versionId || undefined },
    fetchPolicy: 'no-cache'
  });
  const [updateConfiguration, { loading: mutationLoading }] = useMutation<
    Version,
    UpdateVersionConfigVars
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
      data.updateVersionConfiguration.configurationVariables
    );
  }

  function getContent() {
    const noVars: boolean =
      (data && data.version.configurationVariables.length === 0) || false;

    if (noVars) {
      return (
        <div className={styles.noConfig}>
          This version has no configuration variables
        </div>
      );
    }

    return (
      <>
        <ConfigurationVariableList
          data={configurationVariables}
          hideAll={hideAll}
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
      (confVar: ConfigurationVariable) => confVar.key === variable
    )[0];
    const variableIdx = configurationVariables.indexOf(targetVariable);
    const newConfigurationsVariables: ConfigurationVariable[] = [
      ...configurationVariables
    ];
    newConfigurationsVariables[variableIdx].value = inputValue;

    setConfigurationVariables(newConfigurationsVariables);
  }

  function makeUpdate(): void {
    closeModal();

    if (versionId) {
      updateConfiguration({
        variables: {
          input: {
            versionId: versionId,
            configurationVariables: cleanVars(configurationVariables)
          }
        }
      });
    } else {
      console.error('Cannot update version, there is no versionId');
    }
  }

  function openModal(): void {
    setShowConfirmationModal(true);
  }

  function closeModal(): void {
    setShowConfirmationModal(false);
  }

  function toggleVariablesVisibility(): void {
    setHideAll(!hideAll);
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
        {showConfirmationModal && (
          <Modal
            title="VERSION WILL BE RESTARTED"
            message="After updating this configuration, the version will be restarted (this process may take several seconds)"
            actionButtonLabel="ACCEPT"
            onAccept={makeUpdate}
            onClose={closeModal}
            blocking
          />
        )}
      </div>
      <HorizontalBar>
        <Button
          label="SAVE CHANGES"
          onClick={openModal}
          disabled={mutationLoading || loading}
          primary
        />
        <Button
          label={`${hideAll ? 'SHOW' : 'HIDE'} ALL`}
          onClick={toggleVariablesVisibility}
        />
      </HorizontalBar>
    </div>
  );
}

export default RuntimeConfiguration;
