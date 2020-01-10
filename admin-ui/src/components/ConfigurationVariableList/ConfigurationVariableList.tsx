import React from 'react';

import TextInput from '../../components/Form/TextInput/TextInput';
import IconKey from '@material-ui/icons/VpnKey';

import {
  ConfigurationVariable,
  ConfigurationVariableType
} from '../../graphql/models';

import cx from 'classnames';
import styles from './ConfigurationVariableList.module.scss';

function sortAlphabetically(
  a: ConfigurationVariable,
  b: ConfigurationVariable
) {
  if (a.variable < b.variable) return -1;
  if (b.variable < a.variable) return 1;
  return 0;
}

function capitalizeType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

interface VariableRowPros extends ConfigurationVariable {
  onType: Function;
  hide: boolean;
}

function VariableRow({ type, variable, value, onType, hide }: VariableRowPros) {
  function onValueUpdate(inputValue: string) {
    onType(variable, inputValue);
  }

  return (
    <div className={styles.row}>
      <div className={cx(styles.typeCol, styles.col1)}>
        <div className={styles.separator} />
        <div className={styles.typeColValue}>{capitalizeType(type)}</div>
      </div>
      <div className={cx(styles.variableCol, styles.col2)}>
        <IconKey className="icon-small" />
        <div>{variable}</div>
      </div>
      <div className={styles.col3}>
        <TextInput
          label=""
          error={''}
          onChange={onValueUpdate}
          onSubmit={() => {}}
          customStyles={styles.variableValue}
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
  data: ConfigurationVariable[];
  onType: Function;
  hideAll: boolean;
};

function ConfigurationVariableList({ data, onType, hideAll }: Props) {
  const sortedData = [...data].sort(sortAlphabetically);
  const variableRows = sortedData.map(
    (variable: ConfigurationVariable, idx: number) => (
      <VariableRow
        {...variable}
        onType={onType}
        key={`variableRow_${idx}`}
        hide={hideAll}
      />
    )
  );

  return (
    <div className={styles.container}>
      <div className={cx(styles.header, styles.row)}>
        <div className={styles.col1}>TYPE</div>
        <div className={styles.col2}>KEY</div>
        <div className={styles.col3}>VALUE</div>
      </div>
      {variableRows}
    </div>
  );
}

export default ConfigurationVariableList;
