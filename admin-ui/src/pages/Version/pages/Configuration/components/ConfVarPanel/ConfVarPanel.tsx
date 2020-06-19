import React, { useEffect, useRef } from 'react';

import Button from '../../../../../../components/Button/Button';
import { ConfVarPanelInfo } from '../../Configuration';
import { HotKeys } from 'react-hotkeys';
import IconClose from '@material-ui/icons/Close';
import IconKey from '@material-ui/icons/VpnKey';
import TypeFileIcon from '@material-ui/icons/InsertDriveFile';
import cx from 'classnames';
import keymaps from '../../../../../../keymaps';
import styles from './ConfVarPanel.module.scss';

type Props = {
  varPanel: ConfVarPanelInfo | null;
  closePanel: () => void;
};
function ConfVarPanel({ varPanel, closePanel }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (varPanel && panelRef.current) panelRef.current.focus();
  }, [varPanel]);

  const hotKeysHandlers = {
    CLOSE_PANEL: closePanel
  };

  return (
    <HotKeys
      keyMap={keymaps}
      handlers={hotKeysHandlers}
      className={cx({ [styles.show]: varPanel !== null })}
      innerRef={panelRef}
    >
      <div className={styles.bg} onClick={closePanel} />
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.header}>
            <span>Variable details</span>
            <Button Icon={IconClose} onClick={closePanel} label="" />
          </div>
          <div className={styles.varType}>
            <TypeFileIcon className="icon-regular" />
            File
          </div>
          <div className={styles.varKey}>
            <IconKey className="icon-regular" />
            {varPanel?.key}
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.title}>SOURCE CODE</div>
          <div className={styles.varValue}>{varPanel?.value}</div>
        </div>
      </div>
    </HotKeys>
  );
}

export default ConfVarPanel;
