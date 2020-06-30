import {
  ConfVarPanelInfo,
  VersionConfigurationFormData
} from 'Pages/Version/pages/Configuration/Configuration';

import { GetConfigurationVariables_version_config_vars as ConfVar } from 'Graphql/queries/types/GetConfigurationVariables';
import ConfigurationVariableItem from './ConfigurationVariableItem';
import Message from '../Message/Message';
import React from 'react';
import cx from 'classnames';
import { sortBy } from 'lodash';
import styles from './ConfigurationVariableList.module.scss';

type Props = {
  data: ConfVar[];
  onType: Function;
  hideAll: boolean;
  filterValues: VersionConfigurationFormData;
  openVarPanel: (panelInfo: ConfVarPanelInfo) => void;
};

function ConfigurationVariableList({
  data,
  onType,
  hideAll,
  filterValues,
  openVarPanel
}: Props) {
  const { varName: filterName, type: filterType } = filterValues;
  const sortedData = sortBy(data, ['key']);
  const filteredData = sortedData.filter(
    variable =>
      (!filterName ||
        variable.key.toLowerCase().includes(filterName.toLowerCase())) &&
      (!filterType || variable.type === filterType)
  );

  function renderContent() {
    if (filteredData.length === 0)
      return <Message text="No variables for the actual filters" />;

    return filteredData.map((variable, idx) => (
      <ConfigurationVariableItem
        onType={onType}
        key={`${variable.key}${idx}`}
        hide={hideAll}
        variable={variable}
        openVarPanel={openVarPanel}
      />
    ));
  }

  return (
    <div className={styles.container}>
      <div className={cx(styles.header, styles.row)}>
        <div className={styles.col1}>Type</div>
        <div className={styles.col2}>Key</div>
        <div className={styles.col3}>Value</div>
      </div>
      <div className={styles.list}>{renderContent()}</div>
    </div>
  );
}

export default ConfigurationVariableList;
