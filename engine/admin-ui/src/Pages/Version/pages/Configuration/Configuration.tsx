import {
  Button,
  ErrorMessage,
  HorizontalBar,
  ModalContainer,
  ModalLayoutInfo,
  SpinnerCircular
} from 'kwc';
import {
  GetConfigurationVariables_version_config_vars as ConfigurationVariable,
  GetConfigurationVariables,
  GetConfigurationVariablesVariables
} from 'Graphql/queries/types/GetConfigurationVariables';
import {
  ConfigurationVariableType,
  ConfigurationVariablesInput,
  UpdateConfigurationInput
} from 'Graphql/types/globalTypes';
import React, { useEffect, useState } from 'react';
import Tag, { TagTypes } from 'Components/Tag/Tag';
import {
  UpdateVersionConfiguration,
  UpdateVersionConfigurationVariables
} from 'Graphql/mutations/types/UpdateVersionConfiguration';
import { cloneDeep, isEqual, pick } from 'lodash';
import { registerMany, unregisterMany } from 'Utils/react-forms';
import { useMutation, useQuery } from '@apollo/client';

import ConfVarPanel from './components/ConfVarPanel/ConfVarPanel';
import ConfigurationFilters from './ConfigurationFilters';
import ConfigurationVariableList from 'Components/ConfigurationVariableList/ConfigurationVariableList';
import Message from 'Components/Message/Message';
import SettingsHeader from '../../../Settings/components/SettingsHeader/SettingsHeader';
import { VersionRouteParams } from 'Constants/routes';
import { VersionStatus } from 'Graphql/types/globalTypes';
import { loader } from 'graphql.macro';
import styles from './Configuration.module.scss';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';

const GetConfVariablesQuery = loader(
  'Graphql/queries/getConfigurationVariables.graphql'
);
const UpdateVersionConfigurationMutation = loader(
  'Graphql/mutations/updateVersionConfiguration.graphql'
);

export type ConfVarPanelInfo = {
  key: string;
  type: ConfigurationVariableType.FILE;
  value: string;
};

const statusWithConfirmationModal = [
  VersionStatus.PUBLISHED,
  VersionStatus.STARTED
];

function formatConfVars(
  variables: ConfigurationVariable[]
): ConfigurationVariablesInput[] {
  return variables.map(
    (variable: ConfigurationVariable) =>
      pick(variable, ['key', 'value']) as ConfigurationVariable
  );
}

export type VersionConfigurationFormData = {
  type: ConfigurationVariableType;
  varName: string;
};

function Configuration() {
  const [varPanel, setVarPanel] = useState<ConfVarPanelInfo | null>(null);
  const [initialConfiguration, setInitialConfiguration] = useState<
    ConfigurationVariable[]
  >([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [configurationVariables, setConfigurationVariables] = useState<
    ConfigurationVariable[]
  >([]);
  const { versionName } = useParams<VersionRouteParams>();
  const { data, loading, error } = useQuery<
    GetConfigurationVariables,
    GetConfigurationVariablesVariables
  >(GetConfVariablesQuery, {
    variables: { versionName }
  });
  const [updateConfiguration, { loading: mutationLoading }] = useMutation<
    UpdateVersionConfiguration,
    UpdateVersionConfigurationVariables
  >(UpdateVersionConfigurationMutation, {
    onError: e => console.error(`updateConfiguration: ${e}`),
    onCompleted: onCompleteUpdate
  });

  const { register, unregister, setValue, watch } = useForm<
    VersionConfigurationFormData
  >();

  useEffect(() => {
    const fields = ['type', 'varName'];
    registerMany(register, fields);

    return () => unregisterMany(unregister, fields);
  }, [register, unregister]);

  useEffect(() => {
    if (data) {
      updateConfigurationVariables(data.version.config.vars);
    }
  }, [data]);

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  function updateConfigurationVariables(d: ConfigurationVariable[]) {
    setConfigurationVariables(cloneDeep(d));
    setInitialConfiguration(cloneDeep(d));
  }

  // TODO: CHECK FOR ERRORS
  function onCompleteUpdate(d: UpdateVersionConfiguration) {
    updateConfigurationVariables(d.updateVersionConfiguration.config.vars);
  }

  function getContent() {
    const noVars: boolean =
      (data && data.version.config.vars.length === 0) || false;

    if (noVars) {
      return <Message text="This version has no configuration variables" />;
    }

    return (
      <>
        <ConfigurationVariableList
          data={configurationVariables}
          filterValues={watch()}
          hideAll={!showAll}
          onType={onType}
          openVarPanel={openPanel}
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

    if (versionName) {
      updateConfiguration({
        variables: {
          input: {
            versionName,
            configurationVariables: formatConfVars(configurationVariables)
          } as UpdateConfigurationInput
        } as UpdateVersionConfigurationVariables
      });
    } else {
      console.error('Cannot update version, there is no versionId');
    }
  }

  function openModal() {
    setShowConfirmationModal(true);
  }

  function closeModal() {
    setShowConfirmationModal(false);
  }

  function openPanel(panelInfo: ConfVarPanelInfo) {
    setVarPanel(panelInfo);
  }
  function closePanel() {
    setVarPanel(null);
  }

  function toggleVariablesVisibility() {
    setShowAll(!showAll);
  }

  function onSave() {
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
        <SettingsHeader>Configuration</SettingsHeader>
        <ConfVarPanel varPanel={varPanel} closePanel={closePanel} />
        <ConfigurationFilters
          filterValues={watch()}
          setValue={setValue}
          showAll={showAll}
          toggleShowAll={toggleVariablesVisibility}
        />
        {getContent()}
        {showConfirmationModal && (
          <ModalContainer
            title="VERSION WILL BE RESTARTED"
            actionButtonLabel="RESTART"
            onAccept={makeUpdate}
            onCancel={closeModal}
            confirmationTimer={3}
            autofocusOnAccept
            blocking
            warning
          >
            <ModalLayoutInfo>
              <>
                <Tag type={TagTypes.WARNING}>WARNING</Tag>
                After updating this configuration, the version will be restarted
                (this process may take several seconds)
              </>
            </ModalLayoutInfo>
          </ModalContainer>
        )}
      </div>
      <HorizontalBar className={styles.bottomBar}>
        <Button
          label="SAVE CHANGES"
          onClick={onSave}
          disabled={mutationLoading || loading || !configurationHasChanged()}
          primary
        />
      </HorizontalBar>
    </div>
  );
}

export default Configuration;
