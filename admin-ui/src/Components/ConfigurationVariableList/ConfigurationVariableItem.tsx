import Button from '../Button/Button';
import { GetConfigurationVariables_version_configurationVariables as ConfVar } from 'Graphql/queries/types/GetConfigurationVariables';
import { ConfVarPanelInfo } from 'Pages/Version/pages/Configuration/Configuration';
import { ConfigurationVariableType } from 'Graphql/types/globalTypes';
import IconKey from '@material-ui/icons/VpnKey';
import React from 'react';
import ShowMoreIcon from '@material-ui/icons/ArrowForward';
import TextInput from 'Components/Form/TextInput/TextInput';
import TypeFileIcon from '@material-ui/icons/InsertDriveFile';
import TypeVarIcon from '@material-ui/icons/Code';
import { capitalize } from 'lodash';
import styles from './ConfigurationVariableList.module.scss';

interface Props {
  variable: ConfVar;
  onType: Function;
  hide: boolean;
  openVarPanel: (panelInfo: ConfVarPanelInfo) => void;
}

export default function ConfigurationVariableItem({
  variable: { type, key, value },
  openVarPanel,
  onType,
  hide
}: Props) {
  function onValueUpdate(inputValue: string) {
    onType(key, inputValue);
  }

  const TypeIcon =
    type === ConfigurationVariableType.FILE ? TypeFileIcon : TypeVarIcon;

  return (
    <div className={styles.row}>
      <div className={styles.col1}>
        <div className={styles.typeCol}>
          <TypeIcon className="icon-small" />
          <div className={styles.typeColValue}>{capitalize(type)}</div>
        </div>
      </div>
      <div className={styles.col2}>
        <div className={styles.variableCol}>
          <IconKey className="icon-small" />
          <div>{key}</div>
        </div>
      </div>
      <div className={styles.col3}>
        <TextInput
          onChange={onValueUpdate}
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
      {type === ConfigurationVariableType.FILE && value !== '' && (
        <div className={styles.showMore}>
          <Button
            Icon={ShowMoreIcon}
            label=""
            onClick={() => openVarPanel({ type, key, value })}
          />
        </div>
      )}
    </div>
  );
}
