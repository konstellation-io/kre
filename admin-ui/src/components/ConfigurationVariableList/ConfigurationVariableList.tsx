import { sortBy, capitalize } from 'lodash';

import React from 'react';

import TextInput from '../../components/Form/TextInput/TextInput';
import IconKey from '@material-ui/icons/VpnKey';

import { GetConfigurationVariables_version_configurationVariables as ConfVar } from '../../graphql/queries/types/GetConfigurationVariables';
import { ConfigurationVariableType } from '../../graphql/types/globalTypes';

import cx from 'classnames';
import styles from './ConfigurationVariableList.module.scss';

interface VariableRowProps {
  variable: ConfVar;
  onType: Function;
  hide: boolean;
}

function VariableRow({
  variable: { type, key, value },
  onType,
  hide
}: VariableRowProps) {
  function onValueUpdate(inputValue: string) {
    onType(key, inputValue);
  }

  return (
    <div className={styles.row}>
      <div className={cx(styles.typeCol, styles.col1)}>
        <div className={styles.separator} />
        <div className={styles.typeColValue}>{capitalize(type)}</div>
      </div>
      <div className={cx(styles.variableCol, styles.col2)}>
        <IconKey className="icon-small" />
        <div>{key}</div>
      </div>
      <div className={styles.col3}>
        <TextInput
          label=""
          error={''}
          onChange={onValueUpdate}
          onSubmit={() => {}}
          customClassname={styles.variableValue}
          formValue={value}
          textArea={type === ConfigurationVariableType.FILE}
          limits={{
            minHeight: 95,
            maxHeight: 350
          }}
          showClearButton
          hidden={hide}
          lockHorizontalGrowth
        />
      </div>
    </div>
  );
}

type Props = {
  data: ConfVar[];
  onType: Function;
  hideAll: boolean;
};

function ConfigurationVariableList({ data, onType, hideAll }: Props) {
  const sortedData = sortBy(data, ['key']);
  const variableRows = sortedData.map((variable: ConfVar, idx: number) => (
    <VariableRow
      onType={onType}
      key={`variableRow_${idx}`}
      hide={hideAll}
      variable={variable}
    />
  ));

  return (
    <div className={styles.container}>
      <div className={cx(styles.header, styles.row)}>
        <div className={styles.col1}>TYPE</div>
        <div className={styles.col2}>KEY</div>
        <div className={styles.col3}>VALUE</div>
      </div>
      <div className={styles.list}>{variableRows}</div>
    </div>
  );
}

export default ConfigurationVariableList;
