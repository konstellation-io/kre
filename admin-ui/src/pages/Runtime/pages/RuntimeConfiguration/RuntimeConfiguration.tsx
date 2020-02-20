import { cloneDeep, get, isEqual, omit } from 'lodash';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useMutation, useQuery } from '@apollo/react-hooks';

import HorizontalBar from '../../../../components/Layout/HorizontalBar/HorizontalBar';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import SettingsHeader from '../../../Settings/components/SettingsHeader';
import ConfigurationVariableList from '../../../../components/ConfigurationVariableList/ConfigurationVariableList';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';

import { loader } from 'graphql.macro';
import {
  GetConfigurationVariables_version_configurationVariables as ConfigurationVariable,
  GetConfigurationVariables,
  GetConfigurationVariablesVariables
} from '../../../../graphql/queries/types/GetConfigurationVariables';
import {
  UpdateVersionConfiguration,
  UpdateVersionConfigurationVariables
} from '../../../../graphql/mutations/types/UpdateVersionConfiguration';
import { VersionStatus } from '../../../../graphql/types/globalTypes';

import styles from './RuntimeConfiguration.module.scss';
import { VersionRouteParams } from '../../../../constants/routes';

const GetConfVariablesQuery = loader(
  '../../../../graphql/queries/getConfigurationVariables.graphql'
);
const UpdateVersionConfigurationMutation = loader(
  '../../../../graphql/mutations/updateVersionConfiguration.graphql'
);

const statusWithConfirmationModal = [
  VersionStatus.PUBLISHED,
  VersionStatus.STARTED
];

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

type Props = {
  refetchVersion: Function;
};
function RuntimeConfiguration({ refetchVersion }: Props) {
  const [initialConfiguration, setInitialConfiguration] = useState<
    ConfigurationVariable[]
  >([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [hideAll, setHideAll] = useState(true);
  const [configurationVariables, setConfigurationVariables] = useState<
    ConfigurationVariable[]
  >([]);
  const { versionId } = useParams<VersionRouteParams>();
  const { data, loading, error } = useQuery<
    GetConfigurationVariables,
    GetConfigurationVariablesVariables
  >(GetConfVariablesQuery, {
    variables: { versionId }
  });
  const [updateConfiguration, { loading: mutationLoading }] = useMutation<
    UpdateVersionConfiguration,
    UpdateVersionConfigurationVariables
  >(UpdateVersionConfigurationMutation, {
    onCompleted: onCompleteUpdate
  });

  useEffect(() => {
    if (data) {
      updateConfigurationVariables(
        get(data, 'version.configurationVariables', [])
      );
    }
  }, [data]);

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  function updateConfigurationVariables(data: ConfigurationVariable[]) {
    setConfigurationVariables(data);
    setInitialConfiguration(cloneDeep(data));
  }

  // TODO: CHECK FOR ERRORS
  function onCompleteUpdate(data: any) {
    updateConfigurationVariables(
      data.updateVersionConfiguration.configurationVariables
    );
    refetchVersion();
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

  function configurationHasChanged(): boolean {
    return !isEqual(initialConfiguration, configurationVariables);
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

  function onSave(): void {
    const versionStatus = data && data.version.status;
    const showModal =
      versionStatus && statusWithConfirmationModal.includes(versionStatus);
    if (showModal) {
      openModal();
    } else {
      makeUpdate();
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <SettingsHeader title="Configuration" />
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
          onClick={onSave}
          disabled={mutationLoading || loading || !configurationHasChanged()}
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
